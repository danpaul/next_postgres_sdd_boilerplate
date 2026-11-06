"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/atoms/Button/Button";
import { Input } from "@/components/atoms/Input/Input";

export type SignUpFormProps = {
  onSubmit: (input: {
    email: string;
    password: string;
    confirmPassword: string;
  }) => void | Promise<void>;
};

const SignUpForm = function SignUpForm({ onSubmit }: SignUpFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ email, password, confirmPassword });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-3" noValidate onSubmit={handleSubmit}>
      <label className="text-sm font-medium" htmlFor="sign-up-email">
        Email
      </label>
      <Input
        id="sign-up-email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <label className="text-sm font-medium" htmlFor="sign-up-password">
        Password
      </label>
      <Input
        id="sign-up-password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <label className="text-sm font-medium" htmlFor="sign-up-confirm-password">
        Confirm password
      </label>
      <Input
        id="sign-up-confirm-password"
        type="password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
      />
      <Button type="submit" variant="primary" disabled={submitting}>
        Sign up
      </Button>
    </form>
  );
};

export { SignUpForm };
export default SignUpForm;
