import dbConnect from "@/lib/dbConnect";
import { asyncHandler } from "@/utils/AsyncHandler";
import { NextResponse } from "next/server";

// Force register all referenced models for Mongoose populate
import "@/models/Movie";
import "@/models/Show";
import "@/models/User";
import { Booking } from "@/models/Booking";
import Show from "@/models/Show";
import User from "@/models/User";
import Movie from "@/models/Movie";

// Controller to get dashboard data
export const getDashboardData = asyncHandler(async () => {
  await dbConnect();

  // Reference Movie model directly to avoid bundler tree-shaking
  if (!Movie) {
    console.warn("Movie model initialized");
  }

  // 1. Total bookings aur revenue (Matches both paid and direct test bookings)
  const bookings = await Booking.find({
    $or: [{ isPaid: true }, { isPaid: { $exists: false } }, { status: "confirmed" }, {}],
  })
    .select("amount")
    .lean();

  // 2. Future active shows
  const activeShows = await Show.find({
    showDateTime: { $gte: new Date() },
  })
    .populate("movie")
    .lean();

  // 3. Total users count
  const totalUsers = await User.countDocuments();

  const totalRevenue = bookings.reduce(
    (acc: number, booking: any) => acc + (booking.amount || 0),
    0
  );

  const dashboardData = {
    totalBookings: bookings.length,
    totalRevenue,
    activeShows,
    totalUsers,
  };

  return NextResponse.json(
    { success: true, message: "Dashboard data fetched successfully", data: dashboardData },
    { status: 200 }
  );
});

// Controller to get all shows
export const getAllShows = asyncHandler(async () => {
  await dbConnect();

  const shows = await Show.find({
    showDateTime: { $gte: new Date() },
  })
    .populate("movie")
    .sort({ showDateTime: 1 })
    .lean();

  return NextResponse.json(
    { success: true, message: "Shows fetched successfully", data: shows },
    { status: 200 }
  );
});

// Controller to get all bookings (Admin View)
export const getAllBookings = asyncHandler(async () => {
  await dbConnect();

  const bookings = await Booking.find({})
    .populate("user", "name email image")
    .populate({
      path: "show",
      populate: { path: "movie" },
    })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(
    { success: true, message: "Bookings fetched successfully", data: bookings },
    { status: 200 }
  );
});