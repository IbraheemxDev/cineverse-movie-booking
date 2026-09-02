import { NextRequest } from "next/server";
import { getFavorites } from "@/controllers/bookingController";

export async function GET(request: NextRequest) {
  return getFavorites(request);
}