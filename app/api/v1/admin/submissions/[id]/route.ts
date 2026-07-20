import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as adminService from "@/lib/services/admin.service";

export const GET = apiHandler(async (req: Request, { params }: { params: any }) => {

  const submissionId = params.id;
  const submission = await adminService.getSubmissionById(submissionId);
  return NextResponse.json({ success: true, data:  submission });

});
