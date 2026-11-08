import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { AdminPage } from "./AdminPage";

const meta = {
  title: "Pages/AdminPage",
  component: AdminPage,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true },
    controls: { include: ["currentUser", "users"] },
  },
  args: {
    currentUser: { email: "boss@example.com", name: "Boss", role: "admin" },
    users: [
      { id: "user-2", email: "ada@example.com", role: "user" },
      { id: "user-1", email: "boss@example.com", role: "admin" },
    ],
    signOut: fn(async () => ({ error: null })),
  },
} satisfies Meta<typeof AdminPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByRole("heading", { name: "Users" })).toBeVisible();
    // 1 header row + 2 user rows.
    await expect(canvas.getAllByRole("row")).toHaveLength(3);
    await expect(canvas.getByText("ada@example.com")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Sign out" }));
    await expect(args.signOut).toHaveBeenCalled();
  },
};
