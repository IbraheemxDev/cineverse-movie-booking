// import { createAuthClient } from "better-auth/react";

// export const { signIn, signUp, useSession, signOut } = createAuthClient({
//   baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
// });
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

// Aapke purane methods aur session hook
export const { signIn, signUp, useSession, signOut } = authClient;