"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login, type LoginFormState } from "@/lib/actions/auth";

const initialState: LoginFormState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-foreground px-5 py-3 font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
        />
      </div>
      {state.status === "error" && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
