/*
 * Better Auth handler for `/api/auth/*`. The only Route Handler in the app;
 * the rest of the backend is Server Actions.
 */
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

export const { GET, POST } = toNextJsHandler(auth);
