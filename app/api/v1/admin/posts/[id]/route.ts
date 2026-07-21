import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as adminService from "@/lib/services/admin.service";
import { updatePostSchema } from "@/lib/validators/admin.validator";

export const GET = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const admin = await requireAuth(req);
  const postId = (await params).id;
  const post = await adminService.getAdminPostById(admin.id, postId);
  return NextResponse.json({ success: true, data: post });
});

export const PATCH = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const admin = await requireAuth(req);
  const postId = (await params).id;
  const json = await req.json();
  const body = updatePostSchema.parse(json);
  const post = await adminService.updatePost(admin.id, postId, body);
  return NextResponse.json({ success: true, data:  post });
});

export const DELETE = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const admin = await requireAuth(req);
  const postId = (await params).id;
  await adminService.deletePost(admin.id, postId);
  return NextResponse.json({ success: true, data:  { message: "Post deleted" } });
});
