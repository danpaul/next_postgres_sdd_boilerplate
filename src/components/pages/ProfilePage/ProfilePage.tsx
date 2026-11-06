"use client";
// Client component: holds the sign-out error state.

import { unstable_rethrow } from "next/navigation";
import { useState } from "react";
import { PageTemplate } from "@/components/templates/PageTemplate/PageTemplate";
import type { Role } from "@/generated/prisma/browser";

/**
 * The route (`src/app/profile/page.tsx`) only renders this for signed-in users,
 * so `currentUser` is required.
 */
export type ProfilePageProps = {
  currentUser: { email: string; role: Role };
  signOut: () => Promise<void>;
};

const ProfilePage = function ProfilePage({
  currentUser,
  signOut,
}: ProfilePageProps) {
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
        <h2 className="mb-4 text-lg font-semibold">Profile</h2>
        <p className="text-sm text-zinc-700">{currentUser.email}</p>
      </div>
    </PageTemplate>
  );
};

export { ProfilePage };
export default ProfilePage;
