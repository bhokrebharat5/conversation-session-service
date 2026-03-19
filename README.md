# Conversation Session Service

Backend service for a Voice AI platform that manages conversation sessions and their events.

## Tech Stack

- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Validation:** Zod

## Project Structure

```
src/
├── config/          # Environment configuration
├── models/          # Mongoose schemas and TypeScript interfaces
├── repositories/    # Data access layer (MongoDB operations)
├── services/        # Business logic layer
├── controllers/     # HTTP request handlers
├── routes/          # Route definitions and validation schemas
├── middleware/      # Error handling and request validation
├── utils/           # Shared utilities (ApiError, pagination)
├── app.ts           # Express app setup
└── server.ts        # Entry point and DB connection
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB running locally or a remote URI

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file from the example:

```bash
cp .env.example .env
```

| Variable      | Default                                          | Description        |
| ------------- | ------------------------------------------------ | ------------------ |
| `PORT`        | `3000`                                           | Server port        |
| `MONGODB_URI` | `mongodb://localhost:27017/conversation-sessions` | MongoDB connection |

### Running

```bash
# Development (hot reload)
npm run dev

# Production
npm run build
npm start
```

## API Endpoints

### 1. Create or Upsert Session

```
POST /sessions
```

**Body:**

```json
{
  "sessionId": "abc-123",
  "language": "en",
  "metadata": { "source": "web" }
}
```

- Creates a new session if `sessionId` doesn't exist, otherwise returns the existing one.
- Idempotent and safe under concurrent requests.

### 2. Add Event to Session

```
POST /sessions/:sessionId/events
```

**Body:**

```json
{
  "eventId": "evt-1",
  "type": "user_speech",
  "payload": { "text": "Hello" },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

- `type` must be one of: `user_speech`, `bot_speech`, `system`
- `eventId` must be unique per session; duplicate requests return the existing event.
- Events are immutable once created.

### 3. Get Session with Events

```
GET /sessions/:sessionId?page=1&limit=20
```

- Returns session details and events ordered by timestamp.
- Supports pagination via `page` and `limit` query parameters (default: 20, max: 100).

### 4. Complete Session

```
POST /sessions/:sessionId/complete
```

- Sets status to `completed` and records `endedAt`.
- Idempotent — calling on an already completed session returns it as-is.

## Domain Models

### ConversationSession

| Field       | Type     | Description                                    |
| ----------- | -------- | ---------------------------------------------- |
| `sessionId` | string   | Unique, externally provided                    |
| `status`    | string   | `initiated` → `active` → `completed` / `failed` |
| `language`  | string   | e.g. `en`, `fr`                                |
| `startedAt` | Date     | When the session was created                   |
| `endedAt`   | Date     | When the session was completed (null if open)  |
| `metadata`  | object   | Optional key-value data                        |

### ConversationEvent

| Field       | Type     | Description                          |
| ----------- | -------- | ------------------------------------ |
| `eventId`   | string   | Unique per session                   |
| `sessionId` | string   | Parent session reference             |
| `type`      | string   | `user_speech`, `bot_speech`, `system`|
| `payload`   | object   | Event data                           |
| `timestamp` | Date     | When the event occurred              |

## MongoDB Indexes

| Collection           | Index                        | Purpose                          |
| -------------------- | ---------------------------- | -------------------------------- |
| `conversationsessions` | `sessionId` (unique)       | Fast lookup, idempotent upsert   |
| `conversationevents`   | `sessionId + eventId` (unique) | Idempotent event creation    |
| `conversationevents`   | `sessionId + timestamp`    | Efficient paginated event queries|
