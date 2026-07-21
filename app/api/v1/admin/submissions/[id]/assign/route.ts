import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as adminService from "@/lib/services/admin.service";

export const POST = apiHandler(async (req: Request, { params }: { params: any }) => {

  const admin = await requireAuth(req);
  const submissionId = (await params).id;
  const body = await req.json() as any;
  await adminService.manualAssign(admin.id, submissionId, body);
  return NextResponse.json({ success: true, data:  { message: "Judge assigned" } });

});
