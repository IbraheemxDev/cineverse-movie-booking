import { getTrailers } from "@/controllers/showController";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return getTrailers(req as any, {} as any);
}