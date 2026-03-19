# HabeshaLocal Rebuild Master Context

## Product Summary

HabeshaLocal is a Yelp-style local discovery and review platform built specifically for Addis Ababa, Ethiopia. The product serves three core groups:

- Consumers discovering trustworthy places to eat, meet, shop, and book services.
- Business owners claiming and improving their public presence.
- Admins moderating listings, reviews, reports, and ownership claims.

The strongest part of the original Base44 build was the visual direction and public UX. This rebuild should preserve that polished, modern feel while replacing fragile logic and platform constraints with a production-ready architecture.

## Non-Negotiables

- Preserve the current UI direction unless a usability or accessibility issue requires adjustment.
- Build a real maintainable codebase instead of reproducing Base44-style client-heavy logic.
- Treat security, data integrity, and moderation rules as first-class product requirements.
- Prefer server-side ownership of derived metrics, moderation state, and protected writes.
- Keep the public browsing experience excellent on mobile from day one.

## Immediate Product Priorities

1. Build the correct architecture so the app can grow without rewrites.
2. Preserve the intended visual quality of the home, discovery, and listing experience.
3. Implement the core public experience first.
4. Replace fake stats with real derived data.
5. Make save and unsave logic correct in both directions.
6. Recalculate ratings using only public reviews.
7. Build moderation-aware review logic from the start.
8. Ship a real user-facing report submission flow.
9. Keep mobile sort and filter UX strong.
10. Reduce duplicated data and mutation logic through shared services and utilities.
11. Establish stronger auth and role boundaries than the original Base44 app.

## Recommended Stack

- Framework: Next.js App Router
- Language: TypeScript
- UI: Tailwind CSS with project-owned design tokens and custom components
- Database: PostgreSQL
- ORM: Prisma
- Auth: Auth.js with role-backed server sessions and Argon2id password hashing
- Validation: Zod
- Testing: Vitest for domain logic, Playwright for key user journeys
- Observability: Sentry plus structured server logs

## Architecture Direction

- Keep a clear separation between UI, domain logic, and data adapters.
- Use feature-oriented folders for business logic and route-oriented folders for screens.
- Hide persistence behind repository-style server modules so the current file adapter can later be swapped for Prisma with minimal surface change.
- Centralize moderation, save-count, and rating aggregation rules in domain logic rather than page components.
- Keep role checks on the server, not in client components.

## Delivery Phases

### Phase 1

Foundation and public experience:

- Home page with real metrics
- Discovery page with polished mobile filtering
- Business detail page with trust and moderation-aware review display
- Correct save and unsave behavior
- Report submission flow
- Shared domain services and repository scaffold
- File-backed development adapter standing in for the future database

### Phase 2

Auth, identity, and protected write flows:

- Real account system
- Strong role and ownership boundaries
- Review creation and user profile flows
- Owner claim and owner dashboard foundation

### Phase 3

Production data layer and moderation tooling:

- PostgreSQL and Prisma adapter
- Review moderation tools
- Admin queues for businesses, claims, and reports
- Audit logging and better media handling

### Phase 4

Launch hardening:

- Search quality improvements
- Pagination
- Observability
- Performance tuning
- Email notifications
- Launch QA and seed coverage expansion
