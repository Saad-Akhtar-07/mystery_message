import * as React from "react";

interface EmailTemplateProps {
  username: string;
  verificationLink?: string;
}

export function EmailTemplate({ username, verificationLink }: EmailTemplateProps) {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
        backgroundColor: "#f5f5f5",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          padding: "30px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h1 style={{ color: "#333", marginBottom: "20px" }}>
          Welcome to Mystery Message, {username}!
        </h1>

        <p style={{ color: "#666", lineHeight: "1.6", marginBottom: "20px" }}>
          Thank you for signing up. We&apos;re excited to have you join our community!
        </p>

        {verificationLink && (
          <div style={{ marginBottom: "20px" }}>
            <p style={{ color: "#666", marginBottom: "15px" }}>
              Click the button below to verify your email address:
            </p>
            <a
              href={verificationLink}
              style={{
                display: "inline-block",
                backgroundColor: "#007bff",
                color: "#ffffff",
                padding: "12px 30px",
                borderRadius: "6px",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Verify Email
            </a>
          </div>
        )}

        <p style={{ color: "#999", fontSize: "12px", marginTop: "30px" }}>
          If you didn&apos;t sign up for this account, please ignore this email.
        </p>
      </div>
    </div>
  );
}
