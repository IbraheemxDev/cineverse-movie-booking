import dbConnect from "@/lib/dbConnect";
import { asyncHandler } from "@/utils/AsyncHandler";
import { NextResponse } from "next/server";
import { Booking } from "@/models/Booking";
import Show from "@/models/Show";
import User from "@/models/User";

// Controller to get dashboard data
export const getDashboardData = asyncHandler(async () => {
  await dbConnect();

  const bookings = await Booking.find({ isPaid: true });

  const activeShows = await Show.find({ 
    showDateTime: { $gte: new Date() } 
  }).populate('movie');

  const totalUsers = await User.countDocuments();

  const dashboardData = {
    totalBookings: bookings.length,
    totalRevenue: bookings.reduce((acc: number, booking: any) => acc + (booking.amount || 0), 0),
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
    showDateTime: { $gte: new Date() } 
  })
    .populate('movie')
    .sort({ showDateTime: 1 });

  return NextResponse.json(
    { success: true, message: "Shows fetched successfully", data: shows },
    { status: 200 }
  );
});

// Controller to get all bookings
export const getAllBookings = asyncHandler(async () => {
  await dbConnect();

  const bookings = await Booking.find({})
    .populate('user')
    .populate({
      path: 'show',
      populate: { path: 'movie' },
    })
    .sort({ createdAt: -1 });

  return NextResponse.json(
    { success: true, message: "Bookings fetched successfully", data: bookings },
    { status: 200 }
  );
});