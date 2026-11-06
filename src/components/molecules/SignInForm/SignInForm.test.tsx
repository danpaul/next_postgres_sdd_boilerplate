import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { SignInForm } from "./SignInForm";

test("renders labeled Email and Password fields and a Sign in button", async () => {
  const screen = await render(<SignInForm onSubmit={vi.fn()} />);
  await expect
    .element(screen.getByRole("textbox", { name: "Email" }))
    .toBeVisible();
  await expect.element(screen.getByLabelText("Password")).toBeVisible();
  await expect
    .element(screen.getByRole("button", { name: "Sign in" }))
    .toBeVisible();
});

test("submit calls onSubmit with the typed values", async () => {
  const onSubmit = vi.fn();
  const screen = await render(<SignInForm onSubmit={onSubmit} />);
  await screen.getByRole("textbox", { name: "Email" }).fill("ada@example.com");
  await screen.getByLabelText("Password").fill("password123");
  await screen.getByRole("button", { name: "Sign in" }).click();
  expect(onSubmit).toHaveBeenCalledWith({
    email: "ada@example.com",
    password: "password123",
  });
});

test("Sign in is disabled while onSubmit is pending", async () => {
  const onSubmit = vi.fn(() => new Promise<void>(() => {}));
  const screen = await render(<SignInForm onSubmit={onSubmit} />);
  const button = screen.getByRole("button", { name: "Sign in" });
  await button.click();
  await expect.element(button).toBeDisabled();
});
