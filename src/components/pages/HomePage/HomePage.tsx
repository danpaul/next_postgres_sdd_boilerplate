"use client";
// Client component: holds the sign-out error state.

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageTemplate } from "@/components/templates/PageTemplate/PageTemplate";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authClient, GENERIC_ERROR } from "@/lib/auth-client";

/**
 * `/` is public, so `currentUser` may be `null`. The content is the same
 * signed in or signed out.
 */
export type HomePageProps = {
  currentUser: { email: string; name: string; role: "user" | "admin" } | null;
  /** Defaults to `authClient.signOut`. Injected only by tests and stories. */
  signOut?: () => Promise<{ error: { code?: string } | null }>;
};

const defaultSignOut: NonNullable<HomePageProps["signOut"]> = () =>
  authClient.signOut();

const HomePage = function HomePage({
  currentUser,
  signOut = defaultSignOut,
}: HomePageProps) {
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
        {errorMessage ? (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}
        <h2 className="mb-4 text-lg font-semibold">Home</h2>
        <p className="text-sm text-muted-foreground">
          This is a starting point for a new application.
        </p>
      </div>
    </PageTemplate>
  );
};

export { HomePage };
export default HomePage;
