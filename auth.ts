import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { comparePassword } from "@/lib/auth";
import { connectToDatabase } from "@/lib/dbConnection";
import { UserModel } from "@/models/user.model";
import { signInSchema } from "@/schemas/auth.schema";
import type { AppSessionUser } from "@/types/auth-session";

class InvalidCredentialsError extends CredentialsSignin {
  code = "invalid_credentials";
}

class EmailNotVerifiedError extends CredentialsSignin {
  code = "email_not_verified";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    Credentials({
      credentials: {
        username: {
          label: "Username",
          type: "text",
          placeholder: "johndoe",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "********",
        },
      },
      authorize: async (credentials) => {
        const parsedCredentials = signInSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          throw new InvalidCredentialsError();
        }

        const { username, password } = parsedCredentials.data;

        await connectToDatabase();

        const existingUser = await UserModel.findOne({ username }).lean();

        if (!existingUser) {
          throw new InvalidCredentialsError();
        }

        if (!existingUser.isVerified) {
          throw new EmailNotVerifiedError();
        }

        const isPasswordValid = await comparePassword(password, existingUser.password);

        if (!isPasswordValid) {
          throw new InvalidCredentialsError();
        }

        const safeUser: AppSessionUser = {
          id: existingUser._id.toString(),
          username: existingUser.username,
          email: existingUser.email,
          isVerified: existingUser.isVerified,
          isAcceptingMessages: existingUser.isAcceptingMessages,
        };

        return safeUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Only copy user data into token during sign-in.
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
      }

      return token;
    },
    async session({ session, token }) {
      if (
        session.user &&
        typeof token.id === "string" &&
        typeof token.username === "string" &&
        typeof token.email === "string"
      ) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.email = token.email;
        session.user.isVerified = Boolean(token.isVerified);
        session.user.isAcceptingMessages = Boolean(token.isAcceptingMessages);
      }

      return session;
    },
  },
});
