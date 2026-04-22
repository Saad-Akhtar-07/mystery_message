import { auth } from "@/auth";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
          <p className="text-sm text-zinc-600">
            This page reads user data directly from the Auth.js session.
          </p>
        </div>
        <SignOutButton />
      </header>

      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-zinc-900">Session Snapshot</h2>
        <div className="mt-3 grid gap-2 text-sm text-zinc-700">
          <p>
            <span className="font-medium">User ID:</span> {session.user.id}
          </p>
          <p>
            <span className="font-medium">Username:</span> {session.user.username}
          </p>
          <p>
            <span className="font-medium">Email:</span> {session.user.email}
          </p>
          <p>
            <span className="font-medium">Verified:</span>{" "}
            {session.user.isVerified ? "Yes" : "No"}
          </p>
          <p>
            <span className="font-medium">Accepting Messages:</span>{" "}
            {session.user.isAcceptingMessages ? "Yes" : "No"}
          </p>
        </div>
      </section>
    </main>
  );
}
