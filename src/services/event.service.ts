import { SessionRepository } from "../repositories/session.repository";
import { EventRepository } from "../repositories/event.repository";
import { ApiError } from "../utils/api-error";
import { EventType } from "../models/conversation-event.model";

export class EventService {
  constructor(
    private sessionRepo: SessionRepository,
    private eventRepo: EventRepository
  ) {}

  async addEvent(data: {
    sessionId: string;
    eventId: string;
    type: EventType;
    payload: Record<string, unknown>;
    timestamp?: Date;
  }) {
    const session = await this.sessionRepo.findBySessionId(data.sessionId);
    if (!session) {
      throw new ApiError(404, "Session not found");
    }

    if (session.status === "completed") {
      throw new ApiError(400, "Cannot add events to a completed session");
    }

    try {
      const event = await this.eventRepo.create(data);

      // Move session to active on first event
      if (session.status === "initiated") {
        await session.updateOne({ $set: { status: "active" } });
      }

      return event;
    } catch (error: unknown) {
      // Handle duplicate eventId (MongoDB duplicate key error)
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error as { code: number }).code === 11000
      ) {
        // Idempotent: return existing event
        const existing = await this.eventRepo.findByEventId(
          data.sessionId,
          data.eventId
        );
        if (existing) return existing;
      }
      throw error;
    }
  }
}
