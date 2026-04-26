import Link from "next/link";
import { SignInForm } from "@/app/sign-in/sign-in-form";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10">
      <section className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900">Sign In</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Use your username and password. Only verified accounts can sign in.
        </p>

        <div className="mt-6">
          <SignInForm />
        </div>

        <p className="mt-4 text-sm text-zinc-600">
          Need an account?{" "}
          <Link href="/sign-up" className="font-medium text-zinc-900 underline">
            Sign up
          </Link>
        </p>
      </section>
    </main>
  );
}