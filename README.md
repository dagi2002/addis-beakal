# Addis Beakal

Production-minded rebuild of a Yelp-style local business discovery and reviews app for Addis Ababa, Ethiopia.

## Current state

Phase 2 is now scaffolded with:

- Next.js App Router and TypeScript
- Tailwind-based UI foundation
- A file-backed development data adapter with seeded Addis businesses
- Feature-oriented services for auth, home, discovery, businesses, saves, reviews, reports, profiles, and ownership claims
- Server-owned cookie sessions with Argon2-backed credentials
- Public pages for home, discovery, and listing detail, plus logged-in profile, saved, claim, owner, and admin claim pages
- Moderation-aware rating aggregation, report submission, and account-backed review publishing
- Address-based business map support without redesigning the listing UI

## Commands

```bash
npm install
npm run dev
npm run lint
npm test
npm run build
npm run mobile:sync-data
```

## Mobile app

An Expo-based mobile app now lives in [`mobile/`](/Users/dagemamogne/Documents/addis-beakal/mobile) and reuses the repo's business taxonomy plus a sanitized generated dataset from [`data/mobile-public.json`](/Users/dagemamogne/Documents/addis-beakal/data/mobile-public.json).

Mobile workflow:

```bash
npm run mobile:sync-data
cd mobile
npm install
npm run lint
npm run typecheck
npx expo start
```

## Demo accounts

- Member: `demo@addisbeakal.test` / `demo12345`
- Admin: `admin@addisbeakal.test` / `admin12345`

Set `AUTH_SECRET` in `.env.local` before using the new auth flows outside the default dev fallback.

## Production direction

- Production database target: PostgreSQL with Prisma
- Recommended auth target: Auth.js with server-owned role boundaries
- The `/docs` folder now contains the imported rebuild context, product summary, technical audit, and execution plan used for this codebase
