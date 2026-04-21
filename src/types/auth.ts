/**
 * Response type for signup operations
 * Provides consistent success/error responses across auth endpoints
 */
export interface SignupResponse {
  success: boolean;
  message: string;
  data?: {
    userId?: string;
    username?: string;
    email?: string;
  };
  error?: string;
}

/**
 * Signup request payload
 */
export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

/**
 * Response status codes and messages for different signup scenarios
 */
export const SIGNUP_RESPONSES = {
  // Success cases
  USER_CREATED_VERIFICATION_SENT: {
    statusCode: 201,
    message: "User registered successfully! Check your email for OTP.",
  },
  USER_ALREADY_VERIFIED: {
    statusCode: 409,
    message: "User already exists and is verified. Please login instead.",
  },
  VERIFICATION_RESENT: {
    statusCode: 200,
    message: "User already exists but unverified. New OTP sent to your email.",
  },
  // Error cases
  VALIDATION_ERROR: {
    statusCode: 400,
    message: "Invalid input data. Please check your inputs.",
  },
  DB_CONNECTION_ERROR: {
    statusCode: 500,
    message: "Database connection failed. Please try again later.",
  },
  EMAIL_SEND_ERROR: {
    statusCode: 500,
    message: "Failed to send verification email. Please try again.",
  },
  INTERNAL_ERROR: {
    statusCode: 500,
    message: "An internal server error occurred. Please try again.",
  },
} as const;
