# Technical Audit

## Core Risks Identified In The Base44 Version

### Security

- Client-side checks were doing too much work.
- Entity-level access control was not strong enough to trust in production.
- Ownership and admin boundaries could be bypassed if the client was manipulated.

### Data Integrity

- `save_count` could inflate because unsave did not reliably decrement.
- `rating_avg` and `review_count` could become stale when reviews changed moderation state.
- Review aggregation behavior needed to exclude removed and non-public reviews.
- Email strings were being used where stable foreign keys should exist.

### Scalability

- Search was too client-heavy.
- Denormalized metrics were too easy to drift out of sync.
- List views and moderation flows would not scale cleanly as records increased.

### Maintainability

- Business logic was duplicated across UI surfaces.
- Data access concerns were mixed into presentation code.
- Mutations did not have clear server-owned boundaries.

## Rebuild Requirements

### Immediate

- Move domain-critical logic behind shared services.
- Keep derived metrics consistent.
- Introduce server-owned permission boundaries, even before full auth lands.
- Use a repository seam so the file-backed adapter can be replaced later.

### Before Launch

- Use PostgreSQL plus Prisma as the authoritative data layer.
- Move ratings, review counts, and save counts to server-controlled updates.
- Use real user IDs and role-backed sessions.
- Add moderation queues, audit trails, and report workflows.

## Data Modeling Guidance

- Businesses should own stable slugs, category references, neighborhood references, and moderation-safe aggregates.
- Reviews should carry explicit moderation state.
- Saves should be unique per user-business pair.
- Reports should support both business-level and review-level targets.
- Ownership should be represented with stable user IDs, not mutable emails.

## Architectural Guidance

- Keep the visual layer thin.
- Keep server modules responsible for permissions and persistence.
- Centralize aggregation and moderation rules in domain logic.
- Prefer small focused services over page-local logic.
