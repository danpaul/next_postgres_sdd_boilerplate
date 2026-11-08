/*
 * Better Auth server instance. Server-only (imports Prisma); never import from UI.
 * `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` are read from the environment.
 */
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { prisma } from "@/prisma/prismaClient";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  // autoSignIn defaults to true; minPasswordLength defaults to 8.
  emailAndPassword: { enabled: true, requireEmailVerification: false },
  session: { expiresIn: 60 * 60 * 24 * 7 },
  // nextCookies must stay last.
  plugins: [admin(), nextCookies()],
});
