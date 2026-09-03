
import { addShow } from "@/controllers/showController";
import { protectAdmin } from "@/utils/protectRoute"; // Aapke folder path ke mutabiق
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Better Auth session aur admin role verify karein
    await protectAdmin(req as any);

    // 2. Agar sab theek hai toh addShow controller chala dein
    return addShow(req as any, {});
    
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: error.statusCode || 500 }
    );
  }
}