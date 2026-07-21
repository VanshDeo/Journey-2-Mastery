import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as teamService from "@/lib/services/team.service";

export const POST = apiHandler(async (req: Request, { params }: { params: any }) => {

  const user = await requireAuth(req);
  const body = await req.json() as any;
  const team = await teamService.createTeam(user.id, body.name);
  return NextResponse.json({ success: true, data:  team }, { status: 201 });

});
