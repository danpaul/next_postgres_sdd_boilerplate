import { beforeEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { AdminPage } from "./AdminPage";

const { push, refresh } = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

beforeEach(() => {
  push.mockReset();
  refresh.mockReset();
});

const currentUser = {
  email: "boss@example.com",
  name: "Boss",
  role: "admin",
} as const;

const users: { id: string; email: string; role: "user" | "admin" }[] = [
  { id: "user-2", email: "ada@example.com", role: "user" },
  { id: "user-1", email: "boss@example.com", role: "admin" },
];

const okSignOut = () => vi.fn(async () => ({ error: null }));

test("shows Email and Role column headers", async () => {
  const screen = await render(
    <AdminPage currentUser={currentUser} users={users} signOut={okSignOut()} />,
  );
  await expect
    .element(screen.getByRole("columnheader", { name: "Email" }))
    .toBeVisible();
  await expect
    .element(screen.getByRole("columnheader", { name: "Role" }))
    .toBeVisible();
});

test("renders each user's email and role in its row", async () => {
  const screen = await render(
    <AdminPage currentUser={currentUser} users={users} signOut={okSignOut()} />,
  );
  for (const user of users) {
    const row = screen.getByRole("row", { name: `${user.email} ${user.role}` });
    await expect.element(row.getByText(user.email)).toBeVisible();
    await expect
      .element(row.getByText(user.role, { exact: true }))
      .toBeVisible();
  }
});

test("Sign out calls signOut and goes to /", async () => {
  const signOut = okSignOut();
  const screen = await render(
    <AdminPage currentUser={currentUser} users={users} signOut={signOut} />,
  );
  await screen.getByRole("button", { name: "Sign out" }).click();
  await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/"));
  expect(signOut).toHaveBeenCalled();
  expect(refresh).toHaveBeenCalled();
});

test("a sign-out error shows generic copy", async () => {
  const signOut = vi.fn(async () => ({ error: { code: "FAILED" } }));
  const screen = await render(
    <AdminPage currentUser={currentUser} users={users} signOut={signOut} />,
  );
  await screen.getByRole("button", { name: "Sign out" }).click();
  await expect
    .element(screen.getByRole("alert"))
    .toHaveTextContent("Something went wrong. Try again.");
  expect(push).not.toHaveBeenCalled();
});

test("a thrown signOut shows generic copy, not error.message", async () => {
  const signOut = vi.fn(async () => {
    throw new Error("boom");
  });
  const screen = await render(
    <AdminPage currentUser={currentUser} users={users} signOut={signOut} />,
  );
  await screen.getByRole("button", { name: "Sign out" }).click();
  await expect
    .element(screen.getByRole("alert"))
    .toHaveTextContent("Something went wrong. Try again.");
  await expect.element(screen.getByText("boom")).not.toBeInTheDocument();
});
