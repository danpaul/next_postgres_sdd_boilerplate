import { describe, expect, it } from "vitest";
import {
  hashPassword,
  hashToken,
  INVALID_CREDENTIALS,
  SESSION_COOKIE,
} from "@/actions/auth/helpers";
import { getTestCookie } from "@/actions/testSetup";
import type { Role } from "@/generated/prisma/client";
import { prisma } from "@/prisma/prismaClient";
import { signIn } from "./signIn";

async function seedUser(email: string, role: Role = "user") {
  return prisma.user.create({
    data: { email, passwordHash: await hashPassword("password123"), role },
  });
}

describe("signIn", () => {
  it("rejects an unknown email without a session or cookie", async () => {
    expect(
      await signIn({ email: "nobody@example.com", password: "password123" }),
    ).toEqual({ error: INVALID_CREDENTIALS });
    expect(await prisma.session.count()).toBe(0);
    expect(getTestCookie(SESSION_COOKIE)).toBeUndefined();
  });

  it("rejects a wrong password without a session or cookie", async () => {
    await seedUser("a@example.com");

    expect(
      await signIn({ email: "a@example.com", password: "wrongpassword" }),
    ).toEqual({ error: INVALID_CREDENTIALS });
    expect(await prisma.session.count()).toBe(0);
    expect(getTestCookie(SESSION_COOKIE)).toBeUndefined();
  });

  it("normalizes the email and creates a session and cookie", async () => {
    const user = await seedUser("a@example.com");

    await expect(
      signIn({ email: "  A@Example.COM ", password: "password123" }),
    ).rejects.toThrow("NEXT_REDIRECT:/");

    const sessions = await prisma.session.findMany({
      where: { userId: user.id },
    });
    expect(sessions).toHaveLength(1);
    const cookie = getTestCookie(SESSION_COOKIE);
    expect(cookie).toBeDefined();
    expect(sessions[0].tokenHash).toBe(hashToken(cookie!.value));
  });

  it("redirects a user to /", async () => {
    await seedUser("a@example.com");

    await expect(
      signIn({ email: "a@example.com", password: "password123" }),
    ).rejects.toThrow(/^NEXT_REDIRECT:\/$/);
  });

  it("redirects an admin to /admin", async () => {
    await seedUser("admin@test.local", "admin");

    await expect(
      signIn({ email: "admin@test.local", password: "password123" }),
    ).rejects.toThrow("NEXT_REDIRECT:/admin");
  });
});
