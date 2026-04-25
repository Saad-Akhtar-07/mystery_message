import { NextRequest, NextResponse } from "next/server";
import { createUserSchema } from "@/schemas/user.schema";
import { UserModel } from "@/models/user.model";
import { connectToDatabase } from "@/lib/dbConnection";
import { hashPassword } from "@/lib/auth";
import { generateOTP, getOTPExpiration } from "@/lib/otp";
import nodemailer from "nodemailer";
import { EmailTemplate } from "@/components/email-template";
import {
  SignupResponse,
  SignupRequest,
  SIGNUP_RESPONSES,
} from "@/types/auth";
import { ZodError } from "zod";

const SENDER_EMAIL = process.env.SMTP_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || "no-reply@localhost";

/**
 * Send verification email via Resend
 * @param email - Recipient email address
 * @param username - Username for email template
 * @param otp - OTP code for verification link
 * @returns Object with success status and error if any
 */
async function sendVerificationEmail(
  email: string,
  username: string,
  otp: string
) {
  const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify?otp=${otp}&email=${encodeURIComponent(email)}`;

  // Render an HTML email. Avoid importing react-dom/server inside app routes
  // to keep build/tooling simple — produce the same markup as EmailTemplate.
  const html = `
  <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px; background-color:#f5f5f5;">
    <div style="background-color:#ffffff; border-radius:8px; padding:30px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
      <h1 style="color:#333; margin-bottom:20px;">Welcome to Mystery Message, ${username}!</h1>
      <p style="color:#666; line-height:1.6; margin-bottom:20px;">Thank you for signing up. We're excited to have you join our community!</p>
      ${verificationLink ? `
        <div style="margin-bottom:20px;">
          <p style="color:#666; margin-bottom:15px;">Click the button below to verify your email address:</p>
          <a href="${verificationLink}" style="display:inline-block; background-color:#007bff; color:#ffffff; padding:12px 30px; border-radius:6px; text-decoration:none; font-weight:bold;">Verify Email</a>
        </div>
      ` : ""}
      <p style="color:#999; font-size:12px; margin-top:30px;">If you didn't sign up for this account, please ignore this email.</p>
    </div>
  </div>`;

  // Read SMTP config from env
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpSecure = process.env.SMTP_SECURE === "true";

  // If SMTP isn't configured, return the verification link (dev fallback)
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn("SMTP not configured. Skipping email send. Verification link:", verificationLink);
    return { error: null, verificationLink, skipped: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: !!smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const info = await transporter.sendMail({
      from: SENDER_EMAIL,
      to: email,
      subject: "Welcome to Mystery Message! Verify Your Email",
      html,
    });

    return { error: null, info, verificationLink };
  } catch (err) {
    console.error("Nodemailer error:", err);
    return { error: err, verificationLink };
  }
}

/**
 * POST /api/auth/signup
 * 
 * Handles user registration with three scenarios:
 * 1. First-time user: Creates account, generates OTP, sends verification email
 * 2. User exists and verified: Returns error (ask to login)
 * 3. User exists but unverified: Regenerates OTP, sends new verification email
 */
export async function POST(request: NextRequest): Promise<NextResponse<SignupResponse>> {
  try {
    // Parse request body
    const body: SignupRequest = await request.json();

    // Validate input using Zod schema
    const validatedData = createUserSchema.parse(body);
    const { username, email, password } = validatedData;

    // Connect to database
    await connectToDatabase();

    // Check if user already exists in database
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { username }],
    });

    // ========== CASE 2: User already exists and is verified ==========
    if (existingUser && existingUser.isVerified) {
      return NextResponse.json(
        {
          success: false,
          message: SIGNUP_RESPONSES.USER_ALREADY_VERIFIED.message,
          error: "User already verified",
        },
        { status: SIGNUP_RESPONSES.USER_ALREADY_VERIFIED.statusCode }
      );
    }

    // Generate OTP and expiration time
    const otp = generateOTP();
    const otpExpiration = getOTPExpiration();

    // ========== CASE 3: User exists but not verified ==========
    if (existingUser && !existingUser.isVerified) {
      // Update existing user with new OTP
      existingUser.verificationToken = otp;
      existingUser.verificationTokenExpires = otpExpiration;
      await existingUser.save();

      // Send verification email with OTP
      try {
        const { error: emailError, skipped, verificationLink } = await sendVerificationEmail(email, username, otp);

        if (emailError) {
          console.error("Email send error:", emailError);
          return NextResponse.json(
            {
              success: false,
              message: SIGNUP_RESPONSES.EMAIL_SEND_ERROR.message,
              error: "Failed to send email",
            },
            { status: SIGNUP_RESPONSES.EMAIL_SEND_ERROR.statusCode }
          );
        }

        // If SMTP not configured (dev), return the verification link so devs can continue testing
        if (skipped) {
          return NextResponse.json(
            {
              success: true,
              message: SIGNUP_RESPONSES.VERIFICATION_RESENT.message,
              data: {
                email,
                username,
                verificationLink,
              },
            },
            { status: SIGNUP_RESPONSES.VERIFICATION_RESENT.statusCode }
          );
        }
      } catch (emailSendError) {
        console.error("Email sending exception:", emailSendError);
        return NextResponse.json(
          {
            success: false,
            message: SIGNUP_RESPONSES.EMAIL_SEND_ERROR.message,
            error: "Failed to send email",
          },
          { status: SIGNUP_RESPONSES.EMAIL_SEND_ERROR.statusCode }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: SIGNUP_RESPONSES.VERIFICATION_RESENT.message,
          data: {
            email,
            username,
          },
        },
        { status: SIGNUP_RESPONSES.VERIFICATION_RESENT.statusCode }
      );
    }

    // ========== CASE 1: First-time user (new signup) ==========
    // Hash the password before storing
    const hashedPassword = await hashPassword(password);

    // Create new user document
    const newUser = new UserModel({
      username,
      email,
      password: hashedPassword,
      isVerified: false,
      isAcceptingMessages: true,
      verificationToken: otp,
      verificationTokenExpires: otpExpiration,
    });

    // Save user to database
    await newUser.save();

    // Send verification email with OTP
    try {
      const { error: emailError, skipped, verificationLink } = await sendVerificationEmail(email, username, otp);

      if (emailError) {
        console.error("Email send error:", emailError);
        // User was created but email failed - still inform client
        return NextResponse.json(
          {
            success: false,
            message: SIGNUP_RESPONSES.EMAIL_SEND_ERROR.message,
            error: "User created but verification email failed",
          },
          { status: SIGNUP_RESPONSES.EMAIL_SEND_ERROR.statusCode }
        );
      }

      // Dev fallback: include verification link in response when SMTP not configured
      if (skipped) {
        return NextResponse.json(
          {
            success: true,
            message: SIGNUP_RESPONSES.USER_CREATED_VERIFICATION_SENT.message,
            data: {
              userId: newUser._id?.toString(),
              username: newUser.username,
              email: newUser.email,
              verificationLink,
            },
          },
          { status: SIGNUP_RESPONSES.USER_CREATED_VERIFICATION_SENT.statusCode }
        );
      }
    } catch (emailSendError) {
      console.error("Email sending exception:", emailSendError);
      return NextResponse.json(
        {
          success: false,
          message: SIGNUP_RESPONSES.EMAIL_SEND_ERROR.message,
          error: "User created but verification email failed",
        },
        { status: SIGNUP_RESPONSES.EMAIL_SEND_ERROR.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: SIGNUP_RESPONSES.USER_CREATED_VERIFICATION_SENT.message,
        data: {
          userId: newUser._id?.toString(),
          username: newUser.username,
          email: newUser.email,
        },
      },
      { status: SIGNUP_RESPONSES.USER_CREATED_VERIFICATION_SENT.statusCode }
    );
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const formattedErrors = error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return NextResponse.json(
        {
          success: false,
          message: SIGNUP_RESPONSES.VALIDATION_ERROR.message,
          error: JSON.stringify(formattedErrors),
        },
        { status: SIGNUP_RESPONSES.VALIDATION_ERROR.statusCode }
      );
    }

    // Handle database connection errors
    if (error instanceof Error && error.message.includes("MONGODB")) {
      return NextResponse.json(
        {
          success: false,
          message: SIGNUP_RESPONSES.DB_CONNECTION_ERROR.message,
          error: "Database connection failed",
        },
        { status: SIGNUP_RESPONSES.DB_CONNECTION_ERROR.statusCode }
      );
    }

    // Handle all other errors
    console.error("Signup error:", error);
    return NextResponse.json(
      {
        success: false,
        message: SIGNUP_RESPONSES.INTERNAL_ERROR.message,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: SIGNUP_RESPONSES.INTERNAL_ERROR.statusCode }
    );
  }
}
