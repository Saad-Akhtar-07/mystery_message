import { auth } from "@/auth";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12">
      <section className="w-full max-w-2xl rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-zinc-900">Mystery Message</h1>
        <p className="mt-3 text-zinc-600">
          Anonymous messaging with OTP verification and credentials-based auth.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
              >
                Open Dashboard
              </Link>
              <p className="self-center text-sm text-zinc-600">
                Signed in as <span className="font-medium">{session.user.username}</span>
              </p>
            </>
          ) : (
            <Link
              href="/sign-in"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
            >
              Sign In
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
