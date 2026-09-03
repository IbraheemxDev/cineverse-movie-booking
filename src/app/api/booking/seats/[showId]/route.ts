import { getOccupiedSeats } from "@/controllers/bookingController"; // ya jis file mein aapne controller rakha hai

export async function GET(
  req: Request,
  context: { params: Promise<{ showId: string }> }
) {
  return getOccupiedSeats(req as any, context);
}















// import { NextRequest, NextResponse } from "next/server";
// import Show from "@/models/Show";
// import { ApiError } from "@/utils/ApiError";
// import { ApiResponse } from "@/utils/ApiResponse";

// export async function GET(
//   req: NextRequest,
//   context: { params: Promise<{ showId: string }> }
// ) {
//   try {
//     const { showId } = await context.params;

//     if (!showId) {
//       throw new ApiError(400, "Show ID is required");
//     }

//     const showData = await Show.findById(showId);

//     if (!showData) {
//       throw new ApiError(404, "Show not found");
//     }

//     const occupiedSeats = showData.occupiedSeats
//       ? Object.keys(showData.occupiedSeats)
//       : [];

//     return NextResponse.json(
//       new ApiResponse(200, "Occupied seats fetched successfully", { occupiedSeats })
//     );
//   } catch (error: any) {
//     return NextResponse.json(
//       { success: false, message: error.message || "Internal Server Error" },
//       { status: error.statusCode || 500 }
//     );
//   }
// }