import dbConnect from "@/lib/dbConnect";
import { asyncHandler } from "@/utils/AsyncHandler";
import { NextResponse, NextRequest } from "next/server";
import { headers } from "next/headers";
import { Booking } from "@/models/Booking";
import { auth } from "@/lib/auth"; // Aapka auth.ts file ka path
import "@/models/Show";
import "@/models/Movie";
import User from "@/models/User";
import { ApiError } from "@/utils/ApiError";
import { error } from "console";
import Show from "@/models/Show";
import { ApiResponse } from "@/utils/ApiResponse";
import connectDB from "@/lib/dbConnect";

// Function to check availability of selected seats for a show
export const checkSeatsAvailability = async (showId: string, selectedSeats: string[]): Promise<boolean> => {
  try {
    const showData = await Show.findById(showId);
    if (!showData) {
      return false;
    }

    const occupiedSeats = showData.occupiedSeats || {};

    // Check if any of the selected seats are already taken
    const isAnySeatTaken = selectedSeats.some((seat) => occupiedSeats[seat]);

    return !isAnySeatTaken; // true if available, false if already taken
  } catch (error: any) {
    throw new ApiError(500, error.message || "Failed to check seat availability");
  }
};

export const createBooking = asyncHandler(async (req: NextRequest) => {
  await connectDB();

  // 1. Better Auth session check
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new ApiError(401, "Unauthorized: Please log in");
  }

  const userId = session.user.id;

  // 2. Parse request body
  const body = await req.json();
  const { showId, selectedSeats } = body;

  if (!showId || !selectedSeats || !Array.isArray(selectedSeats) || selectedSeats.length === 0) {
    throw new ApiError(400, "Show ID and selected seats are required");
  }

  // 3. Check if seats are available using existing utility function
  const isAvailable = await checkSeatsAvailability(showId, selectedSeats);

  if (!isAvailable) {
    throw new ApiError(400, "Selected seats are not available.");
  }

  // 4. Get the show details
  const showData = await Show.findById(showId).populate("movie");
  if (!showData) {
    throw new ApiError(404, "Show not found");
  }

  // 5. Create a new booking
  const booking = await Booking.create({
    user: userId,
    show: showId,
    amount: showData.showPrice * selectedSeats.length,
    bookedSeats: selectedSeats,
  });

// 6. Mark seats as occupied (Safe handling for Map or Object)
  selectedSeats.forEach((seat: string) => {
    if (showData.occupiedSeats instanceof Map || typeof showData.occupiedSeats.set === "function") {
      showData.occupiedSeats.set(seat, userId);
    } else {
      showData.occupiedSeats[seat] = userId;
    }
  });

  showData.markModified("occupiedSeats");

  showData.markModified("occupiedSeats");

  // 7. Save the updated show data
  await showData.save();
  // stripe bad me kren ge 

  // 8. Return success response
  return NextResponse.json(
    new ApiResponse(201, "Booking created successfully", { booking }),
    { status: 201 }
  );
});


// API Controller Function to Get Occupied Seats for a Show
export const getOccupiedSeats = asyncHandler(async (req: NextRequest, context?: { params: Promise<{ showId: string }> }) => {
  await connectDB();

  if (!context?.params) {
    throw new ApiError(400, "Route parameters are missing");
  }

  const { showId } = await context.params;

  if (!showId) {
    throw new ApiError(400, "Show ID is required");
  }

  const showData = await Show.findById(showId);

  if (!showData) {
    throw new ApiError(404, "Show not found");
  }

  // Occupied seats ko safely object ya map se extract karna
  const occupiedSeatsObj = showData.occupiedSeats || {};
  const occupiedSeats = occupiedSeatsObj instanceof Map 
    ? Array.from(occupiedSeatsObj.keys()) 
    : Object.keys(occupiedSeatsObj);

  return NextResponse.json(
    new ApiResponse(200, "Occupied seats fetched successfully", { occupiedSeats }),
    { status: 200 }
  );
});
