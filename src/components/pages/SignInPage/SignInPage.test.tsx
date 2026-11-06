import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { SignInPage } from "./SignInPage";

async function submit(screen: Awaited<ReturnType<typeof render>>) {
  await screen.getByRole("textbox", { name: "Email" }).fill("ada@example.com");
  await screen.getByLabelText("Password").fill("password123");
  await screen.getByRole("button", { name: "Sign in" }).click();
}

test("a resolved error shows in the alert", async () => {
  const signIn = vi.fn(async () => ({ error: "Invalid email or password." }));
  const screen = await render(<SignInPage signIn={signIn} />);
  await submit(screen);
  await expect
    .element(screen.getByRole("alert"))
    .toHaveTextContent("Invalid email or password.");
});

test("a thrown error shows generic copy, not error.message", async () => {
  const signIn = vi.fn(async (): Promise<{ error: string }> => {
    throw new Error("boom");
  });
  const screen = await render(<SignInPage signIn={signIn} />);
  await submit(screen);
  await expect
    .element(screen.getByRole("alert"))
    .toHaveTextContent("Something went wrong. Try again.");
  await expect.element(screen.getByText("boom")).not.toBeInTheDocument();
});
