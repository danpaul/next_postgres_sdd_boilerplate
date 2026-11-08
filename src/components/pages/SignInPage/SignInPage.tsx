"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SignInForm } from "@/components/molecules/SignInForm/SignInForm";
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

export type SignInPageProps = {
  /** Defaults to `authClient.signIn.email`. Injected only by tests and stories. */
  signIn?: (input: { email: string; password: string }) => Promise<AuthResult>;
};

const defaultSignIn: NonNullable<SignInPageProps["signIn"]> = (input) =>
  authClient.signIn.email(input);

const SignInPage = function SignInPage({
  signIn = defaultSignIn,
}: SignInPageProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(input: { email: string; password: string }) {
    setErrorMessage(null);
    let result: AuthResult;
    try {
      result = await signIn(input);
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
