import { NextRequest } from "next/server";
import {  getUserBookings } from "@/controllers/userController";

export async function GET(req: NextRequest) {  
    return getUserBookings(req as any, {});;
}