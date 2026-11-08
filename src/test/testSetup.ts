/*
 * Vitest setupFiles for the `actions` project (backend tests).
 * Mocks `next/headers` (both `"next/headers"` and `"next/headers.js"`, which
 * Better Auth's `nextCookies` loads): `cookies()` is an in-memory jar and
 * `headers()` returns a `cookie` header built from that jar. Mocks
 * `next/navigation` redirect() to throw `NEXT_REDIRECT:{url}`. Empties the
 * Better Auth tables and the cookie jar before each test. Test files import
 * only setTestCookie / getTestCookie / clearTestCookies.
 */
import { afterAll, beforeEach, vi } from "vitest";
import { prisma } from "@/prisma/prismaClient";

type CookieOptions = Record<string, unknown>;
type StoredCookie = { value: string; options: CookieOptions };

const { cookieJar, nextHeadersMock } = vi.hoisted(() => {
  const cookieJar = new Map<string, StoredCookie>();
  const nextHeadersMock = () => ({
    cookies: async () => ({
      get: (name: string) => {
        const cookie = cookieJar.get(name);
        return cookie ? { name, value: cookie.value } : undefined;
      },
      getAll: () =>
        [...cookieJar].map(([name, cookie]) => ({ name, value: cookie.value })),
      has: (name: string) => cookieJar.has(name),
      set: (name: string, value: string, options: CookieOptions = {}) => {
        cookieJar.set(name, { value, options });
      },
      delete: (name: string) => {
        cookieJar.delete(name);
      },
    }),
    headers: async () =>
      new Headers({
        cookie: [...cookieJar]
          .map(([name, cookie]) => `${name}=${cookie.value}`)
          .join("; "),
      }),
  });
  return { cookieJar, nextHeadersMock };
});

vi.mock("next/headers", nextHeadersMock);
vi.mock("next/headers.js", nextHeadersMock);

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));

beforeEach(async () => {
  cookieJar.clear();
  await prisma.$executeRaw`TRUNCATE TABLE "verification", "account", "session", "user" RESTART IDENTITY CASCADE`;
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

export function clearTestCookies(): void {
  cookieJar.clear();
}
