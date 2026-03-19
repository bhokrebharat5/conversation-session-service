import mongoose, { Document, Schema } from "mongoose";

export type EventType = "user_speech" | "bot_speech" | "system";

export interface IConversationEvent {
  eventId: string;
  sessionId: string;
  type: EventType;
  payload: Record<string, unknown>;
  timestamp: Date;
}

export interface IConversationEventDoc extends IConversationEvent, Document {}

const conversationEventSchema = new Schema<IConversationEventDoc>(
  {
    eventId: {
      type: String,
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["user_speech", "bot_speech", "system"],
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: eventId must be unique per session
conversationEventSchema.index({ sessionId: 1, eventId: 1 }, { unique: true });

// Index for querying events by session ordered by timestamp
conversationEventSchema.index({ sessionId: 1, timestamp: 1 });

export const ConversationEvent = mongoose.model<IConversationEventDoc>(
  "ConversationEvent",
  conversationEventSchema
);
