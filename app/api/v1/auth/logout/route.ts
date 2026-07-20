import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as authService from "@/lib/services/auth.service";

export const POST = apiHandler(async (req: Request, { params }: { params: any }) => {

  const user = await requireAuth(req);

  // Decode the token to get expiry
  const authHeader = req.headers.get("Authorization");
  const token = authHeader.slice(7);
  const decoded = JSON.parse(
    Buffer.from(token.split(".")[1]!, "base64").toString()
  ) as { exp: number };

  await authService.logout(user.jti, decoded.exp);

  return NextResponse.json({ success: true, data:  { message: "Logged out successfully" } });

});
