"use client";

import { useActionState } from "react";
import { signIn, type FormState } from "@/app/admin/actions";
import { Field, SubmitButton, inputClass } from "@/components/admin/ui";

export function LoginForm() {
  const [state, action] = useActionState<FormState, FormData>(signIn, {});
  return (
    <form action={action} className="space-y-4">
      <Field label="Email"><input name="email" type="email" required autoComplete="email" className={inputClass} /></Field>
      <Field label="Password"><input name="password" type="password" required autoComplete="current-password" className={inputClass} /></Field>
      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      <SubmitButton pendingLabel="Signing in…">Sign in</SubmitButton>
    </form>
  );
}
