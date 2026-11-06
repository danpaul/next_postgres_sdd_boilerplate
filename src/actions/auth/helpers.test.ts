import { afterEach, describe, expect, it, vi } from "vitest";
import { getTestCookie } from "@/actions/testSetup";
import { prisma } from "@/prisma/prismaClient";
import {
  createSession,
  hashPassword,
  hashToken,
  homePathForRole,
  normalizeEmail,
  roleForEmail,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  validateSignUp,
  verifyPassword,
} from "./helpers";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  A@B.Com ")).toBe("a@b.com");
  });
});

describe("roleForEmail", () => {
  it("returns admin for ADMIN_EMAIL", () => {
    expect(roleForEmail("admin@test.local")).toBe("admin");
  });

  it("returns user for any other email", () => {
    expect(roleForEmail("someone@example.com")).toBe("user");
  });

  it("returns user for every email when ADMIN_EMAIL is empty", () => {
    vi.stubEnv("ADMIN_EMAIL", "");
    expect(roleForEmail("")).toBe("user");
    expect(roleForEmail("admin@test.local")).toBe("user");
  });
});

describe("homePathForRole", () => {
  it("sends admins to /admin and users to /", () => {
    expect(homePathForRole("admin")).toBe("/admin");
    expect(homePathForRole("user")).toBe("/");
  });
});

describe("validateSignUp", () => {
  const valid = {
    email: "a@example.com",
    password: "password123",
    confirmPassword: "password123",
  };

  it("rejects an email without @", () => {
    expect(validateSignUp({ ...valid, email: "nope" })).toBe(
      "Enter a valid email address.",
    );
  });

  it("rejects a password shorter than 8 characters", () => {
    expect(
      validateSignUp({ ...valid, password: "short", confirmPassword: "short" }),
    ).toBe("Password must be at least 8 characters.");
  });

  it("rejects a mismatched confirmation", () => {
    expect(validateSignUp({ ...valid, confirmPassword: "different123" })).toBe(
      "Passwords do not match.",
    );
  });

  it("returns null for valid input", () => {
    expect(validateSignUp(valid)).toBeNull();
  });
});

describe("hashPassword", () => {
  it("returns saltHex:keyHex", async () => {
    expect(await hashPassword("password123")).toMatch(
      /^[0-9a-f]{32}:[0-9a-f]{128}$/,
    );
  });

  it("uses a unique salt per hash", async () => {
    const first = await hashPassword("password123");
    const second = await hashPassword("password123");
    expect(first).not.toBe(second);
  });
});

describe("verifyPassword", () => {
  it("returns true for the correct password", async () => {
    const stored = await hashPassword("password123");
    expect(await verifyPassword("password123", stored)).toBe(true);
  });

  it("returns false for a wrong password", async () => {
    const stored = await hashPassword("password123");
    expect(await verifyPassword("wrongpassword", stored)).toBe(false);
  });

  it("returns false for a malformed stored value", async () => {
    expect(await verifyPassword("password123", "nocolon")).toBe(false);
  });
});

describe("hashToken", () => {
  it("returns the sha256 hex digest", () => {
    expect(hashToken("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });
});

describe("createSession", () => {
  it("stores a hashed session row and sets the session cookie", async () => {
    const user = await prisma.user.create({
      data: {
        email: "a@example.com",
        passwordHash: await hashPassword("password123"),
        role: "user",
      },
    });

    const before = Date.now();
    await createSession(user.id);

    const cookie = getTestCookie(SESSION_COOKIE);
    expect(cookie).toBeDefined();
    const sessions = await prisma.session.findMany({
      where: { userId: user.id },
    });
    expect(sessions).toHaveLength(1);
    expect(sessions[0].tokenHash).toBe(hashToken(cookie!.value));

    const expected = before + SESSION_MAX_AGE_SECONDS * 1000;
    expect(Math.abs(sessions[0].expiresAt.getTime() - expected)).toBeLessThan(
      5000,
    );

    expect(SESSION_MAX_AGE_SECONDS).toBe(604800);
    expect(cookie!.options).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
  });
});
