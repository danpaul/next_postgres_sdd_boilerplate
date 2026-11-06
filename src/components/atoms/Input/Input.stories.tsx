import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input } from "./Input";

const documentedProps = ["type", "disabled", "placeholder"] as const;

const meta = {
  title: "Atoms/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    controls: {
      include: [...documentedProps],
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
    await userEvent.type(canvas.getByRole("textbox", { name: "Title" }), "Buy peppers");
  },
};
