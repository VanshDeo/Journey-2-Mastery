import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as judgeService from "@/lib/services/judge.service";

export const GET = apiHandler(async (req: Request, { params }: { params: any }) => {

  const user = await requireAuth(req);
  const submissionId = params.id;
  const submission = await judgeService.getSubmissionForReview(user.id, submissionId);
  return NextResponse.json({ success: true, data:  submission });

});
