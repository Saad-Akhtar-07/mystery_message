import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CopyProfileUrl } from "@/components/copy-profile-url";
import { MessageAcceptanceSwitch } from "@/components/message-acceptance-switch";
import { MessageCard } from "@/components/message-card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Mail } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  // Fetch messages for the current user
  let messages: any[] = [];
  let acceptanceStatus = false;
  let error: string | null = null;

  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    // Fetch messages
    const messagesResponse = await fetch(`${baseUrl}/api/messages`, {
      headers: {
        Cookie: `authjs.session-token=${session.user.id}`,
      },
      next: { revalidate: 0 },
    });

    if (messagesResponse.ok) {
      const data = await messagesResponse.json();
      messages = data.messages || [];
    }

    // Fetch acceptance status
    const acceptanceResponse = await fetch(
      `${baseUrl}/api/message-acceptance`,
      {
        headers: {
          Cookie: `authjs.session-token=${session.user.id}`,
        },
        next: { revalidate: 0 },
      }
    );

    if (acceptanceResponse.ok) {
      const data = await acceptanceResponse.json();
      acceptanceStatus = data.isAcceptingMessages;
    }
  } catch (err) {
    error = "Failed to fetch dashboard data";
    console.error("Dashboard error:", err);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
            Dashboard
          </h1>
          <p className="mt-2 text-zinc-600">
            Share your profile and manage your messages
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Profile & Settings Section */}
        <div className="space-y-6 mb-8">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">
                  Your Profile
                </h2>
                <p className="mt-1 text-sm text-zinc-600">
                  Share this link to receive anonymous messages
                </p>
              </div>

              <CopyProfileUrl username={session.user.username} />

              <Separator />

              <MessageAcceptanceSwitch initialStatus={acceptanceStatus} />
            </div>
          </div>
        </div>

        {/* Messages Section */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Messages ({messages.length})
          </h2>

          <Separator className="my-4" />

          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Mail className="h-12 w-12 text-zinc-300 mb-4" />
              <p className="text-zinc-600">
                No messages yet. Share your profile link to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={message._id || index}>
                  <MessageCard
                    content={message.content}
                    senderName="Anonymous"
                    createdAt={
                      message.createdAt
                        ? new Date(message.createdAt).toLocaleDateString()
                        : undefined
                    }
                  />
                  {index < messages.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

