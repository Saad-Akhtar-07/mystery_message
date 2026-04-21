import mongoose, { Document, Model, Schema } from "mongoose";

export interface MessageDocument extends Document {
  content: string;
  recipientId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<MessageDocument>(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 1000,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ recipientId: 1, createdAt: -1 });

export const MessageModel: Model<MessageDocument> =
  mongoose.models.Message ||
  mongoose.model<MessageDocument>("Message", messageSchema);

export default MessageModel;
