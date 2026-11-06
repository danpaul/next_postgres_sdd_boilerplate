import { createRef } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { Textarea } from "./Textarea";

test("renders a visible textbox named Description", async () => {
  const screen = await render(<Textarea aria-label="Description" />);
  await expect
    .element(screen.getByRole("textbox", { name: "Description" }))
    .toBeVisible();
});

test("passes ref to the native textarea", async () => {
  const ref = createRef<HTMLTextAreaElement>();
  await render(<Textarea ref={ref} aria-label="Description" />);
  expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
});
