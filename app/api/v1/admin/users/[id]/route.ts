import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as adminService from "@/lib/services/admin.service";

export const GET = apiHandler(async (req: Request, { params }: { params: any }) => {

  const userId = params.id;
  const user = await adminService.getUserById(userId);
  return NextResponse.json({ success: true, data:  user });

});

export const PATCH = apiHandler(async (req: Request, { params }: { params: any }) => {

  const admin = await requireAuth(req);
  const userId = params.id;
  const body = await req.json() as any;
  const user = await adminService.updateUser(admin.id, userId, body);
  return NextResponse.json({ success: true, data:  user });

});

export const DELETE = apiHandler(async (req: Request, { params }: { params: any }) => {

  const admin = await requireAuth(req);
  const userId = params.id;
  await adminService.deleteUser(admin.id, userId);
  return NextResponse.json({ success: true, data:  { message: "User deactivated" } });

});
