import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as authService from "@/lib/services/auth.service";
import { completeProfileSchema } from "@/lib/validators/schemas";

export const POST = apiHandler(async (req: Request) => {
  const authUser = await requireAuth(req);
  const json = await req.json();
  const body = completeProfileSchema.parse(json);

  const user = await authService.completeProfile(authUser.id, body);

  // Issue new tokens with updated profile data
  const userAgent = req.headers.get("user-agent") ?? undefined;
  const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
  
  const tokens = await authService.issueTokens(user, userAgent, ipAddress);

  return NextResponse.json({ success: true, data:  {
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      isProfileComplete: user.isProfileComplete,
    },
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  } }, { status: 201 });

});
