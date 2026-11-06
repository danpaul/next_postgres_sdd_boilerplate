import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { SignInPage } from "./SignInPage";

const meta = {
  title: "Pages/SignInPage",
  component: SignInPage,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    controls: { include: [] },
  },
  args: {
    signIn: fn(async () => ({ error: "Invalid email or password." })),
  },
} satisfies Meta<typeof SignInPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(
      canvas.getByRole("textbox", { name: "Email" }),
      "ada@example.com",
    );
    await userEvent.type(canvas.getByLabelText("Password"), "wrongpassword");
    await userEvent.click(canvas.getByRole("button", { name: "Sign in" }));
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "Invalid email or password.",
    );
  },
};
