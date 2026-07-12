import { db } from "../db/client";
import { teams, users } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";
import { AppError, forbidden, notFound, conflict, badRequest } from "../utils/apiError";
import crypto from "crypto";
import { logger } from "../config/logger";

function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(crypto.randomInt(chars.length));
  }
  return code;
}

async function generateUniqueJoinCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateCode();
    const existing = await db.query.teams.findFirst({
      where: eq(teams.joinCode, code),
    });
    if (!existing) return code;
  }
  throw new AppError("SERVER_ERROR", "Failed to generate a unique join code", 500);
}

export async function createTeam(userId: string, name: string) {
  // Check if user is already on a team
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true, currentTeamId: true },
  });

  if (!user) throw notFound("User", userId);
  if (user.currentTeamId) {
    throw conflict("You are already on an active team.", "ALREADY_ON_TEAM");
  }

  const joinCode = await generateUniqueJoinCode();

  return await db.transaction(async (tx) => {
    const [team] = await tx
      .insert(teams)
      .values({
        name,
        joinCode,
        status: "incomplete",
        score: 0,
      })
      .returning();

    if (!team) {
      throw new AppError("SERVER_ERROR", "Failed to create team", 500);
    }

    await tx
      .update(users)
      .set({
        currentTeamId: team.id,
        teamRole: "leader",
        teamJoinedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return team;
  });
}

export async function getMyTeam(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { currentTeamId: true, teamRole: true },
  });

  if (!user || !user.currentTeamId) return null;

  const team = await db.query.teams.findFirst({
    where: eq(teams.id, user.currentTeamId),
  });

  if (!team) return null;

  const members = await db.query.users.findMany({
    where: eq(users.currentTeamId, team.id),
    columns: {
      id: true,
      username: true,
      avatarUrl: true,
      fullName: true,
      teamRole: true,
      teamJoinedAt: true,
    },
  });

  const memberList = members.map((m) => ({
    userId: m.id,
    username: m.fullName || m.username,
    avatarUrl: m.avatarUrl,
    role: m.teamRole,
    joinedAt: m.teamJoinedAt,
  }));

  // Only expose join_code if leader
  const isLeader = user.teamRole === "leader";

  return {
    id: team.id,
    name: team.name,
    status: team.status,
    score: team.score,
    members: memberList,
    joinCode: isLeader ? team.joinCode : undefined,
  };
}

export async function getTeamPublic(teamId: string) {
  const team = await db.query.teams.findFirst({
    where: eq(teams.id, teamId),
  });

  if (!team) throw notFound("Team", teamId);

  const members = await db.query.users.findMany({
    where: eq(users.currentTeamId, teamId),
    columns: {
      id: true,
      username: true,
      fullName: true,
      teamRole: true,
    },
  });

  const leader = members.find((m) => m.teamRole === "leader");

  return {
    id: team.id,
    name: team.name,
    leader: leader ? (leader.fullName || leader.username) : null,
    memberCount: members.length,
  };
}

export async function getTeamMembers(teamId: string) {
  const team = await db.query.teams.findFirst({
    where: eq(teams.id, teamId),
  });
  if (!team) throw notFound("Team", teamId);

  const members = await db.query.users.findMany({
    where: eq(users.currentTeamId, teamId),
    columns: {
      id: true,
      username: true,
      avatarUrl: true,
      fullName: true,
      teamRole: true,
      teamJoinedAt: true,
    },
  });

  return members.map((m) => ({
    userId: m.id,
    username: m.fullName || m.username,
    avatarUrl: m.avatarUrl,
    role: m.teamRole,
    joinedAt: m.teamJoinedAt,
  }));
}

export async function updateTeamName(userId: string, teamId: string, name: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { currentTeamId: true, teamRole: true },
  });

  if (!user || user.currentTeamId !== teamId || user.teamRole !== "leader") {
    throw forbidden("Only the team leader can update the team name.");
  }

  const [updatedTeam] = await db
    .update(teams)
    .set({ name, updatedAt: new Date() })
    .where(eq(teams.id, teamId))
    .returning();

  return updatedTeam;
}

export async function regenerateJoinCode(userId: string, teamId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { currentTeamId: true, teamRole: true },
  });

  if (!user || user.currentTeamId !== teamId || user.teamRole !== "leader") {
    throw forbidden("Only the team leader can regenerate the join code.");
  }

  const newCode = await generateUniqueJoinCode();

  const [updatedTeam] = await db
    .update(teams)
    .set({ joinCode: newCode, updatedAt: new Date() })
    .where(eq(teams.id, teamId))
    .returning();

  if (!updatedTeam) {
    throw new AppError("SERVER_ERROR", "Failed to update join code", 500);
  }

  return { joinCode: updatedTeam.joinCode };
}

export async function disbandTeam(userId: string, teamId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { currentTeamId: true, teamRole: true },
  });

  if (!user || user.currentTeamId !== teamId || user.teamRole !== "leader") {
    throw forbidden("Only the team leader can disband the team.");
  }

  await db.transaction(async (tx) => {
    // Reset all team members to solo mode
    await tx
      .update(users)
      .set({
        currentTeamId: null,
        teamRole: null,
        teamJoinedAt: null,
      })
      .where(eq(users.currentTeamId, teamId));

    // Delete the team record
    await tx.delete(teams).where(eq(teams.id, teamId));
  });

  logger.info({ teamId, disbandedBy: userId }, "Team disbanded");
}

