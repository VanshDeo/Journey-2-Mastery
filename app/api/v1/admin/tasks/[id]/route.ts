import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as adminService from "@/lib/services/admin.service";

export const PATCH = apiHandler(async (req: Request, { params }: { params: any }) => {

  const admin = await requireAuth(req);
  const taskId = params.id;
  const body = await req.json() as any;
  const task = await adminService.updateTask(admin.id, taskId, body);
  return NextResponse.json({ success: true, data:  task });

});

export const DELETE = apiHandler(async (req: Request, { params }: { params: any }) => {

  const admin = await requireAuth(req);
  const taskId = params.id;
  await adminService.deleteTask(admin.id, taskId);
  return NextResponse.json({ success: true, data:  { message: "Task deactivated" } });

});
