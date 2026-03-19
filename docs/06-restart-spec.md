# Restart Spec

This is the direct reconstruction brief based on:

- the imported HabeshaLocal product/audit docs
- the current rebuilt Next.js app
- the screenshot at `/Users/dagemamogne/Desktop/Screenshots/Screenshot 2026-03-17 at 10.46.08 AM.png`

It is intentionally written as a fresh-start product and UI brief, not as a handoff.

## 1. Product To Rebuild

Build a Yelp-style local business discovery platform for Addis Ababa called **HabeshaLocal**.

Core goals:

- help users discover businesses by category and neighborhood
- give businesses a trust signal through ratings and reviews
- let users save places for later
- let users report abuse or bad content
- let owners claim their businesses
- let admins review ownership claims

Core roles:

- anonymous visitor
- authenticated member
- business owner
- admin

## 2. Routes and Flows To Preserve

### Public

- `/` — hero-led homepage
- `/discover` — search and filter businesses
- `/business/[slug]` — business detail page

### Authenticated member

- `/login`
- `/signup`
- `/profile`
- `/saved`
- review submission
- report submission
- save / unsave
- `/claim-business`

### Owner

- `/owner`

### Admin

- `/admin/claims`

## 3. Homepage Visual Direction From Screenshot

The screenshot clearly defines the visual style of the homepage hero.

### Layout structure

- full-viewport hero section
- background image fills the screen edge to edge
- dark semi-transparent overlay over the image
- small brand/logo in the top-left
- minimal nav in the top-right
- centered badge above the headline
- large centered multi-line headline
- centered supporting paragraph
- centered search bar with two input regions and one CTA button
- centered category chips below search
- small trending text row below chips

### Visual tone

- premium, cinematic, editorial
- less “dashboard SaaS”, more “modern consumer product”
- dark image-led atmosphere with bright focal typography
- orange is the main accent color
- everything uses large radii and soft transparency
- nav and inputs feel glassy, not flat

### Key style traits to preserve

- big white headline with orange emphasis
- translucent rounded search surface
- orange call-to-action button
- rounded filter/category chips
- soft blur / glass effect over dark photography
- lots of center alignment and whitespace
- restrained top navigation

### Approximate design tokens

- primary accent: warm orange / amber
- text on hero: white with soft opacity for secondary text
- surface over image: slate / charcoal with transparency
- radius language: large, pill-heavy, soft corners
- shadow language: soft depth, not harsh black shadows

### Typography feel

- strong, bold geometric headline
- secondary text lighter and narrower
- chip/nav/search text smaller and calm
- overall hierarchy should feel intentional and polished, not default Tailwind demo styling

## 4. Homepage Functional Structure

The homepage should include:

- logo / brand
- nav links such as Explore and Saved
- hero badge
- hero headline
- hero supporting text
- keyword search input
- location / area filter input
- search button
- category quick-filter chips
- trending business links or names

## 5. Discovery Experience

The discovery page should:

- support keyword search
- support category filtering
- support neighborhood filtering
- support sorting
- be mobile-friendly
- show business cards with:
  - name
  - short description
  - address/neighborhood
  - rating
  - review count
  - save state
  - tags

## 6. Business Detail Experience

The business page should include:

- business hero/header
- category and neighborhood context
- rating and review count
- save button
- report button
- long description
- tags
- map/location section
- published reviews list
- review distribution summary
- review creation entry point
- related businesses

## 7. Logged-In Member Features

- sign up with email/password
- sign in / sign out
- update display name
- save and unsave businesses
- submit reports
- create one review per business
- upload up to 4 review photos
- view saved businesses
- view authored reviews
- submit business claim

## 8. Ownership Claim Flow

- member selects an unclaimed business
- member submits relationship + proof text
- admin reviews pending claims
- admin approves or rejects
- approval assigns `ownerUserId` to the business
- competing pending claims for the same business become superseded
- approved owner sees a minimal owner dashboard

## 9. Data Model

The app needs these main entities:

- `User`
- `Business`
- `Review`
- `Save`
- `Report`
- `BusinessClaim`
- `Category`
- `Neighborhood`

Important fields:

### User

- id
- email
- passwordHash
- displayName
- role
- createdAt
- updatedAt

### Business

- id
- slug
- name
- shortDescription
- longDescription
- address
- priceTier
- categoryId
- neighborhoodId
- tags
- cover/image fields
- rating
- reviewCount
- saveCount
- ownerUserId
- claimedAt

### Review

- id
- businessId
- authorId
- authorName
- rating
- title
- body
- visitDate
- status
- reportCount
- photoUrls
- createdAt
- updatedAt

### Save

- id
- businessId
- userId
- createdAt

### Report

- id
- businessId
- reviewId optional
- userId
- reason
- details
- contactEmail optional
- status
- createdAt

### BusinessClaim

- id
- businessId
- userId
- claimantName
- claimantEmail
- relationship
- proofText
- status
- adminNote optional
- reviewedAt optional
- reviewedByUserId optional
- createdAt

## 10. Business Rules

- ratings only count published reviews
- removed and pending reviews must not affect public score
- one user can only review a business once
- save counts must match actual save rows
- report submission requires auth
- save / unsave requires auth
- review creation requires auth
- claim submission requires auth
- admin claim review requires admin
- owner dashboard requires approved ownership

## 11. New Repo Build Direction

If restarting in a completely new repo, build it with:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma
- proper server-owned auth/session handling
- structured feature modules

### Recommended feature modules

- `auth`
- `home`
- `discovery`
- `businesses`
- `reviews`
- `saves`
- `reports`
- `claims`
- `profile`
- `owner`
- `admin`

## 12. What To Prioritize First In The New Repo

1. Match the homepage visual feel from the screenshot
2. Match discovery and business page flow
3. Recreate auth and save/review/report behavior
4. Recreate claim submission and admin claim approval
5. Replace file-backed dev data with real Postgres/Prisma

## 13. Non-Negotiables

- do not let the new version become a generic admin-looking site
- preserve the consumer-product, editorial, image-led feel
- preserve big rounded surfaces and orange-accent hero styling
- keep the experience mobile-friendly
- keep trust and moderation visible in the product language

## 14. Practical Use Of This Spec

Use this document as the “north star” when starting the new repo.

If you gather more screenshots later, add page-by-page visual specs beneath this file, but this is enough to begin the restart with the correct product shape and homepage direction.
