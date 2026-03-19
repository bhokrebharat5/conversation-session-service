import mongoose, { Document, Schema } from "mongoose";

export type SessionStatus = "initiated" | "active" | "completed" | "failed";

export interface IConversationSession {
  sessionId: string;
  status: SessionStatus;
  language: string;
  startedAt: Date;
  endedAt: Date | null;
  metadata?: Record<string, unknown>;
}

export interface IConversationSessionDoc
  extends IConversationSession,
    Document {}

const conversationSessionSchema = new Schema<IConversationSessionDoc>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["initiated", "active", "completed", "failed"],
      default: "initiated",
    },
    language: {
      type: String,
      required: true,
      default: "en",
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const ConversationSession = mongoose.model<IConversationSessionDoc>(
  "ConversationSession",
  conversationSessionSchema
);
