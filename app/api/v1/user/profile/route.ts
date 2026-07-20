import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as userService from "@/lib/services/user.service";

export const GET = apiHandler(async (req: Request, { params }: { params: any }) => {

  const user = await requireAuth(req);
  const data = await userService.getProfile(user.id);
  return NextResponse.json({ success: true, data:  data });

});

export const PATCH = apiHandler(async (req: Request, { params }: { params: any }) => {

  const user = await requireAuth(req);
  const body = await req.json() as any;
  const data = await userService.updateProfile(user.id, body);
  return NextResponse.json({ success: true, data:  data });

});
