"use server";

import { signIn } from "@/auth";
import { signInSchema } from "@/schemas/auth.schema";
import { AuthError, CredentialsSignin } from "next-auth";

export interface SignInFormState {
  status: "idle" | "error";
  message: string | null;
}

export async function signInWithCredentials(
  _: SignInFormState,
  formData: FormData
): Promise<SignInFormState> {
  const validatedCredentials = signInSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!validatedCredentials.success) {
    return {
      status: "error",
      message: validatedCredentials.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const { username, password } = validatedCredentials.data;

  try {
    await signIn("credentials", {
      username,
      password,
      redirectTo: "/dashboard",
    });

    return {
      status: "idle" as const,
      message: null,
    };
  } catch (error) {
    if (error instanceof CredentialsSignin) {
      if (error.code === "email_not_verified") {
        return {
          status: "error",
          message: "Please verify your account first. Check your email for OTP.",
        };
      }

      return {
        status: "error",
        message: "Invalid username or password.",
      };
    }

    if (error instanceof AuthError) {
      return {
        status: "error",
        message: "Authentication failed. Please try again.",
      };
    }

    throw error;
  }
}
