import { createBooking } from "@/controllers/bookingController";

export async function POST(req: Request) {
  return createBooking(req as any, {} as any);
}