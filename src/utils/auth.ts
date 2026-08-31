import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { ApiError } from "@/utils/ApiError";

export const protectAdmin = async (req: NextRequest, userId: string) => {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    // Check privateMetadata role
    if (user.privateMetadata?.role !== "admin") {
      throw new ApiError(403, "Not authorized as admin");
    }
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(401, "Not authorized");
  }
};