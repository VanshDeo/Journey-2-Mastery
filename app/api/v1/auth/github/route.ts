import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as authService from "@/lib/services/auth.service";

export const GET = apiHandler(async (req: Request, { params }: { params: any }) => {

  const { url, state } = authService.getGitHubAuthUrl();

  const response = NextResponse.redirect(url);
  response.headers.set("Set-Cookie", `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`);
  return response;

});
