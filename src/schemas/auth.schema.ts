import { z } from "zod";
import { passwordSchema, usernameSchema } from "@/schemas/user.schema";

export const signInSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
});

export type SignInInput = z.infer<typeof signInSchema>;
