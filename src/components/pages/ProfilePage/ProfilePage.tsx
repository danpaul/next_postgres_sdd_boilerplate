"use client";
// Client component: holds the sign-out error state.

import { unstable_rethrow } from "next/navigation";
import { useState } from "react";
import { PageTemplate } from "@/components/templates/PageTemplate/PageTemplate";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Profile</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {errorMessage ? (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : null}
            <div className="flex flex-col gap-2">
              <Label>Email</Label>
              <p className="text-sm text-muted-foreground">
                {currentUser.email}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
};

export { ProfilePage };
export default ProfilePage;
