import { createRef } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { PageTemplate } from "./PageTemplate";

test("renders banner and contentinfo", async () => {
  const screen = await render(
    <PageTemplate>
      <p>Slot content</p>
    </PageTemplate>,
  );
  await expect.element(screen.getByRole("banner")).toBeVisible();
  await expect.element(screen.getByRole("contentinfo")).toBeVisible();
});

test("given children, those children are inside main", async () => {
  const screen = await render(
    <PageTemplate>
      <p>Slot content</p>
    </PageTemplate>,
  );
  await expect
    .element(screen.getByRole("main").getByText("Slot content"))
    .toBeVisible();
});

test("given currentUser, the Profile link is inside banner", async () => {
  const screen = await render(
    <PageTemplate currentUser={{ email: "ada@example.com", role: "user" }}>
      <p>Slot content</p>
    </PageTemplate>,
  );
  await expect
    .element(screen.getByRole("banner").getByRole("link", { name: "Profile" }))
    .toBeVisible();
});

test("passes ref to the native div", async () => {
  const ref = createRef<HTMLDivElement>();
  await render(
    <PageTemplate ref={ref}>
      <p>Slot content</p>
    </PageTemplate>,
  );
  expect(ref.current).toBeInstanceOf(HTMLDivElement);
});
