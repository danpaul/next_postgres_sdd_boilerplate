import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Footer } from "./Footer";

const meta = {
  title: "Organisms/Footer",
  component: Footer,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    controls: {
      include: [],
    },
  },
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const terms = canvas.getByRole("link", { name: "Terms" });
    terms.addEventListener("click", (event) => {
      event.preventDefault();
    });
    await userEvent.click(terms);
  },
};
