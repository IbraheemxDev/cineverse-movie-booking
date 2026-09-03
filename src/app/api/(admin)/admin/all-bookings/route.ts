import { getAllBookings } from "@/controllers/adminController";

export async function GET(request: Request) {
  return getAllBookings(request as any, {});
}