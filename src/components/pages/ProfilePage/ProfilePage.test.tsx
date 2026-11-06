import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { ProfilePage } from "./ProfilePage";

const currentUser = { email: "ada@example.com", role: "user" } as const;

test("shows the email in main and not the role", async () => {
  const screen = await render(
    <ProfilePage currentUser={currentUser} signOut={vi.fn(async () => {})} />,
  );
  await expect
    .element(screen.getByRole("main").getByText("ada@example.com"))
    .toBeVisible();
  await expect
    .element(screen.getByText("user", { exact: true }))
    .not.toBeInTheDocument();
});

test("Sign out calls signOut", async () => {
  const signOut = vi.fn(async () => {});
  const screen = await render(
    <ProfilePage currentUser={currentUser} signOut={signOut} />,
  );
  await screen.getByRole("button", { name: "Sign out" }).click();
  expect(signOut).toHaveBeenCalled();
});

test("a thrown signOut shows generic copy, not error.message", async () => {
  const signOut = vi.fn(async () => {
    throw new Error("boom");
  });
  const screen = await render(
    <ProfilePage currentUser={currentUser} signOut={signOut} />,
  );
  await screen.getByRole("button", { name: "Sign out" }).click();
  await expect
    .element(screen.getByRole("alert"))
    .toHaveTextContent("Something went wrong. Try again.");
  await expect.element(screen.getByText("boom")).not.toBeInTheDocument();
});
