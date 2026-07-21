import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as authService from "@/lib/services/auth.service";

export const GET = apiHandler(async (req: Request, { params }: { params: any }) => {

  const authUser = await requireAuth(req);
  const user = await authService.getCurrentUser(authUser.id);

  return NextResponse.json({ success: true, data:  {
    isProfileComplete: user.isProfileComplete,
  } });

});
