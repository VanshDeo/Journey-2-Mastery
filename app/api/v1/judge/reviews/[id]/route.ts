import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as judgeService from "@/lib/services/judge.service";

export const GET = apiHandler(async (req: Request, { params }: { params: any }) => {

  const user = await requireAuth(req);
  const reviewId = (await params).id;
  const review = await judgeService.getReviewById(user.id, reviewId);
  return NextResponse.json({ success: true, data:  review });

});

export const PATCH = apiHandler(async (req: Request, { params }: { params: any }) => {

  const user = await requireAuth(req);
  const reviewId = (await params).id;
  const body = await req.json() as any;
  const review = await judgeService.editReview(user.id, reviewId, body);
  return NextResponse.json({ success: true, data:  review });

});
