import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { HomePage } from "./HomePage";

const meta = {
  title: "Pages/HomePage",
  component: HomePage,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    controls: { include: ["currentUser"] },
  },
  args: {
    currentUser: { email: "ada@example.com", role: "user" },
    signOut: fn(async () => {}),
  },
} satisfies Meta<typeof HomePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByRole("heading", { name: "Home" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Sign out" }));
    await expect(args.signOut).toHaveBeenCalled();
  },
};
