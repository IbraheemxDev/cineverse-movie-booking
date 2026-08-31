
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Show from "@/models/Show";
import { Booking } from "@/models/Booking";
import { asyncHandler } from "@/utils/AsyncHandler";
import { ApiError } from "@/utils/ApiError";
import { ApiResponse } from "@/utils/ApiResponse";

// Function to check availability of selected seats for a movie
export const checkSeatsAvailability = async (
  showId: string, 
  selectedSeats: string[]
): Promise<boolean> => {
  try {
    const showData = await Show.findById(showId);
    if (!showData) return false;

    const occupiedSeats = showData.occupiedSeats || {};

    const isAnySeatTaken = selectedSeats.some(
      (seat: string) => occupiedSeats[seat]
    );

    return !isAnySeatTaken;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.log(errorMessage);
    return false;
  }
};
export const createBooking = asyncHandler(async (req: NextRequest) => {
  const { userId } = await auth();

  if (!userId) {
    throw new ApiError(401, "Unauthorized: Please log in");
  }

  const body = await req.json();
  const { showId, selectedSeats } = body;

  if (!showId || !selectedSeats || !selectedSeats.length) {
    throw new ApiError(400, "Show ID and selected seats are required");
  }

  // 1. Check if the seats are available for the selected show
  const isAvailable = await checkSeatsAvailability(showId, selectedSeats);

  if (!isAvailable) {
    throw new ApiError(400, "Selected seats are not available.");
  }

  // 2. Get the show details
  const showData = await Show.findById(showId).populate("movie");

  if (!showData) {
    throw new ApiError(404, "Show not found");
  }

  // 3. Create a new booking
  const booking = await Booking.create({
    user: userId,
    show: showId,
    amount: (showData.showPrice || 0) * selectedSeats.length,
    bookedSeats: selectedSeats,
  });

  // 4. Mark selected seats as occupied
  if (!showData.occupiedSeats) {
    showData.occupiedSeats = {};
  }

  selectedSeats.forEach((seat: string) => {
    showData.occupiedSeats[seat] = userId;
  });

  // 5. Mark as modified and save show changes
  showData.markModified("occupiedSeats");
  await showData.save();

  // 6. Return success response
  return NextResponse.json(
    new ApiResponse(201, "Booking created successfully", { booking }),
    { status: 201 }
  );
});
