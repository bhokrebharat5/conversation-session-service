## 1. How did you ensure idempotency?
Ans. This task uses three distinct idempotency strategies across its endpoints:
a) Session Creation — MongoDB Upsert ($setOnInsert)
b) Event Addition — Unique Compound Index + Duplicate Key Handling
c) Session Completion — Conditional Update + Status Check

## 2. How does your design behave under concurrent requests?
Ans.
a) Duplicate session creation ->  Atomic `upsert` and unique index
b) Duplicate event submission -> Unique compound index + `11000` catch and Exactly one event stored.
c) Duplicate completion -> Atomic conditional update (`$ne` filter) | `endedAt` set once, both callers get result.

## 3. What MongoDB indexes did you choose and why?
Ans.
a) `sessionId` — Unique Index on `ConversationSession` and Purpose - Fast lookups + prevents duplicate sessions
b) `{ sessionId, eventId }` — Compound Unique Index on `ConversationEvent` and Purpose - Scoped uniqueness + idempotent event creation
c) `{ sessionId, timestamp }` — Compound Index on `ConversationEvent` and purpose - Efficient sorted pagination for session events

## 4. How would you scale this system for millions of sessions per day?
Ans.
a) Database Layer — MongoDB Sharding
    - distributes sessions evenly across shards using a hashed shard key, 
    - provides read redundancy and automatic failover.

b) Application Layer — Horizontal Scaling
    - distributes traffic across instances
    - the current design holds no in-memory state, so we can run N instances behind a load balancer.
    - use Mongoose's built-in connection pool

c) Caching Layer
    - Redis cache for active sessions

d) Event Ingestion
    - Absorbs traffic spikes without overwhelming the database.
    - Workers can batch-insert events for better write throughput.
    - Built-in retry on failure.

e) Observability
    - track request latency, MongoDB operation time, queue depth, cache hit rate.

## 5. What did you intentionally keep out of scope, and why?

    - No API keys, JWT tokens, or user identity verification.
    - The assignment focuses on session management logic, not auth infrastructure. Adding auth would obscure the core design. 
    - REST is simpler to reason about for idempotency and concurrency — the core focus of this assignment. Real-time streaming would add connection management, heartbeats, and reconnection logic that are orthogonal to the data model design.
    - Observability is critical in production but adds boilerplate that distracts from the core logic. The service is small enough to debug through error responses and MongoDB state.
    - No structured logging, metrics collection, or distributed tracing.
    - No per-client rate limits or request throttling.
    -  Rate limiting is an infrastructure concern typically handled at the API gateway level. Including it would add code without demonstrating any new design patterns.
    - No tenant isolation — all sessions share the same collection and namespace.
    - Multi-tenancy adds tenant-scoped indexes, data isolation, and access control. It's an architectural decision that depends on the deployment model, not the session management logic.