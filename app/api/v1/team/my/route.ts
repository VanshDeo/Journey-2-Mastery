import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as teamService from "@/lib/services/team.service";

export const GET = apiHandler(async (req: Request, { params }: { params: any }) => {

  const user = await requireAuth(req);
  const team = await teamService.getMyTeam(user.id);
  return NextResponse.json({ success: true, data:  team });

});
