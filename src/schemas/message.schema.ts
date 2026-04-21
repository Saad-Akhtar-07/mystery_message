import { z } from "zod";

export const messageContentSchema = z
  .string()
  .trim()
  .min(1, "Message cannot be empty.")
  .max(1000, "Message must be at most 1000 characters.");

export const createMessageSchema = z.object({
  content: messageContentSchema,
  recipientId: z.string().trim().min(1, "Recipient is required."),
});

export const updateMessageSchema = z
  .object({
    content: messageContentSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required for update.",
  });

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;
