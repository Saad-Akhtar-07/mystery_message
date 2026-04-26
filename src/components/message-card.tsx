import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MessageCardProps {
  content: string;
  senderName?: string;
  createdAt?: string;
}

export function MessageCard({
  content,
  senderName = "Anonymous",
  createdAt,
}: MessageCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Message</CardTitle>
        <CardDescription>
          {senderName} • {createdAt || new Date().toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-zinc-700">{content}</p>
      </CardContent>
    </Card>
  );
}
