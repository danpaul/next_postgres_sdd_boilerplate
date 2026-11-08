import { headers } from "next/headers";
import { describe, expect, it } from "vitest";
import { getCurrentUser } from "@/actions/auth/getCurrentUser/getCurrentUser";
import { prisma } from "@/prisma/prismaClient";
import { clearTestCookies, getTestCookie } from "@/test/testSetup";
import { auth } from "./auth";

const SESSION_TOKEN_COOKIE = "better-auth.session_token";

const ada = { name: "Ada", email: "ada@example.com", password: "password123" };

describe("sign up", () => {
  it("creates a user and credential account, returns a session, and sets the cookie", async () => {
    const result = await auth.api.signUpEmail({ body: ada });

    expect(result.token).toEqual(expect.any(String));
    expect(result.user).toMatchObject({ email: ada.email, name: ada.name, role: "user" });

    const users = await prisma.user.findMany();
    expect(users).toHaveLength(1);
    expect(users[0].role).toBe("user");
    const accounts = await prisma.account.findMany();
    expect(accounts).toHaveLength(1);
    expect(accounts[0]).toMatchObject({ userId: users[0].id, providerId: "credential" });
    expect(await prisma.session.count({ where: { userId: users[0].id } })).toBe(1);

    expect(getTestCookie(SESSION_TOKEN_COOKIE)?.value).toBeTruthy();
    expect(await getCurrentUser()).toEqual({
      email: ada.email,
      name: ada.name,
      role: "user",
    });
  });

  it("rejects a duplicate email", async () => {
    await auth.api.signUpEmail({ body: ada });
    clearTestCookies();

    await expect(
      auth.api.signUpEmail({ body: { ...ada, name: "Other" } }),
    ).rejects.toMatchObject({
      body: { code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" },
    });
    expect(await prisma.user.count()).toBe(1);
  });

  it("rejects a short password", async () => {
    await expect(
      auth.api.signUpEmail({ body: { ...ada, password: "short" } }),
    ).rejects.toMatchObject({ body: { code: "PASSWORD_TOO_SHORT" } });
    expect(await prisma.user.count()).toBe(0);
  });

  it("rejects an invalid email", async () => {
    // Body schema validation rejects it before the handler's INVALID_EMAIL check.
    await expect(
      auth.api.signUpEmail({ body: { ...ada, email: "not-an-email" } }),
    ).rejects.toMatchObject({ body: { code: "VALIDATION_ERROR" } });
    expect(await prisma.user.count()).toBe(0);
  });
});

describe("sign in", () => {
  it("returns the user and sets the session cookie", async () => {
    await auth.api.signUpEmail({ body: ada });
    clearTestCookies();

    const result = await auth.api.signInEmail({
      body: { email: ada.email, password: ada.password },
    });

    expect(result.user).toMatchObject({ email: ada.email, name: ada.name });
    expect(getTestCookie(SESSION_TOKEN_COOKIE)?.value).toBeTruthy();
    expect(await getCurrentUser()).toEqual({
      email: ada.email,
      name: ada.name,
      role: "user",
    });
  });

  it("rejects a wrong password", async () => {
    await auth.api.signUpEmail({ body: ada });
    clearTestCookies();

    await expect(
      auth.api.signInEmail({ body: { email: ada.email, password: "wrongpassword" } }),
    ).rejects.toMatchObject({ body: { code: "INVALID_EMAIL_OR_PASSWORD" } });
    expect(await getCurrentUser()).toBeNull();
  });

  it("rejects an unknown email", async () => {
    await expect(
      auth.api.signInEmail({
        body: { email: "nobody@example.com", password: ada.password },
      }),
    ).rejects.toMatchObject({ body: { code: "INVALID_EMAIL_OR_PASSWORD" } });
  });
});

describe("sign out", () => {
  it("removes the session and getCurrentUser() becomes null", async () => {
    await auth.api.signUpEmail({ body: ada });
    clearTestCookies();
    const { token } = await auth.api.signInEmail({
      body: { email: ada.email, password: ada.password },
    });
    expect(await prisma.session.count({ where: { token } })).toBe(1);

    await auth.api.signOut({ headers: await headers() });

    expect(await prisma.session.count({ where: { token } })).toBe(0);
    expect(await getCurrentUser()).toBeNull();
  });
});
