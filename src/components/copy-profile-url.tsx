"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CopyProfileUrlProps {
  username: string;
}

export function CopyProfileUrl({ username }: CopyProfileUrlProps) {
  const [copied, setCopied] = useState(false);

  const profileUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/u/${username}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 hover:border-zinc-300 active:scale-95"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-green-600" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          <span>Copy Profile URL</span>
        </>
      )}
    </button>
  );
}
