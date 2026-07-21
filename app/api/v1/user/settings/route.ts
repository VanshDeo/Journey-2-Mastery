import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as userService from "@/lib/services/user.service";

export const GET = apiHandler(async (req: Request) => {
  const user = await requireAuth(req);
  const data = await userService.getSettings(user.id);
  return NextResponse.json({ success: true, data:  data });
});

export const PATCH = apiHandler(async (req: Request) => {
  const user = await requireAuth(req);
  // Validate using a schema if we had one, but for now just accept any json
  const body = await req.json();
  const data = await userService.updateSettings(user.id, body);
  return NextResponse.json({ success: true, data:  data });
});
