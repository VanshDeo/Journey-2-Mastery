import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as adminService from "@/lib/services/admin.service";

export const GET = apiHandler(async (req: Request, { params }: { params: any }) => {

  const judgeId = (await params).id;
  const performance = await adminService.getJudgePerformance(judgeId);
  return NextResponse.json({ success: true, data:  performance });

});
