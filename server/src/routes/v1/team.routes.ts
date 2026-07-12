import { Hono } from "hono";
import type { AppEnv } from "../../types/index";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  createTeamSchema,
  joinTeamSchema,
  transferLeadershipSchema,
  updateTeamSchema,
} from "../../validators/team.validator";
import * as teamController from "../../controllers/team.controller";

const team = new Hono<AppEnv>();

// Require authentication and appropriate role
team.use("/*", authMiddleware, requireRole(["user", "judge", "admin"]));

team.post("/", validate("json", createTeamSchema), teamController.createTeam);
team.get("/my", teamController.getMyTeam);
team.post("/join", validate("json", joinTeamSchema), teamController.joinTeamByCode);
team.get("/:id", teamController.getTeamPublic);
team.get("/:id/members", teamController.getTeamMembers);
team.patch("/:id", validate("json", updateTeamSchema), teamController.updateTeamName);
team.post("/:id/regenerate-code", teamController.regenerateJoinCode);
team.delete("/:id", teamController.disbandTeam);
team.post("/:id/leave", teamController.leaveTeam);
team.delete("/:id/members/:userId", teamController.removeTeamMember);
team.patch("/:id/transfer-leadership", validate("json", transferLeadershipSchema), teamController.transferLeadership);

export default team;
