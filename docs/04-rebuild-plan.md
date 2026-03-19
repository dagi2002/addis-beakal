# Rebuild Plan

These notes align the repository with the source documentation imported from the original planning files on 2026-03-16.

## Exact Stack

- Next.js 15 App Router
- React 19
- TypeScript 5
- Tailwind CSS with project-owned design tokens
- PostgreSQL for production persistence
- Prisma as the database access layer
- Auth.js with Argon2id-backed credentials and role-aware sessions
- Zod for API and form validation
- Vitest for domain tests
- Playwright for launch-critical end-to-end flows

## Recommended Folder Structure

```text
src/
  app/                  Route entrypoints and API handlers
  components/           Reusable UI primitives and feature UI blocks
  features/
    home/               Home page read models and services
    discovery/          Search/filter read models and UX helpers
    businesses/         Business detail models, aggregates, and business rules
    saves/              Save and unsave mutation services
    reports/            Report submission logic and moderation-safe flows
  server/
    auth/               Session actors, role checks, policies
    data/               Adapter-agnostic persistence entrypoints
    repositories/       File adapter now, Prisma adapter later
  lib/                  Small shared helpers
  types/                Shared app-wide type helpers as needed
```

## Implementation Phases

### Phase 1

- Import and preserve product context in-repo
- Keep the current visual direction
- Build the public home, discovery, and business detail experience
- Use real derived home metrics
- Keep save and unsave behavior correct
- Exclude removed reviews from public ratings
- Ship real report submission UI
- Scaffold auth and repository boundaries without blocking delivery

### Phase 2

- Real auth
- Roles and ownership checks
- Review submission
- Profiles and saved places
- Claim your business flow

### Phase 3

- PostgreSQL and Prisma adapter
- Moderation queues
- Admin and owner surfaces
- Email notifications
- Audit logging

### Phase 4

- Search quality
- Performance tuning
- Observability
- Launch QA
- Seed expansion across more Addis neighborhoods and categories

## Phase 1 Delivery Notes

Phase 1 should optimize for production-minded structure and a trustworthy public experience, not for total feature parity with the original Base44 app. The rebuild should earn the right to expand by making the foundation reliable first.
