import { describe, expect, it } from "vitest";
import { hashPassword, hashToken, SESSION_COOKIE } from "@/actions/auth/helpers";
import { getTestCookie, setTestCookie } from "@/actions/testSetup";
import { prisma } from "@/prisma/prismaClient";
import { signOut } from "./signOut";

async function seedUserWithSessions(tokens: string[]) {
  const user = await prisma.user.create({
    data: {
      email: "a@example.com",
      passwordHash: await hashPassword("password123"),
    },
  });
  for (const token of tokens) {
    await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + 60_000),
      },
    });
  }
  return user;
}

describe("signOut", () => {
  it("deletes only the matching session, clears the cookie, and keeps the user", async () => {
    const user = await seedUserWithSessions(["token-a", "token-b"]);
    setTestCookie(SESSION_COOKIE, "token-a");

    await expect(signOut()).rejects.toThrow(/^NEXT_REDIRECT:\/$/);

    const sessions = await prisma.session.findMany();
    expect(sessions).toHaveLength(1);
    expect(sessions[0].tokenHash).toBe(hashToken("token-b"));
    expect(getTestCookie(SESSION_COOKIE)).toBeUndefined();
    expect(
      await prisma.user.findUnique({ where: { id: user.id } }),
    ).not.toBeNull();
  });

  it("redirects to / without a cookie and leaves sessions unchanged", async () => {
    await seedUserWithSessions(["token-a"]);

    await expect(signOut()).rejects.toThrow(/^NEXT_REDIRECT:\/$/);

    expect(await prisma.session.count()).toBe(1);
  });
});
