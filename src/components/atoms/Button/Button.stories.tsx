import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./Button";

const documentedProps = [
  "variant",
  "size",
  "loading",
  "fullWidth",
  "disabled",
  "children",
  "type",
] as const;

const meta = {
  title: "Atoms/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    controls: {
      include: [...documentedProps],
    },
  },
  args: {
    variant: "primary",
    size: "md",
    loading: false,
    fullWidth: false,
    children: "Button",
  },
  argTypes: {
    className: { table: { disable: true } },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Button" }));
  },
};
