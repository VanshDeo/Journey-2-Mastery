import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as teamService from "@/lib/services/team.service";

export const GET = apiHandler(async (req: Request, { params }: { params: any }) => {

  const teamId = (await params).id;
  const members = await teamService.getTeamMembers(teamId);
  return NextResponse.json({ success: true, data:  members });

});
