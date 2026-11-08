import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { ProfilePage } from "./ProfilePage";

const meta = {
  title: "Pages/ProfilePage",
  component: ProfilePage,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true },
    controls: { include: ["currentUser"] },
  },
  args: {
    currentUser: { email: "ada@example.com", name: "Ada", role: "user" },
    signOut: fn(async () => ({ error: null })),
  },
} satisfies Meta<typeof ProfilePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await expect(
      canvas.getByRole("heading", { name: "Profile" }),
    ).toBeVisible();
    await expect(canvas.getByText("ada@example.com")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Sign out" }));
    await expect(args.signOut).toHaveBeenCalled();
  },
};
