"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounceCallback } from "usehooks-ts";
import { toast } from "sonner";
import * as z from "zod";
import { createUserSchema } from "@/schemas/user.schema";
import type { SignupResponse } from "@/types/auth";

type FormData = z.infer<typeof createUserSchema>;

interface UsernameCheckResponse {
  success: boolean;
  available?: boolean;
}

export function SignUpForm() {
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(createUserSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const usernameValue = watch("username");

  // Debounced callback to check username availability
  const checkUsernameAvailability = useDebounceCallback(
    async (username: string) => {
      if (!username || username.length < 3) {
        setUsernameAvailable(null);
        return;
      }

      try {
        setIsCheckingUsername(true);
        const response = await fetch(
          `/api/auth/check-username?username=${encodeURIComponent(username)}`
        );

        const data = (await response.json()) as UsernameCheckResponse;

        if (data.success) {
          setUsernameAvailable(data.available ?? false);

          if (!data.available) {
            setError("username", {
              type: "manual",
              message: "Username is already taken",
            });
          }
        }
      } catch (error) {
        console.error("Error checking username:", error);
        toast.error("Failed to check username availability");
      } finally {
        setIsCheckingUsername(false);
      }
    },
    500
  );

  // Handle username change with debounced check
  const handleUsernameChange = useCallback(
    (value: string) => {
      // Clear the availability state while typing
      setUsernameAvailable(null);
      // Trigger debounced check
      checkUsernameAvailability(value);
    },
    [checkUsernameAvailability]
  );

  const onSubmit = async (data: FormData) => {
    // Final validation: ensure username is available
    if (!usernameAvailable) {
      toast.error("Username is not available");
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = (await response.json()) as SignupResponse;

      if (!response.ok || !result.success) {
        toast.error(result.message || "Sign-up failed. Please try again.");
        return;
      }

      toast.success(
        result.message || "Account created! Check your email to verify."
      );
      // Reset form is handled by React Hook Form
    } catch (error) {
      console.error("Sign-up error:", error);
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Username Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="username" className="text-sm font-semibold text-zinc-900">
            Username
          </label>
          <div className="flex items-center gap-2">
            {isCheckingUsername && (
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-pulse" />
                <span className="text-xs text-zinc-500">checking...</span>
              </div>
            )}
            {usernameAvailable && !isCheckingUsername && (
              <span className="text-xs text-emerald-600 font-medium">✓ available</span>
            )}
          </div>
        </div>
        <Controller
          name="username"
          control={control}
          render={({ field }) => (
            <div className="relative">
              <input
                {...field}
                id="username"
                type="text"
                placeholder="e.g., john_doe"
                onChange={(e) => {
                  field.onChange(e);
                  handleUsernameChange(e.target.value);
                }}
                className={`w-full px-4 py-3 rounded-lg border-2 text-sm font-medium text-zinc-900 placeholder-zinc-400 outline-none transition duration-200 ${
                  errors.username
                    ? "border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200"
                    : usernameAvailable
                      ? "border-emerald-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
                      : "border-zinc-200 bg-white hover:border-zinc-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                }`}
                aria-invalid={!!errors.username}
              />
            </div>
          )}
        />
        {errors.username && (
          <p className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
            <span>⚠</span>
            {errors.username.message}
          </p>
        )}
        <p className="text-xs text-zinc-500">
          3-30 characters. Letters, numbers, and underscores only.
        </p>
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-semibold text-zinc-900">
          Email Address
        </label>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              id="email"
              type="email"
              placeholder="you@example.com"
              className={`w-full px-4 py-3 rounded-lg border-2 text-sm font-medium text-zinc-900 placeholder-zinc-400 outline-none transition duration-200 ${
                errors.email
                  ? "border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200"
                  : "border-zinc-200 bg-white hover:border-zinc-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              }`}
              aria-invalid={!!errors.email}
            />
          )}
        />
        {errors.email && (
          <p className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
            <span>⚠</span>
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-semibold text-zinc-900">
          Password
        </label>
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              id="password"
              type="password"
              placeholder="••••••••••••"
              className={`w-full px-4 py-3 rounded-lg border-2 text-sm font-medium text-zinc-900 placeholder-zinc-400 outline-none transition duration-200 ${
                errors.password
                  ? "border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200"
                  : "border-zinc-200 bg-white hover:border-zinc-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              }`}
              aria-invalid={!!errors.password}
            />
          )}
        />
        {errors.password && (
          <p className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
            <span>⚠</span>
            {errors.password.message}
          </p>
        )}
        <p className="text-xs text-zinc-500">
          Minimum 8 characters for your security.
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={
          isSubmitting ||
          !isValid ||
          isCheckingUsername ||
          usernameAvailable === false
        }
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition duration-200 ${
          isSubmitting ||
          !isValid ||
          isCheckingUsername ||
          usernameAvailable === false
            ? "bg-zinc-300 cursor-not-allowed text-zinc-600"
            : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg active:scale-95"
        }`}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Creating account...
          </div>
        ) : (
          "Create Account"
        )}
      </button>

      {/* Sign In Link */}
      <div className="text-center pt-2">
        <p className="text-sm text-zinc-600">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition"
          >
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
}