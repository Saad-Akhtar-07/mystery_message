import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/dbConnection";
import { UserModel } from "@/models/user.model";
import { MessageModel } from "@/models/message.model";
import { createMessageSchema } from "@/schemas/message.schema";

/**
 * GET /api/messages
 *
 * Retrieves all messages received by the authenticated user
 * Messages are sorted by newest first (descending by createdAt)
 *
 * Query Parameters (optional):
 * - limit: number of messages to return (default: 50, max: 100)
 * - skip: number of messages to skip for pagination (default: 0)
 *
 * Response:
 * - 200: { success: true, messages: MessageDocument[], total: number }
 * - 401: { error: "Unauthorized. Please sign in." }
 * - 500: { error: "Failed to fetch messages" }
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

    // Connect to the database
    await connectToDatabase();

    // Extract pagination parameters from query string
    const url = new URL(request.url);
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") || "50"),
      100
    );
    const skip = parseInt(url.searchParams.get("skip") || "0");

    // Fetch messages for the current user as recipient
    const messages = await MessageModel.find({
      recipientId: session.user.id,
    })
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(limit)
      .skip(skip)
      .lean(); // Use lean() for better performance since we're only reading

    // Get total count of messages for pagination info
    const totalMessages = await MessageModel.countDocuments({
      recipientId: session.user.id,
    });

    return NextResponse.json(
      {
        success: true,
        messages,
        total: totalMessages,
        limit,
        skip,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/messages
 *
 * Sends an anonymous message to another user
 *
 * Request body:
 * {
 *   "content": "string (1-1000 characters)",
 *   "recipientUsername": "string (username of recipient)"
 * }
 *
 * Response:
 * - 201: { success: true, message: MessageDocument, messageId: string }
 * - 400: { error: "Validation error message" }
 * - 401: { error: "Unauthorized. Please sign in." } (optional, depending on use case)
 * - 404: { error: "Recipient not found" }
 * - 403: { error: "Recipient is not accepting messages" }
 * - 500: { error: "Failed to send message" }
 *
 * Note: This route allows both authenticated and unauthenticated users to send messages
 * The message is anonymous - sender information is not stored
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();

    // Validate the request using the schema
    const validationResult = createMessageSchema.safeParse(body);

    if (!validationResult.success) {
      // Extract the first validation error message
      const errorMessage =
        validationResult.error.issues[0]?.message || "Invalid request body";
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    const { content, recipientId: recipientUsername } = validationResult.data;

    // Connect to the database
    await connectToDatabase();

    // Find the recipient by username
    const recipient = await UserModel.findOne({
      username: recipientUsername.toLowerCase(),
    });

    // Check if recipient exists
    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    // Check if recipient is accepting messages
    if (!recipient.isAcceptingMessages) {
      return NextResponse.json(
        { error: "Recipient is not accepting messages" },
        { status: 403 }
      );
    }

    // Create and save the new message
    const newMessage = await MessageModel.create({
      content,
      recipientId: recipient._id,
    });

    return NextResponse.json(
      {
        success: true,
        message: newMessage,
        messageId: newMessage._id.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
