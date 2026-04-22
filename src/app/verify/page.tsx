"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const otp = searchParams.get("otp");
  const email = searchParams.get("email");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!otp || !email) {
      setStatus("error");
      setMessage("Missing OTP or email. Please check the verification link.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp, email }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setStatus("error");
        setMessage(result.message || "Verification failed. Please try again.");
        return;
      }

      setStatus("success");
      setMessage(result.message || "Email verified successfully!");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!otp || !email) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10">
        <section className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-zinc-900">Verify Email</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Invalid verification link. Please check your email for the correct link.
          </p>
          <p className="mt-4 text-sm text-zinc-600">
            <Link href="/sign-in" className="font-medium text-zinc-900 underline">
              Back to Sign In
            </Link>
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10">
      <section className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900">Verify Email</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Click the button below to verify your email address and activate your account.
        </p>

        <div className="mt-6 space-y-4">
          {message && (
            <p
              className={`rounded-md px-3 py-2 text-sm ${
                status === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message}
            </p>
          )}

          <button
            onClick={handleVerify}
            disabled={isSubmitting || status === "success"}
            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Verifying..." : status === "success" ? "Verified ✓" : "Verify Email"}
          </button>

          {status === "success" && (
            <p className="text-sm text-zinc-600">
              <Link href="/sign-in" className="font-medium text-zinc-900 underline">
                Go to Sign In
              </Link>
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
