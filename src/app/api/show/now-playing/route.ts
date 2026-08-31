import { getNowPlayingMovies } from "@/controllers/showController";
import { protectAdmin } from "@/middlewares/authMiddleware";
import { auth } from "@clerk/nextjs/server";
import { ApiError } from "@/utils/ApiError";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // 1. Clerk se userId check karein
    const { userId } = await auth();

    if (!userId) {
      throw new ApiError(401, "Unauthorized: Please log in");
    }

    // 2. Admin protect middleware run karein (jaise video mein hai)
    await protectAdmin(req as any, userId);

    // 3. Agar admin hai toh controller chala dein
    return getNowPlayingMovies(req as any, {});

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: error.statusCode || 500 }
    );
  }
}