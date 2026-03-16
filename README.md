# Addis Beakal

Production-minded rebuild of a Yelp-style local business discovery and reviews app for Addis Ababa, Ethiopia.

## Current state

Phase 1 is scaffolded with:

- Next.js App Router and TypeScript
- Tailwind-based UI foundation
- A file-backed development data adapter with seeded Addis businesses
- Shared business, save, review, and report logic
- Public pages for home, discovery, and listing detail
- Moderation-aware rating aggregation and report submission endpoints

## Commands

```bash
npm install
npm run dev
npm run lint
npm test
npm run build
```

## Production direction

- Production database target: PostgreSQL with Prisma
- Stronger auth and role boundaries are planned for Phase 2
- The current `/docs/04-rebuild-plan.md` records the working assumptions used for this first pass because the original source-of-truth docs are still empty in the repository
