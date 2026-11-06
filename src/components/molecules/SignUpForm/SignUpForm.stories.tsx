import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { SignUpForm } from "./SignUpForm";

const meta = {
  title: "Molecules/SignUpForm",
  component: SignUpForm,
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
} satisfies Meta<typeof SignUpForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(
      canvas.getByRole("textbox", { name: "Email" }),
      "ada@example.com",
    );
    await userEvent.type(
      canvas.getByLabelText("Password", { exact: true }),
      "password123",
    );
    await userEvent.type(
      canvas.getByLabelText("Confirm password"),
      "password123",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Sign up" }));
    await expect(args.onSubmit).toHaveBeenCalledWith({
      email: "ada@example.com",
      password: "password123",
      confirmPassword: "password123",
    });
  },
};
