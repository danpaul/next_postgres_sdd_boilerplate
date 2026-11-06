"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/atoms/Button/Button";
import { Input } from "@/components/atoms/Input/Input";

export type SignInFormProps = {
  onSubmit: (input: { email: string; password: string }) => void | Promise<void>;
};

const SignInForm = function SignInForm({ onSubmit }: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ email, password });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-3" noValidate onSubmit={handleSubmit}>
      <label className="text-sm font-medium" htmlFor="sign-in-email">
        Email
      </label>
      <Input
        id="sign-in-email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <label className="text-sm font-medium" htmlFor="sign-in-password">
        Password
      </label>
      <Input
        id="sign-in-password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <Button type="submit" variant="primary" disabled={submitting}>
        Sign in
      </Button>
    </form>
  );
};

export { SignInForm };
export default SignInForm;
