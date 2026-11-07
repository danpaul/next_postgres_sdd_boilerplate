import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Input } from "./input";

const meta = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    controls: {
      include: ["type", "disabled", "placeholder"],
    },
  },
  args: {
    "aria-label": "Title",
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Title" });
    await userEvent.type(input, "Buy peppers");
    await expect(input).toHaveValue("Buy peppers");
  },
};
