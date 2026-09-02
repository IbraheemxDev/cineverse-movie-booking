import { getNowPlayingMovies } from "@/controllers/showController";
import { protectAdmin } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // 1. Better Auth session aur admin role verify karein
    await protectAdmin(req as any);

    // 2. Agar admin hai toh controller chala dein
    return getNowPlayingMovies(req as any, {});

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: error.statusCode || 500 }
    );
  }
}