import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as judgeService from "@/lib/services/judge.service";

export const GET = apiHandler(async (req: Request, { params }: { params: any }) => {

  const user = await requireAuth(req);
  const status = new URL(req.url).searchParams.get("status") || undefined;
  const cursor = new URL(req.url).searchParams.get("cursor") || undefined;
  const limit = parseInt(new URL(req.url).searchParams.get("limit") || "20", 10);
  const result = await judgeService.getAssignedSubmissions(user.id, status, cursor, limit);
  return NextResponse.json({ success: true, data: result.items, meta: result.meta });

});
