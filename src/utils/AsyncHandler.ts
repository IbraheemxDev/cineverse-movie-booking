import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "./ApiError";
import { ApiResponse } from "./ApiResponse";

export function asyncHandler<TContext = any>(
  handler: (
    req: NextRequest,
    context?: TContext
  ) => Promise<NextResponse>
) {
  return async (
    req: NextRequest,
    context?: TContext
  ): Promise<NextResponse> => {
    try {
      return await handler(req, context);
    } catch (error: unknown) {
      console.error("API Error:", error);

      if (error instanceof ApiError) {
        return NextResponse.json(
          new ApiResponse(
            error.statusCode,
            error.message,
            error.errors
          ),
          {
            status: error.statusCode,
          }
        );
      }

      return NextResponse.json(
        new ApiResponse(500, "Internal Server Error"),
        {
          status: 500,
        }
      );
    }
  };
}