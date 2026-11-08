import { beforeEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { SignInPage } from "./SignInPage";

const { push, refresh } = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

beforeEach(() => {
  push.mockReset();
  refresh.mockReset();
});

async function submit(screen: Awaited<ReturnType<typeof render>>) {
  await screen.getByRole("textbox", { name: "Email" }).fill("ada@example.com");
  await screen.getByLabelText("Password").fill("password123");
  await screen.getByRole("button", { name: "Sign in" }).click();
}

test("invalid credentials show the matching copy", async () => {
  const signIn = vi.fn(async () => ({
    data: null,
    error: { code: "INVALID_EMAIL_OR_PASSWORD", message: "nope" },
  }));
  const screen = await render(<SignInPage signIn={signIn} />);
  await submit(screen);
  await expect
    .element(screen.getByRole("alert"))
    .toHaveTextContent("Invalid email or password.");
  expect(push).not.toHaveBeenCalled();
});

test("a thrown error shows generic copy, not error.message", async () => {
  const signIn = vi.fn(async () => {
    throw new Error("boom");
  });
  const screen = await render(<SignInPage signIn={signIn} />);
  await submit(screen);
  await expect
    .element(screen.getByRole("alert"))
    .toHaveTextContent("Something went wrong. Try again.");
  await expect.element(screen.getByText("boom")).not.toBeInTheDocument();
});

test("an admin sign-in goes to /admin", async () => {
  const signIn = vi.fn(async () => ({
    data: { user: { role: "admin" } },
    error: null,
  }));
  const screen = await render(<SignInPage signIn={signIn} />);
  await submit(screen);
  await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/admin"));
  expect(signIn).toHaveBeenCalledWith({
    email: "ada@example.com",
    password: "password123",
  });
  expect(refresh).toHaveBeenCalled();
});
