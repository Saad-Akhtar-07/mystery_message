"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { INITIAL_SIGN_IN_STATE } from "@/lib/constants";
import { signInWithCredentials } from "@/app/sign-in/actions";

function SignInButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-zinc-900 px-4 py-2 text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Signing in..." : "Sign In"}
    </button>
  );
}

export function SignInForm() {
  const [state, formAction] = useActionState(
    signInWithCredentials,
    INITIAL_SIGN_IN_STATE
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="username" className="text-sm font-medium text-zinc-700">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none ring-0 transition focus:border-zinc-500"
          placeholder="your_username"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium text-zinc-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none ring-0 transition focus:border-zinc-500"
          placeholder="********"
        />
      </div>

      {state.status === "error" && state.message ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.message}
        </p>
      ) : null}

      <SignInButton />
    </form>
  );
}
