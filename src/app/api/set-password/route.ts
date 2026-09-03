import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth"; // your betterAuth() instance

export async function POST(req: NextRequest) {
  try {
    const { newPassword } = await req.json();

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: { message: "Password must be at least 8 characters." } },
        { status: 400 }
      );
    }

    // This verifies the session internally using the request headers/cookies.
    await auth.api.setPassword({
      body: { newPassword },
      headers: req.headers,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("setPassword route error:", err);
    return NextResponse.json(
      { error: { message: err?.message || "Could not set password." } },
      { status: err?.status === "UNAUTHORIZED" ? 401 : 500 }
    );
  }
}