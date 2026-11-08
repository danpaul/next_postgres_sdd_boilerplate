"use client";
// Client component: holds the sign-out error state.

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageTemplate } from "@/components/templates/PageTemplate/PageTemplate";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { authClient, GENERIC_ERROR } from "@/lib/auth-client";

/**
 * The route (`src/app/profile/page.tsx`) only renders this for signed-in users,
 * so `currentUser` is required.
 */
export type ProfilePageProps = {
  currentUser: { email: string; name: string; role: "user" | "admin" };
  /** Defaults to `authClient.signOut`. Injected only by tests and stories. */
  signOut?: () => Promise<{ error: { code?: string } | null }>;
};

const defaultSignOut: NonNullable<ProfilePageProps["signOut"]> = () =>
  authClient.signOut();

const ProfilePage = function ProfilePage({
  currentUser,
  signOut = defaultSignOut,
}: ProfilePageProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSignOut() {
    let result: Awaited<ReturnType<typeof signOut>>;
    try {
      result = await signOut();
    } catch (error) {
      setErrorMessage(GENERIC_ERROR);
      throw error;
    }
    if (result.error) {
      setErrorMessage(GENERIC_ERROR);
      throw new Error("Sign out failed");
    }
    router.push("/");
    router.refresh();
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
