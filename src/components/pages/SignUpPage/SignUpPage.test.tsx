import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { SignUpPage } from "./SignUpPage";

async function submit(screen: Awaited<ReturnType<typeof render>>) {
  await screen.getByRole("textbox", { name: "Email" }).fill("ada@example.com");
  await screen.getByLabelText("Password", { exact: true }).fill("password123");
  await screen.getByLabelText("Confirm password").fill("password123");
  await screen.getByRole("button", { name: "Sign up" }).click();
}

test("a resolved error shows in the alert", async () => {
  const signUp = vi.fn(async () => ({ error: "Passwords do not match." }));
  const screen = await render(<SignUpPage signUp={signUp} />);
  await submit(screen);
  await expect
    .element(screen.getByRole("alert"))
    .toHaveTextContent("Passwords do not match.");
});

test("a thrown error shows generic copy, not error.message", async () => {
  const signUp = vi.fn(async (): Promise<{ error: string }> => {
    throw new Error("boom");
  });
  const screen = await render(<SignUpPage signUp={signUp} />);
  await submit(screen);
  await expect
    .element(screen.getByRole("alert"))
    .toHaveTextContent("Something went wrong. Try again.");
  await expect.element(screen.getByText("boom")).not.toBeInTheDocument();
});
