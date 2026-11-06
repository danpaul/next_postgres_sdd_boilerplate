import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { SignInForm } from "./SignInForm";

const meta = {
  title: "Molecules/SignInForm",
  component: SignInForm,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    controls: {
      include: [],
    },
  },
  args: {
    onSubmit: fn(),
  },
} satisfies Meta<typeof SignInForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(
      canvas.getByRole("textbox", { name: "Email" }),
      "ada@example.com",
    );
    await userEvent.type(canvas.getByLabelText("Password"), "password123");
    await userEvent.click(canvas.getByRole("button", { name: "Sign in" }));
    await expect(args.onSubmit).toHaveBeenCalledWith({
      email: "ada@example.com",
      password: "password123",
    });
  },
};
