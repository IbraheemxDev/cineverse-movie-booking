import dbConnect from "@/lib/dbConnect";
import { asyncHandler } from "@/utils/AsyncHandler";
import { NextResponse, NextRequest } from "next/server";
import { Booking } from "@/models/Booking";
import "@/models/Show"; // Ensure schema is registered for populate
import "@/models/Movie";

// API Controller Function to Get User Bookings
export const getUserBookings = asyncHandler(async (request: NextRequest) => {
  await dbConnect(); // ya dbConnect()

  // Note: Next.js mein auth session/userId nikalne ka tareeqa aapke auth provider (jaise Better Auth ya Clerk) ke mutabiq hoga.
  // Misal ke taur par agar headers ya request se userId mil raha hai:
  const userId = request.headers.get("x-user-id"); // Apne auth setup ke mutabiq yahan userId lein

  const bookings = await Booking.find({ user: userId })
    .populate({
      path: "show",
      populate: { path: "movie" },
    })
    .sort({ createdAt: -1 });

  return NextResponse.json(
    { success: true, message: "User bookings fetched successfully", data: bookings },
    { status: 200 }
  );
});