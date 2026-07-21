import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as notificationService from "@/lib/services/notification.service";

export const PATCH = apiHandler(async (req: Request) => {
  const user = await requireAuth(req);
  await notificationService.markAllAsRead(user.id);
  return NextResponse.json({ success: true, data: { message: "All notifications marked as read" } });
});
