"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const acceptanceSchema = z.object({
  isAcceptingMessages: z.boolean(),
});

type AcceptanceFormData = z.infer<typeof acceptanceSchema>;

interface MessageAcceptanceSwitchProps {
  initialStatus: boolean;
}

export function MessageAcceptanceSwitch({
  initialStatus,
}: MessageAcceptanceSwitchProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { watch, handleSubmit, reset } = useForm<AcceptanceFormData>({
    resolver: zodResolver(acceptanceSchema),
    defaultValues: {
      isAcceptingMessages: initialStatus,
    },
  });

  const isAcceptingMessages = watch("isAcceptingMessages");

  const onSubmit = async (data: AcceptanceFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/message-acceptance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isAcceptingMessages: data.isAcceptingMessages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update preference");
      }

      // Success - UI already updated optimistically
    } catch (err) {
      // Revert UI on error
      reset({ isAcceptingMessages: initialStatus });
      setError(
        err instanceof Error ? err.message : "Failed to update preference"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4">
        <div>
          <p className="font-medium text-zinc-900">Accept Messages</p>
          <p className="text-sm text-zinc-600">
            {isAcceptingMessages
              ? "Users can send you messages"
              : "Messages are disabled"}
          </p>
        </div>
        <Switch
          checked={isAcceptingMessages}
          onCheckedChange={(checked) => {
            reset({ isAcceptingMessages: checked }, { keepDirty: true });
            // Auto-submit on toggle
            handleSubmit(onSubmit)();
          }}
          disabled={isLoading}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </form>
  );
}
