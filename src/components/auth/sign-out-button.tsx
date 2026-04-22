"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => void signOut({ callbackUrl: "/sign-in" })}
      className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-900"
    >
      Sign out
    </button>
  );
}
