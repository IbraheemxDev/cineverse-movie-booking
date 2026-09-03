import { NextRequest } from "next/server";
import { updateFavorite } from "@/controllers/userController";

export async function POST(request: NextRequest) {
  return updateFavorite(request as any, {});
}