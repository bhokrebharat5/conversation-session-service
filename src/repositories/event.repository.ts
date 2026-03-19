import {
  ConversationEvent,
  IConversationEventDoc,
} from "../models/conversation-event.model";
import { PaginationParams } from "../utils/pagination";

export class EventRepository {
  async create(data: {
    eventId: string;
    sessionId: string;
    type: string;
    payload: Record<string, unknown>;
    timestamp?: Date;
  }): Promise<IConversationEventDoc> {
    return ConversationEvent.create({
      ...data,
      timestamp: data.timestamp || new Date(),
    });
  }

  async findBySessionId(
    sessionId: string,
    pagination: PaginationParams
  ): Promise<{ events: IConversationEventDoc[]; total: number }> {
    const [events, total] = await Promise.all([
      ConversationEvent.find({ sessionId })
        .sort({ timestamp: 1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      ConversationEvent.countDocuments({ sessionId }),
    ]);
    return { events, total };
  }

  async findByEventId(
    sessionId: string,
    eventId: string
  ): Promise<IConversationEventDoc | null> {
    return ConversationEvent.findOne({ sessionId, eventId });
  }
}
