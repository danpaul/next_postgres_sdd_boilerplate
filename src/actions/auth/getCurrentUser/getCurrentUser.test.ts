import { describe, expect, it } from "vitest";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/prismaClient";
import { setTestCookie } from "@/test/testSetup";
import { getCurrentUser } from "./getCurrentUser";

const ada = { name: "Ada", email: "ada@example.com", password: "password123" };

describe("getCurrentUser", () => {
  it("returns null without a cookie", async () => {
    expect(await getCurrentUser()).toBeNull();
  });

  it("returns null for an unknown session cookie", async () => {
    setTestCookie("better-auth.session_token", "unknown-token.bad-signature");

    expect(await getCurrentUser()).toBeNull();
  });

  it("returns null for an expired session", async () => {
    await auth.api.signUpEmail({ body: ada });
    await prisma.session.updateMany({
      data: { expiresAt: new Date(Date.now() - 60_000) },
    });

    expect(await getCurrentUser()).toBeNull();
  });

  it("returns exactly { email, name, role } for a valid session", async () => {
    await auth.api.signUpEmail({ body: ada });

    expect(await getCurrentUser()).toEqual({
      email: ada.email,
      name: ada.name,
      role: "user",
    });
  });

  it("returns role admin after promotion", async () => {
    await auth.api.signUpEmail({ body: ada });
    await prisma.user.update({
      where: { email: ada.email },
      data: { role: "admin" },
    });

    expect(await getCurrentUser()).toEqual({
      email: ada.email,
      name: ada.name,
      role: "admin",
    });
  });
});
