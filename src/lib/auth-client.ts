/*
 * Better Auth client plus auth UI helpers. Safe for client and server imports
 * (no "use client"): page components call `authClient`, and the `/login` and
 * `/signup` routes use `homePathForRole`.
 */
import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({ plugins: [adminClient()] });

// Where a signed-in user lands: admins go to `/admin`, everyone else to `/`.
export function homePathForRole(
  role: string | null | undefined,
): "/admin" | "/" {
  return role === "admin" ? "/admin" : "/";
}

export const GENERIC_ERROR = "Something went wrong. Try again.";

// Maps a Better Auth error code to user-facing copy. Never returns error.message.
export function authErrorMessage(
  error: { code?: string } | null | undefined,
): string {
  switch (error?.code) {
    case "INVALID_EMAIL_OR_PASSWORD":
      return "Invalid email or password.";
    case "PASSWORD_TOO_SHORT":
      return "Password must be at least 8 characters.";
    case "INVALID_EMAIL":
      return "Enter a valid email address.";
    default:
      // Includes USER_ALREADY_EXISTS*, so sign-up does not reveal existing emails.
      return GENERIC_ERROR;
  }
}
