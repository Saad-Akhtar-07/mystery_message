import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/dbConnection";
import { UserModel } from "@/models/user.model";
import { isOTPExpired } from "@/lib/otp";

export interface VerifyResponse {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * POST /api/auth/verify
 * 
 * Verifies user email using OTP
 * Takes OTP and email in request body, marks user as verified if OTP matches and hasn't expired
 */
export async function POST(request: NextRequest): Promise<NextResponse<VerifyResponse>> {
  try {
    const body = await request.json();
    const { otp, email } = body;

    if (!otp || !email) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP and email are required.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find user by email
    const user = await UserModel.findOne({ email });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found. Please sign up first.",
        },
        { status: 404 }
      );
    }

    // Check if user is already verified
    if (user.isVerified) {
      return NextResponse.json(
        {
          success: false,
          message: "Your account is already verified. Please sign in.",
        },
        { status: 400 }
      );
    }

    // Check if OTP matches
    if (user.verificationToken !== otp) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid OTP. Please check and try again.",
        },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    if (user.verificationTokenExpires && isOTPExpired(user.verificationTokenExpires)) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP has expired. Please sign up again to get a new OTP.",
        },
        { status: 400 }
      );
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully! You can now sign in.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Verification failed. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
