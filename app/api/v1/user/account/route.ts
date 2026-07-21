import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as userService from "@/lib/services/user.service";

export const DELETE = apiHandler(async (req: Request, { params }: { params: any }) => {

  const user = await requireAuth(req);
  await userService.deleteAccount(user.id);
  return NextResponse.json({ success: true, data:  { message: "Account deleted" } });

});
