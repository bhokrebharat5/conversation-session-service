import { Router } from "express";
import { SessionController } from "../controllers/session.controller";
import { SessionService } from "../services/session.service";
import { EventService } from "../services/event.service";
import { SessionRepository } from "../repositories/session.repository";
import { EventRepository } from "../repositories/event.repository";
import { validate } from "../middleware/validate";
import { z } from "zod";

// Validation schemas
const createSessionSchema = z.object({
  sessionId: z.string().min(1, "sessionId is required"),
  language: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const addEventSchema = z.object({
  eventId: z.string().min(1, "eventId is required"),
  type: z.enum(["user_speech", "bot_speech", "system"]),
  payload: z.record(z.unknown()).default({}),
  timestamp: z.string().datetime().optional(),
});

// Dependency wiring
const sessionRepo = new SessionRepository();
const eventRepo = new EventRepository();
const sessionService = new SessionService(sessionRepo, eventRepo);
const eventService = new EventService(sessionRepo, eventRepo);
const controller = new SessionController(sessionService, eventService);

const router = Router();

// POST /sessions - Create or upsert session
router.post("/", validate(createSessionSchema), controller.createOrUpsert);

// POST /sessions/:sessionId/events - Add event to session
router.post(
  "/:sessionId/events",
  validate(addEventSchema),
  controller.addEvent
);

// GET /sessions/:sessionId - Get session with events
router.get("/:sessionId", controller.getSession);

// POST /sessions/:sessionId/complete - Complete session
router.post("/:sessionId/complete", controller.completeSession);

export default router;
