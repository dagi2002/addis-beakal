# Rebuild Plan

These notes are based on the current repository state on 2026-03-16.

## Current blocker

The existing source-of-truth docs in this folder are present but empty, so the detailed product, audit, and UI guidance described in the repo brief is not yet available in the working tree.

## Working assumptions for Phase 1

- Preserve a polished, modern visual direction without locking in a full redesign before the missing docs land.
- Build the public browsing experience first.
- Make rating, save, and report logic correct from the start.
- Keep data, business logic, and UI separated so the current dev adapter can later be replaced by a production database adapter without rewriting the app surface.

## Recommended production stack

- Next.js App Router with React and TypeScript
- Tailwind CSS with design tokens and reusable primitives
- PostgreSQL with Prisma for the production data layer
- Strong server-side auth and role boundaries in a later phase
- Zod for request validation
- Vitest for domain logic tests

## Proposed implementation phases

1. Foundation and public experience
2. Real auth, roles, and protected write flows
3. Production database adapter, moderation tooling, and admin surfaces
4. Search quality, performance hardening, observability, and launch polish
