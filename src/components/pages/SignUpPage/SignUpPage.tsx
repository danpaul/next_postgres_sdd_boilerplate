"use client";

import { unstable_rethrow } from "next/navigation";
import { useState } from "react";
import { SignUpForm } from "@/components/molecules/SignUpForm/SignUpForm";
import { PageTemplate } from "@/components/templates/PageTemplate/PageTemplate";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type SignUpPageProps = {
  signUp: (input: {
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<{ error: string }>;
};

const SignUpPage = function SignUpPage({ signUp }: SignUpPageProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(input: {
    email: string;
    password: string;
    confirmPassword: string;
  }) {
    try {
      const result = await signUp(input);
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
              <h2>Sign up</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {errorMessage ? (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : null}
            <SignUpForm onSubmit={onSubmit} />
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
};

export { SignUpPage };
export default SignUpPage;
