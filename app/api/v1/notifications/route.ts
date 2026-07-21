import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as notificationService from "@/lib/services/notification.service";

export const GET = apiHandler(async (req: Request) => {
  const user = await requireAuth(req);
  const notifications = await notificationService.getNotifications(user.id);
  return NextResponse.json({ success: true, data: notifications });
});
