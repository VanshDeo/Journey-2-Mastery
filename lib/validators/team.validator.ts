import { z } from "zod";

export const createTeamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters").max(100, "Team name must be under 100 characters"),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;

export const joinTeamSchema = z.object({
  code: z.string().min(1, "Join code is required"),
});

export type JoinTeamInput = z.infer<typeof joinTeamSchema>;

export const transferLeadershipSchema = z.object({
  newLeaderId: z.string().uuid("Invalid leader user ID"),
});

export type TransferLeadershipInput = z.infer<typeof transferLeadershipSchema>;

export const updateTeamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters").max(100, "Team name must be under 100 characters"),
});

export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
