import { Resend } from "resend";
import { EmailTemplate } from "@/components/email-template";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, verificationLink } = body;

    // Validate required fields
    if (!email || !username) {
      return NextResponse.json(
        { error: "Email and username are required" },
        { status: 400 }
      );
    }

    // Send email using Resend with react-email template
    const { data, error } = await resend.emails.send({
      from: "noreply@mystery-message.com",
      to: email,
      subject: "Welcome to Mystery Message! Verify your email",
      react: EmailTemplate({ username, verificationLink }),
    });

    // Handle errors from Resend
    if (error) {
      console.error("Resend API error:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Email sent successfully", data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
