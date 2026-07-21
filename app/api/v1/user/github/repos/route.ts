import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";
import * as githubService from "@/lib/services/github.service";

export const GET = apiHandler(async (req: Request, { params }: { params: any }) => {

  const user = await requireAuth(req);
  const repos = await githubService.getUserRepos(user.id);
  return NextResponse.json({ success: true, data:  repos });

});
