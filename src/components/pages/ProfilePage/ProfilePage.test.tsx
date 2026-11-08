import { beforeEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { ProfilePage } from "./ProfilePage";

const { push, refresh } = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

beforeEach(() => {
  push.mockReset();
  refresh.mockReset();
});

const currentUser = {
  email: "ada@example.com",
  name: "Ada",
  role: "user",
} as const;

test("shows the email in main and not the role", async () => {
  const screen = await render(
    <ProfilePage
      currentUser={currentUser}
      signOut={vi.fn(async () => ({ error: null }))}
    />,
  );
  await expect
    .element(screen.getByRole("main").getByText("ada@example.com"))
    .toBeVisible();
  await expect
    .element(screen.getByText("user", { exact: true }))
    .not.toBeInTheDocument();
});

test("Sign out calls signOut and goes to /", async () => {
  const signOut = vi.fn(async () => ({ error: null }));
  const screen = await render(
    <ProfilePage currentUser={currentUser} signOut={signOut} />,
  );
  await screen.getByRole("button", { name: "Sign out" }).click();
  await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/"));
  expect(signOut).toHaveBeenCalled();
  expect(refresh).toHaveBeenCalled();
});

test("a sign-out error shows generic copy", async () => {
  const signOut = vi.fn(async () => ({ error: { code: "FAILED" } }));
  const screen = await render(
    <ProfilePage currentUser={currentUser} signOut={signOut} />,
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
    <ProfilePage currentUser={currentUser} signOut={signOut} />,
  );
  await screen.getByRole("button", { name: "Sign out" }).click();
  await expect
    .element(screen.getByRole("alert"))
    .toHaveTextContent("Something went wrong. Try again.");
  await expect.element(screen.getByText("boom")).not.toBeInTheDocument();
});
