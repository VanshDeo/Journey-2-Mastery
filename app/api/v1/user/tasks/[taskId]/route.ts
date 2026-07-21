import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as userService from "@/lib/services/user.service";

export const GET = apiHandler(async (req: Request, { params }: { params: any }) => {

  const taskId = (await params).taskId;
  const task = await userService.getTaskById(taskId);
  return NextResponse.json({ success: true, data:  task });

});
