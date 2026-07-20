import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as adminService from "@/lib/services/admin.service";

export const GET = apiHandler(async (req: Request, { params }: { params: any }) => {

  const role = new URL(req.url).searchParams.get("role") || undefined;
  const rank = new URL(req.url).searchParams.get("rank") || undefined;
  const cursor = new URL(req.url).searchParams.get("cursor") || undefined;
  const limit = parseInt(new URL(req.url).searchParams.get("limit") || "20", 10);
  const result = await adminService.getUsers({ role, rank, cursor, limit });
  return NextResponse.json({ success: true, data: result.items, meta: result.meta });

});
