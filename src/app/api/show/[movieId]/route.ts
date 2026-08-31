import { getShow } from "@/controllers/showController";

export async function GET(
  req: Request,
  context: { params: Promise<{ movieId: string }> }
) {
  return getShow(req as any, context);
}