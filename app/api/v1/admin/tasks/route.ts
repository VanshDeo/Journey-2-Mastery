import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as adminService from "@/lib/services/admin.service";
import { createTaskSchema } from "@/lib/validators/admin.validator";

export const POST = apiHandler(async (req: Request) => {
  const admin = await requireAuth(req);
  const json = await req.json();
  const body = createTaskSchema.parse(json);
  const task = await adminService.createTask(admin.id, body);
  return NextResponse.json({ success: true, data:  task }, { status: 201 });
});

export const GET = apiHandler(async (req: Request) => {

  const cursor = new URL(req.url).searchParams.get("cursor") || undefined;
  const limit = parseInt(new URL(req.url).searchParams.get("limit") || "20", 10);
  const result = await adminService.getAllTasks(cursor, limit);
  return NextResponse.json({ success: true, data: result.items, meta: result.meta });

});
