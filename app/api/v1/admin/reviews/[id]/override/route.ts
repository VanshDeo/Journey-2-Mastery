import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as adminService from "@/lib/services/admin.service";

export const PATCH = apiHandler(async (req: Request, { params }: { params: any }) => {

  const admin = await requireAuth(req);
  const reviewId = params.id;
  const body = await req.json() as any;
  const review = await adminService.overrideReview(admin.id, reviewId, body);
  return NextResponse.json({ success: true, data:  review });

});
