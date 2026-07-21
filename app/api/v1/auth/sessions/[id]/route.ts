import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as authService from "@/lib/services/auth.service";

export const DELETE = apiHandler(async (req: Request, { params }: { params: any }) => {

  const user = await requireAuth(req);
  const sessionId = (await params).id;
  await authService.revokeSession(user.id, sessionId!);
  return NextResponse.json({ success: true, data:  { message: "Session revoked successfully" } });

});
