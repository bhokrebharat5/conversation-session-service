import {
  ConversationSession,
  IConversationSessionDoc,
} from "../models/conversation-session.model";

export class SessionRepository {
  async findBySessionId(
    sessionId: string
  ): Promise<IConversationSessionDoc | null> {
    return ConversationSession.findOne({ sessionId });
  }

  async upsert(data: {
    sessionId: string;
    language?: string;
    metadata?: Record<string, unknown>;
  }): Promise<IConversationSessionDoc> {
    return ConversationSession.findOneAndUpdate(
      { sessionId: data.sessionId },
      {
        $setOnInsert: {
          sessionId: data.sessionId,
          status: "initiated",
          language: data.language || "en",
          startedAt: new Date(),
          endedAt: null,
          metadata: data.metadata || {},
        },
      },
      { upsert: true, new: true }
    );
  }

  async complete(
    sessionId: string
  ): Promise<IConversationSessionDoc | null> {
    return ConversationSession.findOneAndUpdate(
      { sessionId, status: { $ne: "completed" } },
      {
        $set: {
          status: "completed",
          endedAt: new Date(),
        },
      },
      { new: true }
    );
  }
}
