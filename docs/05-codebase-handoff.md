# Addis Beakal Codebase Handoff

This document explains what has already been rebuilt locally from the Base44 product context, where the important code lives, and what you need to do if you want this local codebase to become the version you fully own and continue developing.

## What You Own Now

The local repository at `/Users/dagemamogne/Documents/addis-beakal` is a normal Next.js codebase that you can edit, commit, back up, deploy, and move to any host you choose.

It does **not** depend on Base44 to run.

It currently includes:

- Public home page
- Public discovery page
- Public business detail page
- Business save / unsave
- Report submission
- Email/password auth with cookie sessions
- Profile page
- Saved businesses page
- Review creation with photo uploads
- Business claim submission flow
- Admin claim approval flow
- Minimal owner dashboard

## What You Cannot Reliably Extract From Base44 Without Access

If Base44 will not show or export the original source code, then you should assume:

- You cannot recover the exact original implementation details
- You cannot prove parity from hidden backend logic alone
- You should rebuild from observed behavior, data, screenshots, copy, and documentation

That means the safest ownership path is:

1. Keep this local repo as the new source of truth.
2. Move any content/data you can legally access into this repo.
3. Replace Base44 hosting and backend over time with your own stack.

## Current Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- File-backed development database in `data/app-db.json`
- Argon2 password hashing
- Cookie-based server sessions

## Run The Project

```bash
npm install
npm run dev
```

Open:

- `http://localhost:3000/`

Demo accounts:

- Member: `demo@addisbeakal.test` / `demo12345`
- Admin: `admin@addisbeakal.test` / `admin12345`

Set `AUTH_SECRET` in `.env.local` for non-demo development.

## Main File Map

### App routes

- `src/app/page.tsx` — home page
- `src/app/discover/page.tsx` — discovery/search page
- `src/app/business/[slug]/page.tsx` — business detail page
- `src/app/login/page.tsx` — sign-in page
- `src/app/signup/page.tsx` — sign-up page
- `src/app/profile/page.tsx` — profile page
- `src/app/saved/page.tsx` — saved businesses page
- `src/app/claim-business/page.tsx` — claim submission page
- `src/app/owner/page.tsx` — minimal owner dashboard
- `src/app/admin/claims/page.tsx` — admin claims queue

### API routes

- `src/app/api/auth/signup/route.ts` — create account
- `src/app/api/auth/login/route.ts` — sign in
- `src/app/api/auth/logout/route.ts` — sign out
- `src/app/api/saves/toggle/route.ts` — save / unsave
- `src/app/api/reports/route.ts` — submit report
- `src/app/api/reviews/route.ts` — create review
- `src/app/api/reviews/upload/route.ts` — upload review photos
- `src/app/api/profile/route.ts` — update display name
- `src/app/api/claims/route.ts` — submit claim
- `src/app/api/admin/claims/[claimId]/route.ts` — approve / reject claim

### UI components

- `src/components/layout/site-shell.tsx` — shared shell and nav
- `src/components/business/business-card.tsx` — business cards
- `src/components/business/save-button.tsx` — save button
- `src/components/business/report-form.tsx` — report modal form
- `src/components/business/review-form.tsx` — review creation modal
- `src/components/business/business-map.tsx` — business map block
- `src/components/business/discover-filters.tsx` — discovery filters
- `src/components/auth/auth-form.tsx` — login/signup form
- `src/components/auth/sign-out-button.tsx` — sign-out action
- `src/components/profile/profile-form.tsx` — profile update form
- `src/components/claims/claim-form.tsx` — claim submission form
- `src/components/admin/claim-review-form.tsx` — admin claim decision form
- `src/components/shared/modal-shell.tsx` — reusable modal wrapper

### Feature services

- `src/features/home/service.ts` — home page read model
- `src/features/discovery/service.ts` — discovery read model
- `src/features/businesses/service.ts` — business page read model
- `src/features/businesses/queries.ts` — business query helpers
- `src/features/businesses/logic.ts` — metric aggregation and save logic
- `src/features/reports/service.ts` — report submission logic
- `src/features/reviews/service.ts` — review creation logic
- `src/features/profile/service.ts` — profile and saved-page data
- `src/features/claims/service.ts` — claim submission and admin approval logic
- `src/features/saves/service.ts` — save mutation service

### Auth and server foundations

- `src/server/auth/session.ts` — cookie session handling
- `src/server/auth/service.ts` — sign-in/sign-up/profile auth logic
- `src/server/auth/password.ts` — Argon2 helpers
- `src/server/auth/policies.ts` — auth/role checks
- `src/server/auth/seed-users.ts` — demo users
- `src/server/database.ts` — file-db loading, normalization, migration
- `src/server/storage/review-uploads.ts` — local review image storage

### Data and types

- `src/features/businesses/types.ts` — core app types
- `src/features/businesses/seed.ts` — seeded businesses, reviews, users
- `data/app-db.json` — runtime file-backed database
- `prisma/schema.prisma` — future production schema target

## How The Current Data Model Works

The app database currently contains:

- `users`
- `businesses`
- `reviews`
- `saves`
- `reports`
- `businessClaims`
- `categories`
- `neighborhoods`

Important relationships:

- `Review.authorId -> User.id`
- `Save.userId -> User.id`
- `Report.userId -> User.id`
- `Business.ownerUserId -> User.id`
- `BusinessClaim.userId -> User.id`

Business metrics are derived from shared logic:

- Ratings count only `published` reviews
- Removed and pending reviews do not affect public score
- Save counts are recalculated from save rows

## How To Make This The Version You Fully Own

### 1. Put it in your own Git remote

Create a GitHub, GitLab, or private bare repo and push this project there.

### 2. Stop treating Base44 as the source of truth

From now on:

- new features should be built here
- fixes should be made here
- data migrations should target this stack

### 3. Copy over whatever Base44 content you can still access

Good candidates:

- business copy
- categories
- neighborhoods
- photos
- logos
- policy text
- screenshots for design parity

### 4. Replace the file DB with your own database

The repo is already shaped for this next step:

- Prisma schema exists at `prisma/schema.prisma`
- services already isolate most business logic from page code

The next strong ownership move is:

- PostgreSQL
- Prisma
- proper migrations
- real persistent media storage

### 5. Deploy it somewhere you control

Good options:

- Vercel for the Next.js app
- Railway / Render / Fly.io / Supabase Postgres for production DB later
- S3-compatible storage for images later

## If You Want Closer Base44 Parity

Because you do not have code export access, the best approach is:

1. Open the Base44 app side by side.
2. Take screenshots of every important screen.
3. List every flow and every field.
4. Compare each one against this repo.
5. Rebuild the missing flows here.

The major pieces still not rebuilt yet are things like:

- fuller admin moderation
- owner editing tools
- owner replies to reviews
- richer business submission and editing
- production database and deployment hardening

## Best Practical Answer To Your Question

If the goal is "make the Base44 version mine," the most realistic path is **not** to wait for Base44 to reveal hidden source code.

The realistic path is:

- use this local repo as your owned source code
- migrate the visible product behavior into it
- move data and hosting off Base44
- keep rebuilding the missing pieces here until Base44 is no longer needed

At that point, the product is yours in the way that matters: code, hosting, data, and deployment are all under your control.
