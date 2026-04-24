import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/dbConnection";
import { UserModel } from "@/models/user.model";
import { z } from "zod";

/**
 * Schema to validate the toggle request body
 * Accepts a boolean value to set the message acceptance status
 */
const toggleMessageAcceptanceSchema = z.object({
  isAcceptingMessages: z
    .boolean()
    .refine((val) => typeof val === "boolean", {
      message: "isAcceptingMessages must be a boolean",
    }),
});

type ToggleMessageAcceptanceInput = z.infer<typeof toggleMessageAcceptanceSchema>;

/**
 * GET /api/message-acceptance
 *
 * Retrieves the current user's message acceptance status
 *
 * Response:
 * - 200: { success: true, isAcceptingMessages: boolean }
 * - 401: { error: "Unauthorized. Please sign in." }
 * - 500: { error: "Failed to fetch message acceptance status" }
 */
export async function GET(request: NextRequest) {
  try {
    // Get the user session
    const session = await auth();

    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    // Connect to the database and fetch the latest message acceptance status
    await connectToDatabase();
    const user = await UserModel.findById(session.user.id).select(
      "isAcceptingMessages"
    );

    // Check if user was found
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        isAcceptingMessages: user.isAcceptingMessages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching message acceptance status:", error);
    return NextResponse.json(
      { error: "Failed to fetch message acceptance status" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/message-acceptance
 *
 * Toggles or sets the user's message acceptance status
 *
 * Request body:
 * {
 *   "isAcceptingMessages": true | false
 * }
 *
 * Response:
 * - 200: { success: true, isAcceptingMessages: boolean, message: "Message acceptance status updated" }
 * - 400: { error: "Validation error message" }
 * - 401: { error: "Unauthorized. Please sign in." }
 * - 500: { error: "Failed to update message acceptance status" }
 */
export async function PUT(request: NextRequest) {
  try {
    // Get the user session
    const session = await auth();

    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = toggleMessageAcceptanceSchema.safeParse(body);

    if (!validationResult.success) {
      // Extract the first validation error message
      const errorMessage =
        validationResult.error.issues[0]?.message || "Invalid request body";
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    const { isAcceptingMessages } = validationResult.data;

    // Connect to the database
    await connectToDatabase();

    // Update the user's message acceptance status
    const updatedUser = await UserModel.findByIdAndUpdate(
      session.user.id,
      { isAcceptingMessages },
      { new: true } // Return the updated document
    );

    // Check if user was found and updated
    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        isAcceptingMessages: updatedUser.isAcceptingMessages,
        message: "Message acceptance status updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    console.error("Error updating message acceptance status:", error);
    return NextResponse.json(
      { error: "Failed to update message acceptance status" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/message-acceptance
 *
 * Same functionality as PUT - toggles or sets the user's message acceptance status
 * This allows flexibility in how the frontend calls the endpoint
 */
export async function PATCH(request: NextRequest) {
  return PUT(request);
}
