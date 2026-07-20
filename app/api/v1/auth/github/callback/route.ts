import { env } from "@/lib/config/env";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as authService from "@/lib/services/auth.service";

export const GET = apiHandler(async (req: Request, { params }: { params: any }) => {

  try {
    const code = new URL(req.url).searchParams.get("code") || undefined;

    if (!code) {
      return NextResponse.json({
          success: false,
          error: { code: "MISSING_CODE", message: "Missing authorization code" },
        }, { status: 400 });
    }

    // Exchange code for GitHub access token
    const githubAccessToken = await authService.exchangeGitHubCode(code);

    // Fetch GitHub profile
    const profile = await authService.fetchGitHubProfile(githubAccessToken);

    // Find or create user
    const user = await authService.findOrCreateUser(profile, githubAccessToken);

    // Issue JWT tokens
    const userAgent = req.headers.get("user-agent");
    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    
    const tokens = await authService.issueTokens(user, userAgent, ipAddress);

    // Redirect to frontend with tokens
    const redirectUrl = new URL(`${env.FRONTEND_URL}/auth/callback`);
    redirectUrl.searchParams.set("accessToken", tokens.accessToken);
    redirectUrl.searchParams.set("refreshToken", tokens.refreshToken);

    return NextResponse.redirect(redirectUrl.toString());
  } catch (err: any) {
    console.error("❌ githubCallback error:", err);
    if (err instanceof Error) {
      console.error("Stack trace:", err.stack);
    }
    throw err;
  }

});
