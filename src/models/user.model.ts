import mongoose, { Document, Model, Schema } from "mongoose";

export interface UserDocument extends Document {
  username: string;
  email: string;
  password: string;
  verificationToken?: string | null;
  verificationTokenExpires?: Date | null;
  isAcceptingMessages: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 128,
    },
    isAcceptingMessages: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    verificationTokenExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const UserModel: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>("User", userSchema);

export default UserModel;
