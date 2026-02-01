# Scoreboard Module Specification

## Overview

This document specifies a real-time scoreboard module for the backend application server. The module manages user scores, provides live updates to connected clients, and implements security measures to prevent unauthorized score manipulation.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [API Endpoints](#api-endpoints)
3. [Data Models](#data-models)
4. [Real-Time Updates](#real-time-updates)
5. [Security & Authorization](#security--authorization)
6. [Error Handling](#error-handling)
7. [Performance Considerations](#performance-considerations)
8. [Improvement Recommendations](#improvement-recommendations)

---

## System Architecture

### High-Level Components

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │   Browser    │    │   Browser    │    │   Browser    │                   │
│  │  (User A)    │    │  (User B)    │    │  (User C)    │                   │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                   │
│         │                   │                   │                            │
│         │ REST API          │ WebSocket         │                            │
│         │ (Score Update)    │ (Live Updates)    │                            │
└─────────┼───────────────────┼───────────────────┼────────────────────────────┘
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY / LOAD BALANCER                        │
└─────────────────────────────────────────────────────────────────────────────┘
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          APPLICATION SERVER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │                     AUTHENTICATION MIDDLEWARE                       │     │
│  │  • JWT Token Validation                                            │     │
│  │  • Action Token Verification                                       │     │
│  │  • Rate Limiting                                                   │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                              │                                               │
│          ┌───────────────────┼───────────────────┐                          │
│          ▼                   ▼                   ▼                          │
│  ┌───────────────┐   ┌───────────────┐   ┌───────────────┐                  │
│  │  Score        │   │  Leaderboard  │   │  WebSocket    │                  │
│  │  Controller   │   │  Controller   │   │  Handler      │                  │
│  └───────┬───────┘   └───────┬───────┘   └───────┬───────┘                  │
│          │                   │                   │                          │
│          └───────────────────┼───────────────────┘                          │
│                              ▼                                               │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │                         SCORE SERVICE                               │     │
│  │  • Score Calculation & Validation                                  │     │
│  │  • Leaderboard Management                                          │     │
│  │  • Event Publishing                                                │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                              │                                               │
└──────────────────────────────┼───────────────────────────────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│    Database     │   │   Redis Cache   │   │  Message Queue  │
│   (PostgreSQL)  │   │  (Leaderboard)  │   │    (Pub/Sub)    │
│                 │   │                 │   │                 │
│  • User Scores  │   │  • Top 10 Cache │   │  • Score Events │
│  • Score History│   │  • Rate Limits  │   │  • Broadcasts   │
│  • Audit Logs   │   │  • Action Tokens│   │                 │
└─────────────────┘   └─────────────────┘   └─────────────────┘
```

---

## API Endpoints

### 1. Update Score

Updates a user's score after completing an action.

**Endpoint:** `POST /api/v1/scores/update`

**Headers:**
| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token (JWT) for user authentication |
| `X-Action-Token` | string | Yes | One-time token proving action completion |
| `X-Request-ID` | string | No | Idempotency key to prevent duplicate processing |

**Request Body:**
```json
{
  "action_id": "string",      
  "score_delta": "integer",   
  "timestamp": "integer",     
  "client_checksum": "string" 
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user_id": "string",
    "new_score": "integer",
    "previous_score": "integer",
    "rank": "integer | null",  // null if not in top 10
    "timestamp": "integer"
  }
}
```

**Error Responses:**

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | `INVALID_REQUEST` | Malformed request body |
| 401 | `UNAUTHORIZED` | Invalid or expired JWT token |
| 403 | `INVALID_ACTION_TOKEN` | Action token is invalid, expired, or already used |
| 403 | `CHECKSUM_MISMATCH` | Client checksum validation failed |
| 409 | `DUPLICATE_REQUEST` | Request with same idempotency key already processed |
| 429 | `RATE_LIMITED` | Too many requests from this user |

---

### 2. Get Leaderboard

Retrieves the current top 10 scores.

**Endpoint:** `GET /api/v1/leaderboard`

**Headers:**
| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | No | Bearer token (optional, for personalized response) |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `include_self` | boolean | false | If authenticated, include user's rank even if not in top 10 |

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "user_id": "string",
        "display_name": "string",
        "score": "integer",
        "avatar_url": "string | null"
      }
      
    ],
    "self": {                    
      "rank": "integer",
      "score": "integer"
    } | null,
    "last_updated": "integer"    
  }
}
```

---

### 3. WebSocket Connection

Establishes a WebSocket connection for real-time leaderboard updates.

**Endpoint:** `WS /api/v1/leaderboard/live`

**Connection Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `token` | string | No | JWT token for authenticated connections |

**Server-to-Client Messages:**

*Leaderboard Update:*
```json
{
  "type": "LEADERBOARD_UPDATE",
  "data": {
    "leaderboard": [...],       // top 10 array
    "changed_ranks": [1, 2, 3], // Ranks changed
    "timestamp": "integer"
  }
}
```

*Score Update (for authenticated users):*
```json
{
  "type": "SCORE_UPDATE",
  "data": {
    "user_id": "string",
    "new_score": "integer",
    "rank": "integer | null",
    "timestamp": "integer"
  }
}
```

*Connection Acknowledgment:*
```json
{
  "type": "CONNECTED",
  "data": {
    "connection_id": "string",
    "server_time": "integer"
  }
}
```

**Client-to-Server Messages:**

*Heartbeat/Ping:*
```json
{
  "type": "PING"
}
```

---

## Data Models

### User Score Table (PostgreSQL)

```sql
CREATE TABLE user_scores (
    user_id         UUID PRIMARY KEY REFERENCES users(id),
    current_score   BIGINT NOT NULL DEFAULT 0,
    lifetime_score  BIGINT NOT NULL DEFAULT 0,
    last_action_at  TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_scores_current ON user_scores(current_score DESC);
```

### Score Transaction Log (PostgreSQL)

```sql
CREATE TABLE score_transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    action_id       VARCHAR(255) NOT NULL,
    action_token    VARCHAR(255) NOT NULL UNIQUE,
    score_delta     INTEGER NOT NULL,
    score_before    BIGINT NOT NULL,
    score_after     BIGINT NOT NULL,
    client_ip       INET,
    user_agent      TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_score_tx_user_id ON score_transactions(user_id);
CREATE INDEX idx_score_tx_created ON score_transactions(created_at);
CREATE INDEX idx_score_tx_action_token ON score_transactions(action_token);
```

### Redis Data Structures

```
# Sorted Set for Leaderboard (Top N users)
Key: leaderboard:top
Type: Sorted Set
Score: user's score (ZADD with score as weight)
Member: user_id

# Rate Limiting
Key: rate_limit:score_update:{user_id}
Type: String (counter)
TTL: 60 seconds

# Action Token Storage
Key: action_token:{token_hash}
Type: Hash
Fields: user_id, action_id, score_delta, expires_at, used
TTL: 5 minutes
```

---

## Real-Time Updates

### Event Flow

1. **Score Update Occurs:**
   - User completes action → Client calls `POST /api/v1/scores/update`
   - Server validates and updates score in database
   - Server updates Redis sorted set

2. **Leaderboard Change Detection:**
   - After score update, server checks if top 10 changed
   - If changed, publishes event to Redis Pub/Sub channel `leaderboard:updates`

3. **WebSocket Broadcast:**
   - WebSocket handlers subscribe to `leaderboard:updates`
   - On event, fetch latest leaderboard from Redis
   - Broadcast to all connected clients

### Broadcast Strategy

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Score Update │───▶│ Redis Pub/Sub│───▶│ WS Handlers  │
│   Service    │    │   Channel    │    │  (all nodes) │
└──────────────┘    └──────────────┘    └──────┬───────┘
                                               │
                                               ▼
                                    ┌──────────────────┐
                                    │  All Connected   │
                                    │     Clients      │
                                    └──────────────────┘
```

### Optimization: Debouncing Updates

To prevent overwhelming clients during high-activity periods:

- Aggregate updates within a 100-500ms window
- Send batched leaderboard updates
- Include `changed_ranks` array so clients can animate only affected rows

---

## Security & Authorization

### Multi-Layer Security Model

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Layer 1: Authentication (JWT)                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • User must be authenticated to update scores            │   │
│  │ • JWT contains user_id, issued_at, expires_at           │   │
│  │ • Short expiration (15-60 minutes) + refresh tokens     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  Layer 2: Action Token Verification                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • Backend generates token when action starts             │   │
│  │ • Token is cryptographically signed (HMAC-SHA256)       │   │
│  │ • Single-use: marked as used after score update         │   │
│  │ • Time-limited: expires in 5 minutes                    │   │
│  │ • Bound to specific action_id and user_id               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  Layer 3: Request Integrity                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • Client checksum (HMAC of action data with secret)     │   │
│  │ • Server validates checksum matches expected value      │   │
│  │ • Prevents tampering with score_delta                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  Layer 4: Rate Limiting                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • Per-user: Max 10 score updates per minute             │   │
│  │ • Per-IP: Max 100 requests per minute                   │   │
│  │ • Global: Circuit breaker for system protection         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  Layer 5: Server-Side Validation                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • Server determines actual score value (not client)     │   │
│  │ • Validate score_delta against action type limits       │   │
│  │ • Anomaly detection for suspicious patterns             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Action Token Flow

```
┌────────┐                    ┌────────┐                    ┌─────────┐
│ Client │                    │ Server │                    │  Redis  │
└───┬────┘                    └───┬────┘                    └────┬────┘
    │                             │                              │
    │  1. Start Action            │                              │
    │  POST /api/v1/actions/start │                              │
    │────────────────────────────▶│                              │
    │                             │                              │
    │                             │  2. Generate Action Token    │
    │                             │  (signed, with metadata)     │
    │                             │─────────────────────────────▶│
    │                             │      Store token             │
    │                             │◀─────────────────────────────│
    │                             │                              │
    │  3. Return Action Token     │                              │
    │◀────────────────────────────│                              │
    │                             │                              │
    │  [User completes action]    │                              │
    │                             │                              │
    │  4. Update Score            │                              │
    │  POST /api/v1/scores/update │                              │
    │  + Action Token             │                              │
    │────────────────────────────▶│                              │
    │                             │                              │
    │                             │  5. Validate Token           │
    │                             │─────────────────────────────▶│
    │                             │      Check exists, not used  │
    │                             │◀─────────────────────────────│
    │                             │                              │
    │                             │  6. Mark Token Used          │
    │                             │─────────────────────────────▶│
    │                             │◀─────────────────────────────│
    │                             │                              │
    │  7. Return Updated Score    │                              │
    │◀────────────────────────────│                              │
    │                             │                              │
```

### Action Token Structure

```json
{
  "token_id": "uuid",
  "user_id": "string",
  "action_id": "string",
  "action_type": "string",
  "max_score_delta": "integer",
  "issued_at": "integer",
  "expires_at": "integer",
  "signature": "string"  
}
```

---

## Error Handling

### Error Response Format

All errors follow a consistent structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {
   
    },
    "request_id": "string"  
  }
}
```

### Error Codes Reference

| Code | HTTP Status | Description | Client Action |
|------|-------------|-------------|---------------|
| `INVALID_REQUEST` | 400 | Request body validation failed | Fix request format |
| `UNAUTHORIZED` | 401 | Missing or invalid JWT | Re-authenticate |
| `INVALID_ACTION_TOKEN` | 403 | Action token validation failed | Restart action flow |
| `CHECKSUM_MISMATCH` | 403 | Request integrity check failed | Ensure client sends correct checksum |
| `DUPLICATE_REQUEST` | 409 | Idempotency key already used | Use cached response |
| `RATE_LIMITED` | 429 | Too many requests | Backoff and retry |
| `INTERNAL_ERROR` | 500 | Server error | Retry with exponential backoff |
| `SERVICE_UNAVAILABLE` | 503 | System overloaded | Retry later |

---

## Performance Considerations

### Caching Strategy

| Data | Cache Location | TTL | Invalidation |
|------|----------------|-----|--------------|
| Top 10 Leaderboard | Redis Sorted Set | Real-time | On score update |
| User's Own Score | Redis Hash | 30 seconds | On score update |
| User Profile (display name, avatar) | Redis Hash | 5 minutes | On profile update |

### Expected Load Handling

| Metric | Target |
|--------|--------|
| Score update latency (p99) | < 100ms |
| Leaderboard fetch latency (p99) | < 50ms |
| WebSocket broadcast delay | < 200ms |
| Concurrent WebSocket connections | 100,000+ |

### Database Optimization

- Use database connection pooling
- Leaderboard queries use Redis, not database
- Write-heavy operations are batched where possible
- Score transactions table is partitioned by date for archival

---

## Improvement Recommendations

### 1. Enhanced Anti-Cheat Measures

**Problem:** Sophisticated attackers may find ways to replay or forge requests.

**Recommendations:**
- Implement server-side action verification: The server should independently verify that the action was actually completed (e.g., game state validation, session replay analysis)
- Add device fingerprinting to detect multi-account abuse
- Implement a shadow scoring system that compares client-reported vs server-observed behavior
- Consider integrating a dedicated fraud detection service for anomaly detection

### 2. Horizontal Scaling for WebSocket Connections

**Problem:** Single-server WebSocket handling limits scalability.

**Recommendations:**
- Use Redis Pub/Sub or a dedicated message broker (e.g., Apache Kafka) for cross-instance communication
- Implement sticky sessions at the load balancer level
- Consider using a dedicated WebSocket service (e.g., AWS API Gateway WebSockets, Socket.io with Redis adapter)

### 3. Leaderboard Pagination & Historical Data

**Problem:** Current spec only shows top 10; users outside top 10 have limited visibility.

**Recommendations:**
- Add paginated leaderboard endpoint for viewing beyond top 10
- Implement "friends leaderboard" feature
- Add daily/weekly/monthly leaderboard variants with scheduled reset
- Store historical rankings for trend analysis

### 4. Graceful Degradation

**Problem:** System should remain partially functional during outages.

**Recommendations:**
- Implement circuit breakers for Redis and database connections
- Queue score updates in memory/disk if Redis is unavailable
- Serve stale leaderboard data with "last updated" timestamp during cache failures
- Add health check endpoints for monitoring

### 5. Audit & Compliance

**Problem:** Need ability to investigate disputes and detect abuse patterns.

**Recommendations:**
- Implement comprehensive audit logging with structured data
- Add admin endpoints for score adjustment with audit trail
- Build automated anomaly detection reports
- Implement score rollback capability with proper authorization

### 6. Rate Limiting Improvements

**Problem:** Current rate limiting may not handle sophisticated distributed attacks.

**Recommendations:**
- Implement adaptive rate limiting based on user behavior patterns
- Add CAPTCHA or proof-of-work challenges for suspicious activity
- Use sliding window rate limiting instead of fixed windows
- Implement temporary account suspension for repeated violations

### 7. Testing & Observability

**Recommendations:**
- Implement distributed tracing (e.g., OpenTelemetry) for request flow visibility
- Add detailed metrics for score update success/failure rates
- Create load testing suite simulating realistic traffic patterns
- Implement chaos engineering tests for failure scenarios

---

## Appendix: Environment Configuration

```yaml
scoreboard:
  leaderboard:
    size: 10
    cache_ttl_seconds: 0  
    
  rate_limiting:
    user_updates_per_minute: 10
    ip_requests_per_minute: 100
    
  action_token:
    expiry_seconds: 300
    secret_key: ${ACTION_TOKEN_SECRET}
    
  websocket:
    heartbeat_interval_seconds: 30
    max_connections_per_user: 5
    broadcast_debounce_ms: 100
    
  security:
    jwt_secret: ${JWT_SECRET}
    checksum_secret: ${CHECKSUM_SECRET}
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-XX-XX | [Engineering Team] | Initial specification |
