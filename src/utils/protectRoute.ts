import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

// Sirf logged-in user ke liye
export async function protectRoute(req?: NextRequest) {
  const session = await auth.api.getSession({
    headers: req ? req.headers : await headers(),
  });

  if (!session) {
    throw { statusCode: 401, message: "Unauthorized: Please log in" };
  }

  return session;
}

// Sirf admin users ke liye
export async function protectAdmin(req?: NextRequest) {
  const session = await auth.api.getSession({
    headers: req ? req.headers : await headers(),
  });

  if (!session) {
    throw { statusCode: 401, message: "Unauthorized: Please log in" };
  }

  if (session.user.role !== "admin") {
    throw { statusCode: 403, message: "Not authorized as admin" };
  }

  return session;
}