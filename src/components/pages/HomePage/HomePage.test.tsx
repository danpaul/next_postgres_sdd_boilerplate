import { beforeEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { HomePage } from "./HomePage";

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

test("signed out shows the heading and placeholder, no Sign out", async () => {
  const screen = await render(
    <HomePage currentUser={null} signOut={vi.fn(async () => ({ error: null }))} />,
  );
  await expect
    .element(screen.getByRole("heading", { name: "Home" }))
    .toBeVisible();
  await expect
    .element(
      screen.getByText("This is a starting point for a new application."),
    )
    .toBeVisible();
  await expect
    .element(screen.getByRole("button", { name: "Sign out" }))
    .not.toBeInTheDocument();
});

test("Sign out calls signOut and goes to /", async () => {
  const signOut = vi.fn(async () => ({ error: null }));
  const screen = await render(
    <HomePage currentUser={currentUser} signOut={signOut} />,
  );
  await screen.getByRole("button", { name: "Sign out" }).click();
  await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/"));
  expect(signOut).toHaveBeenCalled();
  expect(refresh).toHaveBeenCalled();
});

test("a sign-out error shows generic copy", async () => {
  const signOut = vi.fn(async () => ({ error: { code: "FAILED" } }));
  const screen = await render(
    <HomePage currentUser={currentUser} signOut={signOut} />,
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
    <HomePage currentUser={currentUser} signOut={signOut} />,
  );
  await screen.getByRole("button", { name: "Sign out" }).click();
  await expect
    .element(screen.getByRole("alert"))
    .toHaveTextContent("Something went wrong. Try again.");
  await expect.element(screen.getByText("boom")).not.toBeInTheDocument();
});
