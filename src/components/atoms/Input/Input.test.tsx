import { createRef } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { Input } from "./Input";

test("renders a visible textbox named Title", async () => {
  const screen = await render(<Input aria-label="Title" />);
  await expect
    .element(screen.getByRole("textbox", { name: "Title" }))
    .toBeVisible();
});

test("passes ref to the native input", async () => {
  const ref = createRef<HTMLInputElement>();
  await render(<Input ref={ref} aria-label="Title" />);
  expect(ref.current).toBeInstanceOf(HTMLInputElement);
});
