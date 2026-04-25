import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/dbConnection";
import { UserModel } from "@/models/user.model";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const username = url.searchParams.get("username")?.trim().toLowerCase();

    // Validate username
    if (!username) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing username",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    /**
     * Only check verified users
     *
     * Logic:
     * - If a VERIFIED user already has this username → not available
     * - If only UNVERIFIED users have this username → available
     *
     * This allows expired/unverified accounts to not block usernames forever
     */
    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUser) {
      return NextResponse.json({
        success: true,
        available: false,
        message: "Username already exists",
      });
    }

    return NextResponse.json({
      success: true,
      available: true,
      message: "Username is available",
    });
  } catch (error) {
    console.error("check-username error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}