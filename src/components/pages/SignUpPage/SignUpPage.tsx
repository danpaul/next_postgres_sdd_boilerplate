"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SignUpForm } from "@/components/molecules/SignUpForm/SignUpForm";
import { PageTemplate } from "@/components/templates/PageTemplate/PageTemplate";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  authClient,
  authErrorMessage,
  GENERIC_ERROR,
  homePathForRole,
} from "@/lib/auth-client";

type AuthResult = {
  data?: { user?: { role?: string | null } } | null;
  error: { code?: string; message?: string } | null;
};

export type SignUpPageProps = {
  /** Defaults to `authClient.signUp.email`. Injected only by tests and stories. */
  signUp?: (input: {
    name: string;
    email: string;
    password: string;
  }) => Promise<AuthResult>;
};

const defaultSignUp: NonNullable<SignUpPageProps["signUp"]> = (input) =>
  authClient.signUp.email(input);

const SignUpPage = function SignUpPage({
  signUp = defaultSignUp,
}: SignUpPageProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(input: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) {
    setErrorMessage(null);
    const name = input.name.trim();
    if (name === "") {
      setErrorMessage("Enter your name.");
      return;
    }
    if (input.password !== input.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    let result: AuthResult;
    try {
      result = await signUp({ name, email: input.email, password: input.password });
    } catch {
      setErrorMessage(GENERIC_ERROR);
      return;
    }
    if (result.error) {
      setErrorMessage(authErrorMessage(result.error));
      return;
    }
    router.push(homePathForRole(result.data?.user?.role));
    router.refresh();
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
