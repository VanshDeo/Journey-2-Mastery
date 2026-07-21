import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as authService from "@/lib/services/auth.service";

export const GET = apiHandler(async (req: Request, { params }: { params: any }) => {

  const user = await requireAuth(req);
  // The current session ID (jti) from the JWT
  const currentJti = user.jti;
  const sessions = await authService.getSessions(user.id, currentJti);
  return NextResponse.json({ success: true, data:  sessions });

});
