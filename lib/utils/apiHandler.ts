import { NextResponse } from "next/server";
import { AppError } from "./apiError";

export function apiHandler(handler: (req: Request, ...args: any[]) => Promise<any>) {
  return async (req: Request, ...args: any[]) => {
    try {
      return await handler(req, ...args);
    } catch (error: any) {
      console.error(error);
      const status = error.statusCode || 500;
      const message = error.message || "Internal Server Error";
      const cause = error.cause ? (error.cause.message || String(error.cause)) : undefined;
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message, 
            cause,
            code: error.code 
          } 
        }, 
        { status }
      );
    }
  };
}
