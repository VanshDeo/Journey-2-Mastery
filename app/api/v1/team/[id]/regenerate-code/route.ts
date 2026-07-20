import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as teamService from "@/lib/services/team.service";

export const POST = apiHandler(async (req: Request, { params }: { params: any }) => {

  const user = await requireAuth(req);
  const teamId = params.id;
  const result = await teamService.regenerateJoinCode(user.id, teamId);
  return NextResponse.json({ success: true, data:  result });

});
