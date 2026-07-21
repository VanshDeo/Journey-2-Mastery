import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as adminService from "@/lib/services/admin.service";
import { changeRoleSchema } from "@/lib/validators/admin.validator";

export const PATCH = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const admin = await requireAuth(req);
  const userId = (await params).id;
  const json = await req.json();
  const body = changeRoleSchema.parse(json);
  const user = await adminService.changeUserRole(admin.id, userId, body);
  return NextResponse.json({ success: true, data:  user });
});
