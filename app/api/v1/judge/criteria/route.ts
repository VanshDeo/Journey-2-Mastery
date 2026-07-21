import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { apiHandler } from "@/lib/utils/apiHandler";

export const GET = apiHandler(async (req: Request, { params }: { params: any }) => {

  const criteriaList = [
    { id: "codeQuality", name: "Code Quality", maxScore: 25, description: "Clean, readable, well-structured code" },
    { id: "functionality", name: "Functionality", maxScore: 25, description: "All requirements met and working" },
    { id: "documentation", name: "Documentation", maxScore: 15, description: "README, comments, and code documentation" },
    { id: "testing", name: "Testing", maxScore: 15, description: "Test coverage and test quality" },
    { id: "creativity", name: "Creativity", maxScore: 20, description: "Innovation, UX, and going above requirements" },
  ];
  return NextResponse.json({ success: true, data:  criteriaList });

});
