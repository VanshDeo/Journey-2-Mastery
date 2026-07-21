import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as adminService from "@/lib/services/admin.service";

export const POST = apiHandler(async (req: Request, { params }: { params: any }) => {

  const result = await adminService.triggerLeaderboardRecalculation();
  return NextResponse.json({ success: true, data: { message: "Leaderboard recalculation queued", jobId: result.jobId } }, { status: 202 });
});
