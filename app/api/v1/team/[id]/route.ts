import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as teamService from "@/lib/services/team.service";

export const GET = apiHandler(async (req: Request, { params }: { params: any }) => {

  const teamId = params.id;
  const team = await teamService.getTeamPublic(teamId);
  return NextResponse.json({ success: true, data:  team });

});

export const PATCH = apiHandler(async (req: Request, { params }: { params: any }) => {

  const user = await requireAuth(req);
  const teamId = params.id;
  const body = await req.json() as any;
  const team = await teamService.updateTeamName(user.id, teamId, body.name);
  return NextResponse.json({ success: true, data:  team });

});

export const DELETE = apiHandler(async (req: Request, { params }: { params: any }) => {

  const user = await requireAuth(req);
  const teamId = params.id;
  await teamService.disbandTeam(user.id, teamId);
  return NextResponse.json({ success: true, data:  { message: "Team disbanded successfully" } });

});
