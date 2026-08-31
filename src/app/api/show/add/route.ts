import { addShow, getShows } from "@/controllers/showController";
import { protectAdmin } from "@/utils/auth";
import { auth } from "@clerk/nextjs/server";
import { ApiError } from "@/utils/ApiError";
import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//   try {
//     // 1. Clerk se userId nikalein
//     const { userId } = await auth();

//     if (!userId) {
//       throw new ApiError(401, "Unauthorized: Please log in");
//     }

//     // 2. Admin middleware call karein
//     await protectAdmin(req as any, userId);

//     // 3. Agar admin hai toh addShow controller chala dein
//     return addShow(req as any, {});
    
//   } catch (error: any) {
//     return NextResponse.json(
//       { success: false, message: error.message || "Internal Server Error" },
//       { status: error.statusCode || 500 }
//     );
//   }
// }


    export async function POST(req: Request) {
    return addShow(req as any, {});
    }