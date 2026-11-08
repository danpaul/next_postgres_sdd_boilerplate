import { beforeEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { SignUpPage } from "./SignUpPage";

const { push, refresh } = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

beforeEach(() => {
  push.mockReset();
  refresh.mockReset();
});

async function submit(
  screen: Awaited<ReturnType<typeof render>>,
  confirmPassword = "password123",
) {
  await screen.getByRole("textbox", { name: "Name" }).fill("Ada");
  await screen.getByRole("textbox", { name: "Email" }).fill("ada@example.com");
  await screen.getByLabelText("Password", { exact: true }).fill("password123");
  await screen.getByLabelText("Confirm password").fill(confirmPassword);
  await screen.getByRole("button", { name: "Sign up" }).click();
}

test("a duplicate email shows generic copy", async () => {
  const signUp = vi.fn(async () => ({
    data: null,
    error: { code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL", message: "exists" },
  }));
  const screen = await render(<SignUpPage signUp={signUp} />);
  await submit(screen);
  await expect
    .element(screen.getByRole("alert"))
    .toHaveTextContent("Something went wrong. Try again.");
  expect(push).not.toHaveBeenCalled();
});

test("a thrown error shows generic copy, not error.message", async () => {
  const signUp = vi.fn(async () => {
    throw new Error("boom");
  });
  const screen = await render(<SignUpPage signUp={signUp} />);
  await submit(screen);
  await expect
    .element(screen.getByRole("alert"))
    .toHaveTextContent("Something went wrong. Try again.");
  await expect.element(screen.getByText("boom")).not.toBeInTheDocument();
});

test("mismatched passwords show an error without calling signUp", async () => {
  const signUp = vi.fn(async () => ({ data: null, error: null }));
  const screen = await render(<SignUpPage signUp={signUp} />);
  await submit(screen, "different1");
  await expect
    .element(screen.getByRole("alert"))
    .toHaveTextContent("Passwords do not match.");
  expect(signUp).not.toHaveBeenCalled();
});

test("success calls signUp with name, email, and password and goes home", async () => {
  const signUp = vi.fn(async () => ({
    data: { user: { role: "user" } },
    error: null,
  }));
  const screen = await render(<SignUpPage signUp={signUp} />);
  await submit(screen);
  await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/"));
  expect(signUp).toHaveBeenCalledWith({
    name: "Ada",
    email: "ada@example.com",
    password: "password123",
  });
  expect(refresh).toHaveBeenCalled();
});
