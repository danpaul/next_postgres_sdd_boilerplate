import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { SignUpForm } from "./SignUpForm";

test("renders labeled fields and a Sign up button", async () => {
  const screen = await render(<SignUpForm onSubmit={vi.fn()} />);
  await expect
    .element(screen.getByRole("textbox", { name: "Email" }))
    .toBeVisible();
  await expect
    .element(screen.getByLabelText("Password", { exact: true }))
    .toBeVisible();
  await expect
    .element(screen.getByLabelText("Confirm password"))
    .toBeVisible();
  await expect
    .element(screen.getByRole("button", { name: "Sign up" }))
    .toBeVisible();
});

test("submit calls onSubmit with the typed values", async () => {
  const onSubmit = vi.fn();
  const screen = await render(<SignUpForm onSubmit={onSubmit} />);
  await screen.getByRole("textbox", { name: "Email" }).fill("ada@example.com");
  await screen.getByLabelText("Password", { exact: true }).fill("password123");
  await screen.getByLabelText("Confirm password").fill("password123");
  await screen.getByRole("button", { name: "Sign up" }).click();
  expect(onSubmit).toHaveBeenCalledWith({
    email: "ada@example.com",
    password: "password123",
    confirmPassword: "password123",
  });
});

test("Sign up is disabled while onSubmit is pending", async () => {
  const onSubmit = vi.fn(() => new Promise<void>(() => {}));
  const screen = await render(<SignUpForm onSubmit={onSubmit} />);
  const button = screen.getByRole("button", { name: "Sign up" });
  await button.click();
  await expect.element(button).toBeDisabled();
});
