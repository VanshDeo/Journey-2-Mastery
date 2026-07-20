import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as userService from "@/lib/services/user.service";

export const GET = apiHandler(async (req: Request, { params }: { params: any }) => {

  const user = await requireAuth(req);
  const submissionId = params.id;
  const submission = await userService.getSubmissionById(user.id, submissionId);
  return NextResponse.json({ success: true, data:  submission });

});

export const PATCH = apiHandler(async (req: Request, { params }: { params: any }) => {

  const user = await requireAuth(req);
  const submissionId = params.id;
  const body = await req.json() as any;
  const submission = await userService.updateSubmission(user.id, submissionId, body);
  return NextResponse.json({ success: true, data:  submission });

});

export const DELETE = apiHandler(async (req: Request, { params }: { params: any }) => {

  const user = await requireAuth(req);
  const submissionId = params.id;
  await userService.deleteSubmission(user.id, submissionId);
  return NextResponse.json({ success: true, data:  { message: "Submission withdrawn successfully" } });

});
