import dbConnect from "@/lib/dbConnect";
import { asyncHandler } from "@/utils/AsyncHandler";
import { NextResponse, NextRequest } from "next/server";
import { Booking } from "@/models/Booking";
import { auth } from "@/lib/auth"; // Aapka auth.ts file ka path
import "@/models/Show";
import "@/models/Movie";
import User from "@/models/User";

// API Controller Function to Get User Bookings
export const getUserBookings = asyncHandler(async (request: NextRequest) => {
  await dbConnect();

  // Better Auth se session fetch karna
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const userId = session.user.id;

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

// API Controller Function to update Favorite Movie
export const updateFavorite = asyncHandler(async (request: NextRequest) => {
  await dbConnect();

  // 1. Better Auth se session check karein
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const userId = session.user.id;
  const { movieId } = await request.json();

  if (!movieId) {
    return NextResponse.json(
      { success: false, message: "Movie ID is required" },
      { status: 400 }
    );
  }

  // 2. Mongoose User find karein
  const user = await User.findById(userId);

  if (!user) {
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );
  }

  // 3. Agar user ke paas favorites array nahi hai toh initialize karein
  if (!user.favorites) {
    user.favorites = [];
  }

  // 4. Toggle logic (agar pehle se hai toh remove karein, nahi toh add karein)
  const index = user.favorites.indexOf(movieId);
  if (index > -1) {
    user.favorites.splice(index, 1);
  } else {
    user.favorites.push(movieId);
  }

  await user.save();

  return NextResponse.json(
    { success: true, message: "Favorite movies updated", favorites: user.favorites },
    { status: 200 }
  );
});


// API Controller Function to Get User's Favorite Movies
export const getFavorites = asyncHandler(async (request: NextRequest) => {
  await dbConnect();

  // 1. Better Auth se session check karein
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const userId = session.user.id;

  // 2. Database se user find karke favorites array lein
  const user = await User.findById(userId);

  if (!user || !user.favorites || user.favorites.length === 0) {
    return NextResponse.json(
      { success: true, movies: [] },
      { status: 200 }
    );
  }

  // 3. Favorites array wali IDs ke against movies fetch karein
  const movies = await Movie.find({ _id: { $in: user.favorites } });

  return NextResponse.json(
    { success: true, movies },
    { status: 200 }
  );
});