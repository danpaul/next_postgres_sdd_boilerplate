import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { AdminPage } from "./AdminPage";

const currentUser = { email: "boss@example.com", role: "admin" } as const;

const users: { id: number; email: string; role: "user" | "admin" }[] = [
  { id: 2, email: "ada@example.com", role: "user" },
  { id: 1, email: "boss@example.com", role: "admin" },
];

test("shows Email and Role column headers", async () => {
  const screen = await render(
    <AdminPage
      currentUser={currentUser}
      users={users}
      signOut={vi.fn(async () => {})}
    />,
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
    <AdminPage
      currentUser={currentUser}
      users={users}
      signOut={vi.fn(async () => {})}
    />,
  );
  for (const user of users) {
    const row = screen.getByRole("row", { name: `${user.email} ${user.role}` });
    await expect.element(row.getByText(user.email)).toBeVisible();
    await expect
      .element(row.getByText(user.role, { exact: true }))
      .toBeVisible();
  }
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
