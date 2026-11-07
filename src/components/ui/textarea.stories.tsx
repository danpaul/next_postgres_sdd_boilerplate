import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Textarea } from "./textarea";

const meta = {
  title: "UI/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    controls: {
      include: ["disabled", "placeholder"],
    },
  },
  args: {
    "aria-label": "Description",
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const textarea = canvas.getByRole("textbox", { name: "Description" });
    await userEvent.type(textarea, "Habanero and jalapeño");
    await expect(textarea).toHaveValue("Habanero and jalapeño");
  },
};
