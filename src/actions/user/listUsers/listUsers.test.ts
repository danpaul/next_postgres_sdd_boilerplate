import { describe, expect, it } from "vitest";
import { hashPassword, hashToken, SESSION_COOKIE } from "@/actions/auth/helpers";
import { setTestCookie } from "@/actions/testSetup";
import type { Role } from "@/generated/prisma/client";
import { prisma } from "@/prisma/prismaClient";
import { listUsers } from "./listUsers";

async function seedUser(email: string, role: Role, createdAt: Date) {
  return prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword("password123"),
      role,
      createdAt,
    },
  });
}

async function signInAs(userId: number) {
  const token = `token-${userId}`;
  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 60_000),
    },
  });
  setTestCookie(SESSION_COOKIE, token);
}

describe("listUsers", () => {
  it("throws Forbidden when signed out", async () => {
    await expect(listUsers()).rejects.toThrow("Forbidden");
  });

  it("throws Forbidden for a non-admin", async () => {
    const user = await seedUser(
      "a@example.com",
      "user",
      new Date("2026-01-01T00:00:00Z"),
    );
    await signInAs(user.id);

    await expect(listUsers()).rejects.toThrow("Forbidden");
  });

  it("returns id, email, and role, newest first, for an admin", async () => {
    const admin = await seedUser(
      "admin@test.local",
      "admin",
      new Date("2026-01-01T00:00:00Z"),
    );
    const older = await seedUser(
      "older@example.com",
      "user",
      new Date("2026-01-02T00:00:00Z"),
    );
    const newer = await seedUser(
      "newer@example.com",
      "user",
      new Date("2026-01-03T00:00:00Z"),
    );
    await signInAs(admin.id);

    const users = await listUsers();

    expect(users).toEqual([
      { id: newer.id, email: "newer@example.com", role: "user" },
      { id: older.id, email: "older@example.com", role: "user" },
      { id: admin.id, email: "admin@test.local", role: "admin" },
    ]);
    for (const user of users) {
      expect(Object.keys(user).sort()).toEqual(["email", "id", "role"]);
    }
  });
});
