import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as adminService from "@/lib/services/admin.service";

export const PATCH = apiHandler(async (req: Request, { params }: { params: any }) => {

  const admin = await requireAuth(req);
  const postId = params.id;
  const body = await req.json() as any;
  const post = await adminService.updatePost(admin.id, postId, body);
  return NextResponse.json({ success: true, data:  post });

});

export const DELETE = apiHandler(async (req: Request, { params }: { params: any }) => {

  const admin = await requireAuth(req);
  const postId = params.id;
  await adminService.deletePost(admin.id, postId);
  return NextResponse.json({ success: true, data:  { message: "Post deleted" } });

});
