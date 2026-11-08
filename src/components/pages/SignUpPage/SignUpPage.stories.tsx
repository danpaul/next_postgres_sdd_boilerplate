import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { SignUpPage } from "./SignUpPage";

const meta = {
  title: "Pages/SignUpPage",
  component: SignUpPage,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true },
    controls: { include: [] },
  },
  args: {
    signUp: fn(async () => ({ data: { user: { role: "user" } }, error: null })),
  },
} satisfies Meta<typeof SignUpPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole("textbox", { name: "Name" }), "Ada");
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
      "different1",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Sign up" }));
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "Passwords do not match.",
    );
    await expect(args.signUp).not.toHaveBeenCalled();
  },
};
