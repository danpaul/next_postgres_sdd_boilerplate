"use client";

import Link from "next/link";
import { useState, type ComponentProps } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Role } from "@/generated/prisma/browser";
import { cn } from "@/lib/utils";

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

  const classes = cn(
    "flex items-center justify-between border-b border-border bg-background px-6 py-4",
    className,
  );

  return (
    <header {...props} ref={ref} className={classes}>
      <h1 className="text-xl font-semibold text-foreground">App</h1>
      {currentUser ? (
        <div className="flex items-center gap-3">
          {currentUser.role === "admin" ? (
            <Badge asChild>
              <Link href="/admin">Admin</Link>
            </Badge>
          ) : null}
          <Link
            href="/profile"
            className="text-sm font-medium text-foreground hover:underline"
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
          <Link href="/login" className="text-foreground hover:underline">
            Sign in
          </Link>
          <Link href="/signup" className="text-foreground hover:underline">
            Sign up
          </Link>
        </nav>
      )}
    </header>
  );
};

export { Header };
export default Header;
