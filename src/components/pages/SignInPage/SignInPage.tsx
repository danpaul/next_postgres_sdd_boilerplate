"use client";

import { unstable_rethrow } from "next/navigation";
import { useState } from "react";
import { SignInForm } from "@/components/molecules/SignInForm/SignInForm";
import { PageTemplate } from "@/components/templates/PageTemplate/PageTemplate";

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
        <h2 className="mb-4 text-lg font-semibold">Sign in</h2>
        {errorMessage ? (
          <p className="mb-4 text-red-600" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <SignInForm onSubmit={onSubmit} />
      </div>
    </PageTemplate>
  );
};

export { SignInPage };
export default SignInPage;
