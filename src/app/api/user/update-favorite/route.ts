import { NextRequest } from "next/server";
import { updateFavorite } from "@/controllers/bookingController";

export async function POST(request: NextRequest) {
  return updateFavorite(request as any, {});
}