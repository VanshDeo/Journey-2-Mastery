import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as teamService from "@/lib/services/team.service";

export const DELETE = apiHandler(async (req: Request, { params }: { params: any }) => {

  const user = await requireAuth(req);
  const teamId = params.id;
  const targetMemberId = params.userId;
  await teamService.removeTeamMember(user.id, teamId, targetMemberId);
  return NextResponse.json({ success: true, data:  { message: "Member removed successfully" } });

});
