import type { Preview } from "@storybook/nextjs-vite";
import { Geist, Geist_Mono } from "next/font/google";
import "../src/app/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const preview: Preview = {
  decorators: [
    (Story) => {
      document.documentElement.classList.add(
        geistSans.variable,
        geistMono.variable,
        "antialiased",
      );
      return <Story />;
    },
  ],
};

export default preview;
