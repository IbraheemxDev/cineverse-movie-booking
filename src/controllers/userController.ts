import dbConnect from "@/lib/dbConnect";
import { asyncHandler } from "@/utils/AsyncHandler";
import { NextResponse, NextRequest } from "next/server";
import { Booking } from "@/models/Booking";
import "@/models/Show"; // Register Schema for populate
import "@/models/Movie"; // Register Schema for populate
import Movie from "@/models/Movie";
import User from "@/models/User";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// API Controller Function to Get User Bookings
export const getUserBookings = asyncHandler(async (request: NextRequest) => {
  await dbConnect();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const userId = session.user.id;
  const userEmail = session.user.email;

  // Resolve user document to get the exact _id
  const user = await (User as any).findOne({
    $or: [{ _id: userId }, { email: userEmail }],
  }).select('_id').lean();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );
  }

  const bookings = await (Booking as any).find({ user: user._id })
    .populate({
      path: "show",
      populate: { path: "movie" },
    })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(
    { success: true, message: "User bookings fetched successfully", data: bookings },
    { status: 200 }
  );
});

// API Controller Function to update Favorite Movie
export const updateFavorite = asyncHandler(async (request: NextRequest) => {
  await dbConnect();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Please login" },
      { status: 401 }
    );
  }

  const { movieId } = await request.json();

  if (!movieId) {
    return NextResponse.json(
      { success: false, message: "Movie ID is required" },
      { status: 400 }
    );
  }

  const targetMovieId = String(movieId);
  const userId = session.user.id;
  const userEmail = session.user.email;

  // 1. Better Auth User fetch
  const user = await (User as any).findOne({
    $or: [{ _id: userId }, { email: userEmail }],
  }).lean();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );
  }

  const currentFavorites = (user.favorites || []).map((id: any) => String(id));
  const isAlreadyFavorite = currentFavorites.includes(targetMovieId);

  // 2. Atomic Toggle: $pull if exists, otherwise $addToSet
  const updateQuery: any = isAlreadyFavorite
    ? { $pull: { favorites: targetMovieId } }
    : { $addToSet: { favorites: targetMovieId } };

  const updatedUser: any = await (User as any).findByIdAndUpdate(
    user._id,
    updateQuery,
    { new: true }
  ).lean();

  return NextResponse.json(
    {
      success: true,
      message: isAlreadyFavorite ? "Removed from favorites" : "Added to favorites",
      favorites: updatedUser?.favorites || [],
    },
    { status: 200 }
  );
});

// API Controller Function to Get User's Favorite Movies
export const getFavorites = asyncHandler(async (request: NextRequest) => {
  await dbConnect();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const userId = session.user.id;
  const userEmail = session.user.email;

  // Consistent query with email fallback
  const user = await (User as any).findOne({
    $or: [{ _id: userId }, { email: userEmail }],
  }).lean();

  if (!user || !user.favorites || user.favorites.length === 0) {
    return NextResponse.json(
      { success: true, movies: [] },
      { status: 200 }
    );
  }

  const movies = await (Movie as any).find({ _id: { $in: user.favorites } }).lean();

  return NextResponse.json(
    { success: true, movies },
    { status: 200 }
  );
});