"use client";
// Client component: holds the sign-out error state.

import { unstable_rethrow } from "next/navigation";
import { useState } from "react";
import { PageTemplate } from "@/components/templates/PageTemplate/PageTemplate";
import type { Role } from "@/generated/prisma/browser";

/**
 * `/` is public, so `currentUser` may be `null`. The content is the same
 * signed in or signed out.
 */
export type HomePageProps = {
  currentUser: { email: string; role: Role } | null;
  signOut: () => Promise<void>;
};

const HomePage = function HomePage({ currentUser, signOut }: HomePageProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSignOut() {
    try {
      await signOut();
    } catch (error) {
      // signOut redirects on success, which rejects with Next's redirect
      // error. Let that through so the router can navigate.
      unstable_rethrow(error);
      setErrorMessage("Something went wrong. Try again.");
      throw error;
    }
  }

  return (
    <PageTemplate currentUser={currentUser} onSignOut={onSignOut}>
      <div className="mx-auto w-full max-w-2xl">
        {errorMessage ? (
          <p className="mb-4 text-red-600" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <h2 className="mb-4 text-lg font-semibold">Home</h2>
        <p className="text-sm text-zinc-700">
          This is a starting point for a new application.
        </p>
      </div>
    </PageTemplate>
  );
};

export { HomePage };
export default HomePage;
