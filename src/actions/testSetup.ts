/*
 * Vitest setupFiles for the `actions` project. Not a Server Action (no "use server").
 * Mocks `next/headers` cookies() with an in-memory store and `next/navigation`
 * redirect() to throw `NEXT_REDIRECT:{url}`. Empties User/Session and the cookie
 * store before each test. Test files import only setTestCookie / getTestCookie.
 */
import { afterAll, beforeEach, vi } from "vitest";
import { prisma } from "@/prisma/prismaClient";

type CookieOptions = Record<string, unknown>;
type StoredCookie = { value: string; options: CookieOptions };

const { cookieJar } = vi.hoisted(() => ({
  cookieJar: new Map<string, StoredCookie>(),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      const cookie = cookieJar.get(name);
      return cookie ? { name, value: cookie.value } : undefined;
    },
    set: (name: string, value: string, options: CookieOptions = {}) => {
      cookieJar.set(name, { value, options });
    },
    delete: (name: string) => {
      cookieJar.delete(name);
    },
  }),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));

beforeEach(async () => {
  cookieJar.clear();
  await prisma.$executeRaw`TRUNCATE TABLE "Session", "User" RESTART IDENTITY CASCADE`;
});

afterAll(async () => {
  await prisma.$disconnect();
});

export function setTestCookie(name: string, value: string): void {
  cookieJar.set(name, { value, options: {} });
}

export function getTestCookie(name: string): StoredCookie | undefined {
  return cookieJar.get(name);
}
