import { describe, expect, it } from "vitest";
import {
  GENERIC_ERROR,
  hashPassword,
  hashToken,
  SESSION_COOKIE,
  verifyPassword,
} from "@/actions/auth/helpers";
import { getTestCookie } from "@/actions/testSetup";
import { prisma } from "@/prisma/prismaClient";
import { signUp } from "./signUp";

const valid = {
  email: "a@example.com",
  password: "password123",
  confirmPassword: "password123",
};

describe("signUp", () => {
  it.each([
    [{ ...valid, email: "nope" }, "Enter a valid email address."],
    [
      { ...valid, password: "short", confirmPassword: "short" },
      "Password must be at least 8 characters.",
    ],
    [{ ...valid, confirmPassword: "different123" }, "Passwords do not match."],
  ])("returns %j as a validation error and creates no user", async (input, error) => {
    expect(await signUp(input)).toEqual({ error });
    expect(await prisma.user.count()).toBe(0);
  });

  it("returns GENERIC_ERROR for a duplicate email", async () => {
    await prisma.user.create({
      data: {
        email: "a@example.com",
        passwordHash: await hashPassword("password123"),
      },
    });

    expect(await signUp({ ...valid, email: "  A@Example.COM " })).toEqual({
      error: GENERIC_ERROR,
    });
    expect(await prisma.user.count()).toBe(1);
  });

  it("makes ADMIN_EMAIL an admin and redirects to /admin", async () => {
    await expect(
      signUp({ ...valid, email: "  Admin@Test.Local " }),
    ).rejects.toThrow("NEXT_REDIRECT:/admin");

    const user = await prisma.user.findUniqueOrThrow({
      where: { email: "admin@test.local" },
    });
    expect(user.role).toBe("admin");
  });

  it("makes other emails a user and redirects to /", async () => {
    await expect(signUp(valid)).rejects.toThrow(/^NEXT_REDIRECT:\/$/);

    const user = await prisma.user.findUniqueOrThrow({
      where: { email: "a@example.com" },
    });
    expect(user.role).toBe("user");
  });

  it("stores a hashed password and creates a session and cookie", async () => {
    await expect(signUp(valid)).rejects.toThrow("NEXT_REDIRECT:/");

    const user = await prisma.user.findUniqueOrThrow({
      where: { email: "a@example.com" },
    });
    expect(user.passwordHash).not.toBe(valid.password);
    expect(await verifyPassword(valid.password, user.passwordHash)).toBe(true);

    const sessions = await prisma.session.findMany({
      where: { userId: user.id },
    });
    expect(sessions).toHaveLength(1);
    const cookie = getTestCookie(SESSION_COOKIE);
    expect(cookie).toBeDefined();
    expect(sessions[0].tokenHash).toBe(hashToken(cookie!.value));
  });
});
