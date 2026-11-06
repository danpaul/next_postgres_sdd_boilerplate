import { describe, expect, it } from "vitest";
import { hashPassword, hashToken, SESSION_COOKIE } from "@/actions/auth/helpers";
import { setTestCookie } from "@/actions/testSetup";
import { prisma } from "@/prisma/prismaClient";
import { getCurrentUser } from "./getCurrentUser";

async function seedSession(token: string, expiresAt: Date) {
  const user = await prisma.user.create({
    data: {
      email: "a@example.com",
      passwordHash: await hashPassword("password123"),
      role: "user",
    },
  });
  await prisma.session.create({
    data: { userId: user.id, tokenHash: hashToken(token), expiresAt },
  });
}

describe("getCurrentUser", () => {
  it("returns exactly { email, role } for a valid session", async () => {
    await seedSession("valid-token", new Date(Date.now() + 60_000));
    setTestCookie(SESSION_COOKIE, "valid-token");

    expect(await getCurrentUser()).toEqual({
      email: "a@example.com",
      role: "user",
    });
  });

  it("returns null without a cookie", async () => {
    expect(await getCurrentUser()).toBeNull();
  });

  it("returns null for an unknown token", async () => {
    setTestCookie(SESSION_COOKIE, "unknown-token");

    expect(await getCurrentUser()).toBeNull();
  });

  it("returns null for an expired session and keeps the row", async () => {
    await seedSession("expired-token", new Date(Date.now() - 60_000));
    setTestCookie(SESSION_COOKIE, "expired-token");

    expect(await getCurrentUser()).toBeNull();
    expect(await prisma.session.count()).toBe(1);
  });
});
