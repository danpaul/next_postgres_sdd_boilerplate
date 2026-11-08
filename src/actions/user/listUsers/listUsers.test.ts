import { describe, expect, it } from "vitest";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/prismaClient";
import { clearTestCookies } from "@/test/testSetup";
import { listUsers } from "./listUsers";

// Signs up (which also signs in) and sets an explicit createdAt for ordering.
async function seedUser(email: string, role: "user" | "admin", createdAt: Date) {
  const { user } = await auth.api.signUpEmail({
    body: { name: email.split("@")[0], email, password: "password123" },
  });
  await prisma.user.update({ where: { id: user.id }, data: { role, createdAt } });
  return user;
}

describe("listUsers", () => {
  it("throws Forbidden when signed out", async () => {
    await expect(listUsers()).rejects.toThrow("Forbidden");
  });

  it("throws Forbidden for a non-admin", async () => {
    await seedUser("a@example.com", "user", new Date("2026-01-01T00:00:00Z"));

    await expect(listUsers()).rejects.toThrow("Forbidden");
  });

  it("returns id, email, and role, newest first, for an admin", async () => {
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
    clearTestCookies();
    // Signed in last, so the admin's session is the one in the cookie jar.
    const admin = await seedUser(
      "admin@example.com",
      "admin",
      new Date("2026-01-01T00:00:00Z"),
    );

    const users = await listUsers();

    expect(users).toEqual([
      { id: newer.id, email: "newer@example.com", role: "user" },
      { id: older.id, email: "older@example.com", role: "user" },
      { id: admin.id, email: "admin@example.com", role: "admin" },
    ]);
    for (const user of users) {
      expect(Object.keys(user).sort()).toEqual(["email", "id", "role"]);
    }
  });
});
