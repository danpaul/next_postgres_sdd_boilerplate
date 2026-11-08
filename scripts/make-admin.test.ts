import pg from "pg";
import { afterAll, describe, expect, it } from "vitest";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/prismaClient";
import { makeAdmin } from "./make-admin.mjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

afterAll(async () => {
  await pool.end();
});

async function roleOf(email: string) {
  return (await prisma.user.findUniqueOrThrow({ where: { email } })).role;
}

describe("makeAdmin", () => {
  it("promotes a signed-up user, normalizing the email", async () => {
    await auth.api.signUpEmail({
      body: { name: "Ada", email: "ada@example.com", password: "password123" },
    });

    expect(await makeAdmin(pool, "  Ada@Example.com ")).toBe("ada@example.com");
    expect(await roleOf("ada@example.com")).toBe("admin");
  });

  it("throws for an unknown email and leaves roles unchanged", async () => {
    await auth.api.signUpEmail({
      body: { name: "Ada", email: "ada@example.com", password: "password123" },
    });

    await expect(makeAdmin(pool, "nobody@example.com")).rejects.toThrow(
      "No user with email nobody@example.com",
    );
    expect(await roleOf("ada@example.com")).toBe("user");
  });

  it("throws for an empty email", async () => {
    await expect(makeAdmin(pool, "   ")).rejects.toThrow("Usage");
  });
});
