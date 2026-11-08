"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type SignUpFormProps = {
  onSubmit: (input: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => void | Promise<void>;
};

const SignUpForm = function SignUpForm({ onSubmit }: SignUpFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ name, email, password, confirmPassword });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-3" noValidate onSubmit={handleSubmit}>
      <Label htmlFor="sign-up-name">Name</Label>
      <Input
        id="sign-up-name"
        type="text"
        autoComplete="name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <Label htmlFor="sign-up-email">Email</Label>
      <Input
        id="sign-up-email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Label htmlFor="sign-up-password">Password</Label>
      <Input
        id="sign-up-password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <Label htmlFor="sign-up-confirm-password">Confirm password</Label>
      <Input
        id="sign-up-confirm-password"
        type="password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
      />
      <Button type="submit" disabled={submitting}>
        Sign up
      </Button>
    </form>
  );
};

export { SignUpForm };
export default SignUpForm;