export async function joinTeamByCode(userId: string, code: string) {
  // Check if user is already on a team
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) throw notFound("User", userId);
  if (user.currentTeamId) {
    throw conflict("You are already on an active team.", "ALREADY_ON_TEAM");
  }

  const team = await db.query.teams.findFirst({
    where: eq(teams.joinCode, code.toUpperCase().trim()),
  });

  if (!team) {
    throw new AppError("INVALID_JOIN_CODE", "The join code does not exist.", 404);
  }

  // Count current members
  const members = await db.query.users.findMany({
    where: eq(users.currentTeamId, team.id),
    columns: { id: true },
  });

  if (members.length >= 3) {
    throw new AppError("TEAM_FULL", "This team already has the maximum of 3 members.", 400);
  }

  const nextSize = members.length + 1;
  const status = nextSize >= 2 ? "active" : "incomplete";

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({
        currentTeamId: team.id,
        teamRole: "member",
        teamJoinedAt: new Date(),
      })
      .where(eq(users.id, userId));

    await tx
      .update(teams)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(teams.id, team.id));
  });

  logger.info({ teamId: team.id, joinedUser: userId }, "User joined team");
  return { success: true };
}

export async function leaveTeam(userId: string, teamId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user || user.currentTeamId !== teamId) {
    throw forbidden("You do not belong to this team.");
  }

  if (user.teamRole === "leader") {
    throw badRequest("Leaders cannot leave a team. You must transfer leadership first.", "LEADER_LEAVE_BLOCKED");
  }

  // Check remaining member count
  const remainingMembers = await db.query.users.findMany({
    where: and(eq(users.currentTeamId, teamId), sql`${users.id} != ${userId}`),
    columns: { id: true },
  });

  const nextSize = remainingMembers.length;
  const status = nextSize >= 2 ? "active" : "incomplete";

  await db.transaction(async (tx) => {
    // Reset leaving user
    await tx
      .update(users)
      .set({
        currentTeamId: null,
        teamRole: null,
        teamJoinedAt: null,
      })
      .where(eq(users.id, userId));

    // Update team status
    await tx
      .update(teams)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(teams.id, teamId));
  });

  logger.info({ teamId, leftUser: userId }, "User left team");
}

export async function removeTeamMember(userId: string, teamId: string, targetMemberId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { currentTeamId: true, teamRole: true },
  });

  if (!user || user.currentTeamId !== teamId || user.teamRole !== "leader") {
    throw forbidden("Only the team leader can remove members.");
  }

  const targetUser = await db.query.users.findFirst({
    where: eq(users.id, targetMemberId),
    columns: { currentTeamId: true },
  });

  if (!targetUser || targetUser.currentTeamId !== teamId) {
    throw badRequest("The user is not a member of your team.");
  }

  if (targetMemberId === userId) {
    throw badRequest("You cannot remove yourself. Disband the team instead.");
  }

  // Check remaining members
  const remainingMembers = await db.query.users.findMany({
    where: and(eq(users.currentTeamId, teamId), sql`${users.id} != ${targetMemberId}`),
    columns: { id: true },
  });

  const nextSize = remainingMembers.length;
  const status = nextSize >= 2 ? "active" : "incomplete";

  await db.transaction(async (tx) => {
    // Reset kicked user
    await tx
      .update(users)
      .set({
        currentTeamId: null,
        teamRole: null,
        teamJoinedAt: null,
      })
      .where(eq(users.id, targetMemberId));

    // Update team status
    await tx
      .update(teams)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(teams.id, teamId));
  });

  logger.info({ teamId, kickedUser: targetMemberId, kickedBy: userId }, "Member kicked from team");
}

export async function transferLeadership(userId: string, teamId: string, newLeaderId: string) {
  const leaderUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { currentTeamId: true, teamRole: true },
  });

  if (!leaderUser || leaderUser.currentTeamId !== teamId || leaderUser.teamRole !== "leader") {
    throw forbidden("Only the team leader can transfer leadership.");
  }

  if (newLeaderId === userId) {
    throw badRequest("You are already the team leader.");
  }

  const targetUser = await db.query.users.findFirst({
    where: eq(users.id, newLeaderId),
    columns: { currentTeamId: true },
  });

  if (!targetUser || targetUser.currentTeamId !== teamId) {
    throw badRequest("The new leader must be a member of your team.");
  }

  await db.transaction(async (tx) => {
    // Make old leader a member
    await tx
      .update(users)
      .set({ teamRole: "member" })
      .where(eq(users.id, userId));

    // Make new leader the leader
    await tx
      .update(users)
      .set({ teamRole: "leader" })
      .where(eq(users.id, newLeaderId));
  });

  logger.info({ teamId, oldLeader: userId, newLeader: newLeaderId }, "Leadership transferred");
}
