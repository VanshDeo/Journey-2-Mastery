import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as adminService from "@/lib/services/admin.service";

export const POST = apiHandler(async (req: Request, { params }: { params: any }) => {

  const admin = await requireAuth(req);
  const submissionId = params.submissionId;
  const body = (await req.json().catch(() => ({}))) as { excludeJudgeId?: string };
  const assigned = await adminService.adminReassign(admin.id, submissionId, body.excludeJudgeId);
  return NextResponse.json({ success: true, data:  { assigned } });

});
