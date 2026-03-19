import { Request, Response, NextFunction } from "express";
import { SessionService } from "../services/session.service";
import { EventService } from "../services/event.service";
import { parsePagination } from "../utils/pagination";

export class SessionController {
  constructor(
    private sessionService: SessionService,
    private eventService: EventService
  ) {}

  createOrUpsert = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { sessionId, language, metadata } = req.body;
      const session = await this.sessionService.createOrUpsert({
        sessionId,
        language,
        metadata,
      });
      res.status(200).json({ data: session });
    } catch (error) {
      next(error);
    }
  };

  addEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { sessionId } = req.params;
      const { eventId, type, payload, timestamp } = req.body;
      const event = await this.eventService.addEvent({
        sessionId,
        eventId,
        type,
        payload,
        timestamp: timestamp ? new Date(timestamp) : undefined,
      });
      res.status(201).json({ data: event });
    } catch (error) {
      next(error);
    }
  };

  getSession = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { sessionId } = req.params;
      const pagination = parsePagination(req.query as Record<string, string>);
      const result = await this.sessionService.getSessionWithEvents(
        sessionId,
        pagination
      );
      res.status(200).json({
        data: {
          session: result.session,
          events: result.events,
        },
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  completeSession = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { sessionId } = req.params;
      const session = await this.sessionService.completeSession(sessionId);
      res.status(200).json({ data: session });
    } catch (error) {
      next(error);
    }
  };
}
