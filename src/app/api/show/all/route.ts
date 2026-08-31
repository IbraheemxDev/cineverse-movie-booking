import { getShows } from "@/controllers/showController";

export async function GET(req: Request) {
  return getShows(req as any, {});
}