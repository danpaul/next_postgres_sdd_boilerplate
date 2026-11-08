import { createRef } from "react";
import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { Header } from "./Header";

test("renders a visible heading named App", async () => {
  const screen = await render(<Header />);
  await expect
    .element(screen.getByRole("heading", { name: "App" }))
    .toBeVisible();
});

test("signed out shows Sign in and Sign up links and no Sign out", async () => {
  const screen = await render(<Header currentUser={null} />);
  await expect
    .element(screen.getByRole("link", { name: "Sign in" }))
    .toHaveAttribute("href", "/login");
  await expect
    .element(screen.getByRole("link", { name: "Sign up" }))
    .toHaveAttribute("href", "/signup");
  await expect
    .element(screen.getByRole("button", { name: "Sign out" }))
    .not.toBeInTheDocument();
});

test("signed in shows a Profile link, no email, and Sign out calls onSignOut", async () => {
  const onSignOut = vi.fn();
  const screen = await render(
    <Header
      currentUser={{ email: "ada@example.com", name: "Ada", role: "user" }}
      onSignOut={onSignOut}
    />,
  );
  await expect
    .element(screen.getByRole("link", { name: "Profile" }))
    .toHaveAttribute("href", "/profile");
  await expect
    .element(screen.getByText("ada@example.com"))
    .not.toBeInTheDocument();
  await screen.getByRole("button", { name: "Sign out" }).click();
  expect(onSignOut).toHaveBeenCalled();
});

test("admin user shows an Admin link to /admin, a Profile link, and no email", async () => {
  const screen = await render(
    <Header currentUser={{ email: "boss@example.com", name: "Boss", role: "admin" }} />,
  );
  await expect
    .element(screen.getByRole("link", { name: "Admin" }))
    .toHaveAttribute("href", "/admin");
  await expect
    .element(screen.getByRole("link", { name: "Profile" }))
    .toBeVisible();
  await expect
    .element(screen.getByText("boss@example.com"))
    .not.toBeInTheDocument();
});

test("normal user shows a Profile link and no Admin link", async () => {
  const screen = await render(
    <Header currentUser={{ email: "ada@example.com", name: "Ada", role: "user" }} />,
  );
  await expect
    .element(screen.getByRole("link", { name: "Profile" }))
    .toBeVisible();
  await expect
    .element(screen.getByRole("link", { name: "Admin" }))
    .not.toBeInTheDocument();
});

test("passes ref to the native header", async () => {
  const ref = createRef<HTMLElement>();
  await render(<Header ref={ref} />);
  expect(ref.current?.tagName).toBe("HEADER");
});
