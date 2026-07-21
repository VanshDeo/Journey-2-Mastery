import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as userService from "@/lib/services/user.service";

export const GET = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  // Ensure user is authenticated
  await requireAuth(req);
  
  const resolvedParams = await params;
  const post = await userService.getPublishedPostById(resolvedParams.id);
  return NextResponse.json({ success: true, data: post });
});
