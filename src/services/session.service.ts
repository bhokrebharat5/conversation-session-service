import { SessionRepository } from "../repositories/session.repository";
import { EventRepository } from "../repositories/event.repository";
import { ApiError } from "../utils/api-error";
import { PaginationParams } from "../utils/pagination";

export class SessionService {
  constructor(
    private sessionRepo: SessionRepository,
    private eventRepo: EventRepository
  ) {}

  async createOrUpsert(data: {
    sessionId: string;
    language?: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.sessionRepo.upsert(data);
  }

  async getSessionWithEvents(
    sessionId: string,
    pagination: PaginationParams
  ) {
    const session = await this.sessionRepo.findBySessionId(sessionId);
    if (!session) {
      throw new ApiError(404, "Session not found");
    }

    const { events, total } = await this.eventRepo.findBySessionId(
      sessionId,
      pagination
    );

    return {
      session,
      events,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async completeSession(sessionId: string) {
    const session = await this.sessionRepo.findBySessionId(sessionId);
    if (!session) {
      throw new ApiError(404, "Session not found");
    }

    // Idempotent: if already completed, return as-is
    if (session.status === "completed") {
      return session;
    }

    const updated = await this.sessionRepo.complete(sessionId);
    if (!updated) {
      // Race condition: another request completed it first — return current state
      return this.sessionRepo.findBySessionId(sessionId);
    }

    return updated;
  }
}
