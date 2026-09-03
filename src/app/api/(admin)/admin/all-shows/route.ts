import { getAllShows } from "@/controllers/adminController";

export async function GET(request: Request) {
  return getAllShows(request as any, {});
}