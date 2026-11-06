"use client";

import { unstable_rethrow } from "next/navigation";
import { useState } from "react";
import { SignUpForm } from "@/components/molecules/SignUpForm/SignUpForm";
import { PageTemplate } from "@/components/templates/PageTemplate/PageTemplate";

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
        <h2 className="mb-4 text-lg font-semibold">Sign up</h2>
        {errorMessage ? (
          <p className="mb-4 text-red-600" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <SignUpForm onSubmit={onSubmit} />
      </div>
    </PageTemplate>
  );
};

export { SignUpPage };
export default SignUpPage;
