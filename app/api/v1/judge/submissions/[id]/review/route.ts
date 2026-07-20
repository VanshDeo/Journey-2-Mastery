import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as judgeService from "@/lib/services/judge.service";

export const POST = apiHandler(async (req: Request, { params }: { params: any }) => {

  const user = await requireAuth(req);
  const submissionId = params.id;
  const body = await req.json() as any;
  const review = await judgeService.submitReview(user.id, submissionId, body);
  return NextResponse.json({ success: true, data:  review }, { status: 201 });

});
