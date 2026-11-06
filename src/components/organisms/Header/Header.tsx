"use client";

import Link from "next/link";
import { useState, type ComponentProps } from "react";
import { Button } from "@/components/atoms/Button/Button";
import type { Role } from "@/generated/prisma/browser";

export type HeaderProps = ComponentProps<"header"> & {
  currentUser?: { email: string; role: Role } | null;
  onSignOut?: () => void | Promise<void>;
};

const Header = function Header({
  currentUser,
  onSignOut,
  className,
  ref,
  ...props
}: HeaderProps) {
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await onSignOut?.();
    } catch {
      // The page already showed its alert; nothing more to do here.
    } finally {
      setSigningOut(false);
    }
  }

  const classes = [
    "flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header {...props} ref={ref} className={classes}>
      <h1 className="text-xl font-semibold text-black">App</h1>
      {currentUser ? (
        <div className="flex items-center gap-3">
          {currentUser.role === "admin" ? (
            <Link
              href="/admin"
              className="rounded-full bg-black px-2 py-0.5 text-xs font-medium text-white hover:bg-zinc-700"
            >
              Admin
            </Link>
          ) : null}
          <Link
            href="/profile"
            className="text-sm font-medium text-black hover:underline"
          >
            Profile
          </Link>
          <Button
            variant="secondary"
            size="sm"
            disabled={signingOut}
            onClick={handleSignOut}
          >
            Sign out
          </Button>
        </div>
      ) : (
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/login" className="text-black hover:underline">
            Sign in
          </Link>
          <Link href="/signup" className="text-black hover:underline">
            Sign up
          </Link>
        </nav>
      )}
    </header>
  );
};

export { Header };
export default Header;
