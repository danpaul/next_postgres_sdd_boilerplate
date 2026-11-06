import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { Header } from "./Header";

const meta = {
  title: "Organisms/Header",
  component: Header,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    controls: {
      include: ["currentUser"],
    },
  },
  args: {
    currentUser: { email: "ada@example.com", role: "user" },
    onSignOut: fn(),
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await expect(
      canvas.getByRole("heading", { name: "App" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("link", { name: "Profile" }),
    ).toHaveAttribute("href", "/profile");
    await expect(
      canvas.queryByText("ada@example.com"),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole("link", { name: "Admin" }),
    ).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Sign out" }));
    await expect(args.onSignOut).toHaveBeenCalled();
  },
};
