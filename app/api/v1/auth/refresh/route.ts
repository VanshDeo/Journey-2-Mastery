import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as authService from "@/lib/services/auth.service";

export const POST = apiHandler(async (req: Request, { params }: { params: any }) => {

  const body = await req.json() as any;
  const tokens = await authService.refreshAccessToken(body.refreshToken);

  return NextResponse.json({ success: true, data:  {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  } });

});
