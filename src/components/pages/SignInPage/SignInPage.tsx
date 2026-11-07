"use client";

import { unstable_rethrow } from "next/navigation";
import { useState } from "react";
import { SignInForm } from "@/components/molecules/SignInForm/SignInForm";
import { PageTemplate } from "@/components/templates/PageTemplate/PageTemplate";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type SignInPageProps = {
  signIn: (input: {
    email: string;
    password: string;
  }) => Promise<{ error: string }>;
};

const SignInPage = function SignInPage({ signIn }: SignInPageProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(input: { email: string; password: string }) {
    try {
      const result = await signIn(input);
      setErrorMessage(result.error);
    } catch (error) {
      // Success redirects, which rejects with the Next.js redirect error.
      // Let that through so the router can navigate.
      unstable_rethrow(error);
      setErrorMessage("Something went wrong. Try again.");
    }
  }

  return (
    <PageTemplate>
      <div className="mx-auto w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Sign in</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {errorMessage ? (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : null}
            <SignInForm onSubmit={onSubmit} />
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
};

export { SignInPage };
export default SignInPage;
