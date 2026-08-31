import { inngest } from "./client";
import connectDB from "@/lib/dbConnect";
import User from "@/models/User";

// 1. Clerk user sync function (User Created)
export const syncUserWithMongoDB = inngest.createFunction(
  { id: "sync-user-from-clerk", triggers: { event: "clerk/user.created" } },
  async ({ event }: { event: any }) => {
    await connectDB();

    const eventData = event.data;
    const userId = eventData.id;
    const email = eventData.email_addresses?.[0]?.email_address;
    const name = `${eventData.first_name || ""} ${eventData.last_name || ""}`.trim();
    const image = eventData.image_url;

    // Use _id instead of clerkId
    const userData = { _id: userId, email, name, image };

    await User.findByIdAndUpdate(
      userId,
      userData,
      { upsert: true, new: true }
    );

    return { success: true, message: "User synced to DB" };
  }
);

// 2. Clerk user update function (User Updated)
export const updateUserInMongoDB = inngest.createFunction(
  { id: "update-user-in-clerk", triggers: { event: "clerk/user.updated" } },
  async ({ event }: { event: any }) => {
    await connectDB();

    const eventData = event.data;
    const userId = eventData.id;
    const email = eventData.email_addresses?.[0]?.email_address;
    const name = `${eventData.first_name || ""} ${eventData.last_name || ""}`.trim();
    const image = eventData.image_url;

    await User.findByIdAndUpdate(
      userId,
      { $set: { email, name, image } },
      { new: true }
    );

    return { success: true, message: "User updated in DB" };
  }
);

// 3. Clerk user delete function (User Deleted)
export const deleteUserFromMongoDB = inngest.createFunction(
  { id: "delete-user-from-clerk", triggers: { event: "clerk/user.deleted" } },
  async ({ event }: { event: any }) => {
    await connectDB();

    const eventData = event.data;
    const userId = eventData.id;

    await User.findByIdAndDelete(userId);

    return { success: true, message: "User deleted from DB" };
  }
);