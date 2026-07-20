import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as teamService from "@/lib/services/team.service";

export const PATCH = apiHandler(async (req: Request, { params }: { params: any }) => {

  const user = await requireAuth(req);
  const teamId = params.id;
  const body = await req.json() as any;
  await teamService.transferLeadership(user.id, teamId, body.newLeaderId);
  return NextResponse.json({ success: true, data:  { message: "Leadership transferred successfully" } });

});
