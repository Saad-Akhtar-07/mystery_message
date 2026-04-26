import Link from "next/link";
import { SignOutButton } from "./auth/sign-out-button";
import type { Session } from "next-auth";

interface NavbarProps {
  session: Session | null;
}

export function Navbar({ session }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link 
          href="/" 
          className="text-2xl font-bold tracking-tight text-zinc-900 hover:text-zinc-700 transition-colors"
        >
           Mystery Message
        </Link>

        <div className="flex items-center gap-6">
          {session?.user ? (
            <>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-zinc-900 to-zinc-700 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {session.user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-zinc-700">
                  {session.user.username}
                </span>
              </div>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/sign-in"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 active:scale-95"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
