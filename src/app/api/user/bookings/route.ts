import { NextRequest } from "next/server";
import {  getUserBookings } from "@/controllers/bookingController";

export async function GET(req: NextRequest) {  
    return getUserBookings(req as any, {});;
}