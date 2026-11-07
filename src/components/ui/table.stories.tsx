import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

const meta = {
  title: "UI/Table",
  component: Table,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    controls: {
      include: [],
    },
  },
  render: (args) => (
    <Table {...args}>
      <TableCaption>Users</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Email</TableHead>
          <TableHead scope="col">Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>ada@example.com</TableCell>
          <TableCell>user</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>boss@example.com</TableCell>
          <TableCell>admin</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    // 1 header row + 2 body rows.
    await expect(canvas.getAllByRole("row")).toHaveLength(3);
  },
};
