import { createRef } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { Button } from "./Button";

test("renders children", async () => {
  const screen = await render(<Button>Save</Button>);
  await expect
    .element(screen.getByRole("button", { name: "Save" }))
    .toBeVisible();
});

test("loading sets native disabled and aria-disabled", async () => {
  const screen = await render(<Button loading>Save</Button>);
  // children use `invisible` when loading, so do not require an accessible name
  const button = screen.getByRole("button");
  await expect.element(button).toBeDisabled();
  await expect.element(button).toHaveAttribute("aria-disabled", "true");
});

test("disabled sets native disabled and aria-disabled", async () => {
  const screen = await render(<Button disabled>Save</Button>);
  const button = screen.getByRole("button", { name: "Save" });
  await expect.element(button).toBeDisabled();
  await expect.element(button).toHaveAttribute("aria-disabled", "true");
});

test("passes ref to the native button", async () => {
  const ref = createRef<HTMLButtonElement>();
  await render(<Button ref={ref}>Save</Button>);
  expect(ref.current).toBeInstanceOf(HTMLButtonElement);
});
