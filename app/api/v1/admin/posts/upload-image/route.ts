import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import { uploadFile } from "@/lib/services/upload.service";
export const POST = apiHandler(async (req: Request, { params }: { params: any }) => {

  const formData = await req.formData();
  const file = formData.get("file") || formData.get("image"); // Match frontend default field name 'image'

  if (!file || typeof file === "string") {
    return NextResponse.json({ success: false, error: { message: "No valid file uploaded", code: "BAD_REQUEST" } }, { status: 400 });
  }

  // Convert hono File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const url = await uploadFile(buffer, file.type, file.name, "posts");
  return NextResponse.json({ success: true, data:  { url } });

});
