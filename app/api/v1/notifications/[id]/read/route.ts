import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as notificationService from "@/lib/services/notification.service";

export const PATCH = apiHandler(async (req: Request, { params }: { params: any }) => {
  const user = await requireAuth(req);
  const notification = await notificationService.markAsRead(user.id, (await params).id);
  return NextResponse.json({ success: true, data: notification });
});
