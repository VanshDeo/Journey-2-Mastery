import type { Context } from "hono";
import type { AppEnv } from "../types/index";
import * as teamService from "../services/team.service";
import { success, created } from "../utils/apiResponse";
import type {
  CreateTeamInput,
  JoinTeamInput,
  TransferLeadershipInput,
  UpdateTeamInput,
} from "../validators/team.validator";

export async function createTeam(c: Context<AppEnv>) {
  const user = c.get("user");
  const body = c.req.valid("json" as never) as CreateTeamInput;
  const team = await teamService.createTeam(user.id, body.name);
  return created(c, team);
}

export async function getMyTeam(c: Context<AppEnv>) {
  const user = c.get("user");
  const team = await teamService.getMyTeam(user.id);
  return success(c, team);
}

export async function getTeamPublic(c: Context<AppEnv>) {
  const teamId = c.req.param("id")!;
  const team = await teamService.getTeamPublic(teamId);
  return success(c, team);
}

export async function getTeamMembers(c: Context<AppEnv>) {
  const teamId = c.req.param("id")!;
  const members = await teamService.getTeamMembers(teamId);
  return success(c, members);
}

export async function updateTeamName(c: Context<AppEnv>) {
  const user = c.get("user");
  const teamId = c.req.param("id")!;
  const body = c.req.valid("json" as never) as UpdateTeamInput;
  const team = await teamService.updateTeamName(user.id, teamId, body.name);
  return success(c, team);
}

export async function regenerateJoinCode(c: Context<AppEnv>) {
  const user = c.get("user");
  const teamId = c.req.param("id")!;
  const result = await teamService.regenerateJoinCode(user.id, teamId);
  return success(c, result);
}

export async function disbandTeam(c: Context<AppEnv>) {
  const user = c.get("user");
  const teamId = c.req.param("id")!;
  await teamService.disbandTeam(user.id, teamId);
  return success(c, { message: "Team disbanded successfully" });
}

export async function joinTeamByCode(c: Context<AppEnv>) {
  const user = c.get("user");
  const body = c.req.valid("json" as never) as JoinTeamInput;
  const result = await teamService.joinTeamByCode(user.id, body.code);
  return success(c, result);
}

export async function leaveTeam(c: Context<AppEnv>) {
  const user = c.get("user");
  const teamId = c.req.param("id")!;
  await teamService.leaveTeam(user.id, teamId);
  return success(c, { message: "Left team successfully" });
}

export async function removeTeamMember(c: Context<AppEnv>) {
  const user = c.get("user");
  const teamId = c.req.param("id")!;
  const targetMemberId = c.req.param("userId")!;
  await teamService.removeTeamMember(user.id, teamId, targetMemberId);
  return success(c, { message: "Member removed successfully" });
}

export async function transferLeadership(c: Context<AppEnv>) {
  const user = c.get("user");
  const teamId = c.req.param("id")!;
  const body = c.req.valid("json" as never) as TransferLeadershipInput;
  await teamService.transferLeadership(user.id, teamId, body.newLeaderId);
  return success(c, { message: "Leadership transferred successfully" });
}
