"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { createUserSchema } from "@/schemas/user.schema";
import type { SignupResponse } from "@/types/auth";

type FormStatus = "idle" | "success" | "error";

const initialFormData = {
  username: "",
  email: "",
  password: "",
};

export function SignUpForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusClasses = useMemo(() => {
    if (status === "success") {
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    }

    if (status === "error") {
      return "bg-red-50 text-red-700 border border-red-200";
    }

    return "";
  }, [status]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("idle");
    setMessage(null);

    const parsedData = createUserSchema.safeParse(formData);

    if (!parsedData.success) {
      setStatus("error");
      setMessage(parsedData.error.issues[0]?.message ?? "Invalid input.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedData.data),
      });

      const result = (await response.json()) as SignupResponse;

      if (!response.ok || !result.success) {
        setStatus("error");
        setMessage(result.message || "Sign-up failed. Please try again.");
        return;
      }

      setStatus("success");
      setMessage(result.message);
      setFormData({ username: "", email: "", password: "" });
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="username" className="text-sm font-medium text-zinc-700">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleChange}
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-500"
          placeholder="your_username"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium text-zinc-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-500"
          placeholder="you@example.com"
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
          value={formData.password}
          onChange={handleChange}
          required
          minLength={8}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-500"
          placeholder="********"
        />
      </div>

      {message ? <p className={`rounded-md px-3 py-2 text-sm ${statusClasses}`}>{message}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-zinc-900 px-4 py-2 text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Creating account..." : "Create Account"}
      </button>

      <p className="text-sm text-zinc-600">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-zinc-900 underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}