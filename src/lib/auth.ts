import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import connectDB from "./dbConnect"; // aapka connectDB file path

// Mongoose ka underlying native MongoDB client get karein
const mongooseInstance = await connectDB();
const nativeClient = mongooseInstance.connection.getClient();
const db = nativeClient.db();

export const auth = betterAuth({
   database: mongodbAdapter(db, {
    client: nativeClient, // 👈 ye add karo — transactions enable karega
  }),
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  user: {
    changeEmail: {
      enabled: true,
    },
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false, // Normal user signup ke waqt khud ko admin na bana sake
      },
    },
  },
  emailAndPassword: {
    enabled: true, // Password change and credentials support
    allowPasswordReset: true,
    resetPasswordTokenExpiresIn: 60 * 60, 
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});