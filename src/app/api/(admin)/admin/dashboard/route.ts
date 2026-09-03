import { getDashboardData } from "@/controllers/adminController"; // Apne folder path ke mutabiq check kar lein

export async function GET(request: Request) {
  return getDashboardData(request as any, {}); // Agar zarurat ho toh request ko cast kar lein
}