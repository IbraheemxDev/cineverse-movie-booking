import { NextRequest } from "next/server";
import { getFavorites } from "@/controllers/userController";

export async function GET(request: NextRequest) {
  return getFavorites(request);
}