# PandaWork Architecture Index for AI Agents

## 1. High-Level Overview
- **Purpose:** The repo hosts PandaWork, an Upwork-inspired freelancing marketplace (landing page, auth flows, dashboards) built as a Next.js + Prisma monolith so clients, freelancers and platform staff can manage jobs, proposals, contracts, payments and messaging from one stack (`app/page.tsx:1`, `app/client/dashboard/page.tsx:1`, `app/freelancer/dashboard/page.tsx:1`).
- **Architecture:** App Router drives the UI with `app/layout.tsx:1` wrapping every page in an `AuthGuard` while API routes under `app/api` implement the server layer; Prisma (`lib/prisma.ts:1`) + PostgreSQL serve persistence and `package.json:1` scripts run `prisma generate`/`migrate deploy` before production builds.
- **Key technologies:** Next.js 16 + React 19, Tailwind via `app/globals.css:1` and `postcss.config.mjs:1`, Prisma 5 + PostgreSQL (`prisma/schema.prisma:1`), Stripe (`app/api/payments/webhook/route.ts:1`, `app/api/client/milestones/fund/route.ts:1`), SendGrid (`lib/email.ts:1`), AWS S3-compatible storage (`app/api/upload/route.ts:1`, `lib/storage.ts:1`), JWT auth (`lib/auth.ts:1`, `lib/requireAuth.ts:1`), and Axios/Formik/Yup on the client (`app/auth/register/page.tsx:1`, `app/auth/login/page.tsx:1`).

## 2. Application Entry Points
- `app/layout.tsx:1` hooks global fonts, theme, CSS, and the top-level `AuthGuard` so every route checks tokens stored in `localStorage` before rendering client/freelancer areas.
- `app/page.tsx:1` is the marketing landing page with calls to action; new marketing copy stays here.
- `app/globals.css:1` sets the Tailwind theme tokens used everywhere.
- `package.json:1` exposes `npm run dev`, `npm run build` (runs Prisma then Next), `npm run start`, `npm run seed`, and `npm run lint`, so CI/CD should honor that order.
- `next.config.ts:1` re-exports `STRIPE_PUBLISHABLE_KEY` to the browser; `tsconfig.json:1` plus `next-env.d.ts:1` are the TypeScript glue that keep client/server shared types aligned.
- `lib/requireAuth.ts:1` is the server entry for routes that need authentication, so every protected route calls this helper before touching Prisma.

## 3. Module Index
### Auth module (`app/auth/*`, `app/api/auth/*`)
- **Directory:** UI routes in `app/auth/` plus API in `app/api/auth` (`app/api/auth/login/route.ts:1`, `app/api/auth/signup/route.ts:1`, etc.).
- **Responsibility:** Onboard users via Register/Login/Forgot/Reset flows, issue JWT, persist hashed passwords, send welcome/reset emails (`lib/email.ts:1`, `lib/emailTemplates.ts:1`).
- **Providers:** Public provider is the POST handlers; internal providers are Prisma + SendGrid helpers plus `bcryptjs`/`jsonwebtoken` for hashing and tokens.
- **Imports/Exports:** Imports `lib/prisma.ts:1`, `lib/email.ts:1`, `lib/emailTemplates.ts:1`, `lib/auth.ts:1`, and shares no exports outside the API routes.
- **Type:** Feature-based (auth/business) with front-end + API pair.

### Client module (`app/client/*`, `app/api/client/*`, `app/api/contracts/*`, `app/api/proposals/*`, `app/api/reviews/*`)
- **Responsibility:** Client dashboards, job posting, invites, proposals, contracts, milestones, releasing funds, reviews (`app/client/jobpost/page.tsx:1`, `app/api/client/milestones/release/route.ts:1`, `app/api/proposals/[id]/route.ts:1`).
- **Providers:** API routes consume `lib/prisma.ts:1`, `lib/platformFee.ts:1`, `lib/requireAuth.ts:1`, and emailing helpers; UIs consume shared components and `axios`.
- **Imports/Exports:** Clients call APIs grouped by domain (jobs, contracts, invites); API routes export HTTP handlers for the App Router.
- **Type:** Feature-based/domain module.

### Freelancer module (`app/freelancer/*`, `app/api/freelancer/*`)
- **Responsibility:** Freelancer workspace: browse jobs, save jobs, manage proposals, respond to invites, view contracts/milestones, withdraw funds, update profile (`app/freelancer/jobs/page.tsx:1`, `app/api/freelancer/proposals/route.ts:1`, `app/api/freelancer/withdrawals/route.ts:1`).
- **Providers:** Server side uses Prisma + authentication + Stripe/withdrawal helpers; client uses shared components including `FreelancerNavbar`/`JobCard`.
- **Imports/Exports:** API routes use `lib/requireAuth.ts:1` and share standard JSON responses.
- **Type:** Feature-based with heavy reuse of shared UI.

### Payments & Escrow infrastructure (`app/api/payments`, `app/api/client/milestones`, `app/api/freelancer/milestones`)
- **Responsibility:** Fund milestones, release payments, log Stripe hooks, compute platform fees, track balances, and host webhook entrypoints (`app/api/payments/webhook/route.ts:1`, `app/api/payments/history/route.ts:1`).
- **Providers:** `lib/platformFee.ts:1`, Prisma, Stripe SDK, email notifications.
- **Type:** Infrastructure supporting both clients and freelancers.

### Shared UI module (`app/components/*`, `app/data/jobs.ts:1`)
- **Files:** `AuthGuard`, `ClientNavbar`, `FreelancerNavbar`, `JobCard`, `AlertModal`, `BackButton` (`app/components/JobCard.tsx:1` etc.).
- **Responsibility:** Provide the nav, guard, layout utilities and job-card presentation shared across client/freelancer pages.
- **Type:** Shared/hybrid components consumed by multiple feature modules.

### Infrastructure module (`lib/*`)
- **Files:** Singleton Prisma client, JWT helpers, storage helpers, platform fee helpers, SendGrid/email templates, saved-job localStorage utilities (`lib/prisma.ts:1`, `lib/auth.ts:1`, `lib/storage.ts:1`, `lib/platformFee.ts:1`, `lib/email.ts:1`, `lib/emailTemplates.ts:1`, `lib/savedJobs.ts:1`).
- **Responsibility:** Provide shared data-access, auth, email, storage facilities and encapsulate side effects.
- **Type:** Infrastructure-level providers (stateless or singleton scope as noted in Section 5).

## 4. Controllers
### `/api/auth`
- `POST /api/auth/signup` (`app/api/auth/signup/route.ts:1`): Validates fields, hashes password, creates `User`, sends `templateWelcome`, returns user summary (no JWT).
- `POST /api/auth/login` (`app/api/auth/login/route.ts:1`): Authenticates via Prisma + `bcryptjs`, signs JWT with `AUTH_SECRET`, returns token + user payload. No guard required.
- `POST|GET /api/auth/logout` (`app/api/auth/logout/route.ts:1`): No-op endpoint, frontend clears token locally.
- `POST /api/auth/forgot-password` (`app/api/auth/forgot-password/route.ts:1`): Creates `PasswordResetToken`, emails `templateForgotPassword`.
- `POST /api/auth/reset-password` (`app/api/auth/reset-password/route.ts:1`): Validates token, hashes new password, deletes token in transaction.

### `/api/client`
Each handler calls `requireAuth` (`lib/requireAuth.ts:1`) and casts `userId` to client context.
- `/client/stats` (`app/api/client/stats/route.ts:1`): Aggregates counts, spending, returns overview for `ClientNavbar`/dashboard.
- `/client/my-jobs` (`app/api/client/my-jobs/route.ts:1`): Lists the client’s jobs for invite UI.
- `/client/jobs` (`app/api/client/jobs/route.ts:1`): GET open jobs, POST to create job (validates `experienceLevel` to Prisma Enum).
- `/client/jobs/[id]` (`app/api/client/jobs/[id]/route.ts:1`): Returns a single job ensuring ownership.
- `/client/proposals` (`app/api/client/proposals/route.ts:1`): GET proposals for client-owned jobs.
- `/client/invites` (`app/api/client/invites/route.ts:1`): GET invites created and POST to send one (ensures job ownership, deduplicates, sends `templateJobInvite`).
- `/client/freelancers` and `/client/freelancers/[id]` (`app/api/client/freelancers/route.ts:1`, `app/api/client/freelancers/[id]/route.ts:1`): Browse freelancer profiles and fetch detail with signed avatar URLs from `lib/storage.ts:1`.
- `/client/contracts` and `/client/contracts/[id]` (`app/api/client/contracts/route.ts:1`, `app/api/client/contracts/[id]/route.ts:1`): Returns contracts + milestones scoped to client.
- `/client/milestones/fund` (`app/api/client/milestones/fund/route.ts:1`): Creates Stripe PaymentIntent, returns `clientSecret`.
- `/client/milestones/release` (`app/api/client/milestones/release/route.ts:1`): Releases milestone + payment as `RELEASED`, emails freelancer.

### `/api/freelancer`
- `/freelancer/stats` (`app/api/freelancer/stats/route.ts:1`): Dashboard metrics mirroring client stats.
- `/freelancer/jobs` and `/freelancer/jobs/[id]` (`app/api/freelancer/jobs/route.ts:1`, `app/api/freelancer/jobs/[id]/route.ts:1`): Public job list/detail used by job discovery UI (`app/freelancer/jobs/page.tsx:1`).
- `/freelancer/saved-jobs` (GET/POST/DELETE) (`app/api/freelancer/saved-jobs/route.ts:1`), `/saved-jobs/count` (`app/api/freelancer/saved-jobs/count/route.ts:1`), `/saved-jobs/check` (`app/api/freelancer/saved-jobs/check/route.ts:1`): CRUD + badge count for saved jobs.
- `/freelancer/proposals` (`app/api/freelancer/proposals/route.ts:1`): GET freelancer proposals, POST new one (de-dupe, send `templateProposalReceived`).
- `/freelancer/proposals/check` (`app/api/freelancer/proposals/check/route.ts:1`): Boolean flag if already applied.
- `/freelancer/invites` (`app/api/freelancer/invites/route.ts:1`): List invites.
- `/freelancer/invites/[id]` (`app/api/freelancer/invites/[id]/route.ts:1`): Accept/decline invite.
- `/freelancer/contracts` & `[id]` (`app/api/freelancer/contracts/route.ts:1`, `app/api/freelancer/contracts/[id]/route.ts:1`): Contracts scoped to freelancer.
- `/freelancer/balance` (`app/api/freelancer/balance/route.ts:1`): Available funds calculation.
- `/freelancer/withdrawals` (`app/api/freelancer/withdrawals/route.ts:1`): GET history and POST request with bank details, emails `templateWithdrawalRequested`.
- `/freelancer/milestones/submit` (`app/api/freelancer/milestones/submit/route.ts:1`): Marks funded milestone as submitted.
- `/freelancer/profile` (`app/api/freelancer/profile/route.ts:1`): GET profile with signed avatar, reviews, PUT to adjust sections (skills, experience, rate, stats, portfolio, avatar).

### Shared controllers
- `/api/contracts/[id]` (`app/api/contracts/[id]/route.ts:1`): Returns contract if user is client/freelancer.
- `/api/proposals/[id]` (`app/api/proposals/[id]/route.ts:1`): Client accepts proposal and creates contract.
- `/api/reviews` (`app/api/reviews/route.ts:1`): Clients submit reviews after contract completes.
- `/api/payments/history` (`app/api/payments/history/route.ts:1`): Freelancers read released payments; server filters by JWT.
- `/api/payments/webhook` (`app/api/payments/webhook/route.ts:1`): Stripe webhook creates Payment + updates milestone status to `FUNDED`.
- `/api/upload` (`app/api/upload/route.ts:1`): Uploads files to S3-compatible storage and returns public URL.

## 5. Services & Providers
- `lib/prisma.ts:1`: Singleton Prisma client; reused in dev via `globalForPrisma`, stateless except connection pooling.
- `lib/auth.ts:1`: JWT verification helper used by `requireAuth`, stateless and throws null on failure.
- `lib/requireAuth.ts:1`: Parses Bearer token, reuses `lib/auth`, returns `NextResponse` when unauthorized or payload when valid; request-scoped guard.
- `lib/email.ts:1`: SendGrid wrapper with `SENDGRID_API_KEY` guard, logs warnings if not configured; used by signup/invite/milestones.
- `lib/emailTemplates.ts:1`: Provides HTML templates for welcome, proposal, invite, milestone, withdrawal, reset flows; config includes `APP_URL` from env.
- `lib/platformFee.ts:1`: Reads `PLATFORM_FEE_PERCENT`, computes fee amount for payments; stateless pure math.
- `lib/storage.ts:1`: AWS SDK `S3Client` config from env; exposes `getSignedFileUrl` for `app/api/client/freelancers/[id]` and `app/api/freelancer/profile`.
- `lib/savedJobs.ts:1`: Client-side `localStorage` helper, event emitter (`savedJobsChanged`) for `FreelancerNavbar` badge updates.

## 6. Data Layer
- Prisma schema (`prisma/schema.prisma:1`) models users, profiles, jobs, proposals, invites, contracts, milestones, payments, reviews, withdrawals, portfolios, experiences, skills, reset tokens plus enums (`UserRole`, `JobType`, etc.).
- `prisma/seed.ts:1` clears users then seeds a client + sample jobs for onboarding. Run via `npm run seed` or `ts-node prisma/seed.ts` using `prisma/tsconfig.seed.json:1`.
- Prisma client generated in `node_modules` via `prisma generate` called implicitly on `postinstall` and explicitly before `next build` (`package.json:1`).
- `DATABASE_URL` from `.env.example:1` (Postgres) drives migrations (`prisma migrate deploy`). Transactions (e.g., `app/api/auth/reset-password/route.ts:1`) use `prisma.$transaction` to update password + delete token atomically.

## 7. DTOs, Schemas & Validation
- Client forms use Formik + Yup (`app/auth/register/page.tsx:1`, `app/auth/login/page.tsx:1`, `app/auth/forgot-password/page.tsx:1`, `app/auth/reset-password/page.tsx:1`) to enforce field presence, password rules, email format, and matching passwords.
- Server handlers perform explicit checks (e.g., `experienceLevel` must be uppercased before persisting in `app/api/client/jobs/route.ts:1`, milestone IDs are parsed and validated in `app/api/client/milestones/fund/route.ts:1` and `app/api/client/milestones/release/route.ts:1`, ratings constrained inside `app/api/reviews/route.ts:1`).
- DTO mapping happens in controllers (e.g., `app/api/freelancer/saved-jobs/route.ts:1` maps Prisma `Job` to the `JobCard` view model, `app/api/freelancer/profile/route.ts:1` assembles profile + reviews). Response shapes are plain JSON objects (no `class-transformer`).

## 8. Cross-Cutting Concerns
- **Auth & Authorization:** JWTs stored in `localStorage`, issued in `app/api/auth/login/route.ts:1`, validated everywhere via `lib/requireAuth.ts:1`; `app/components/AuthGuard.tsx:1` enforces per-path role gating and redirects.
- **Guards/Interceptors:** Aside from `AuthGuard`, there are no Nest-style interceptors, but `requireAuth` short-circuits unauthorized requests; role checks are repeated (clients vs freelancers).
- **Logging:** Most API files log via `console.error`/`console.log` (e.g., `app/api/client/jobs/route.ts:1`, `app/api/payments/webhook/route.ts:1`).
- **Error handling:** Try/catch blocks wrap every mutation to return `NextResponse.json({ error: … }, { status })`, so `axios` clients can display toast messages from the `message` field.
- **Validation pipes:** Input shaping occurs manually (parsing `body`/`params`, uppercasing enums, trimming strings) rather than decorators.

## 9. Configuration & Environment
- `.env.example:1` lists secrets: `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, Stripe keys, SendGrid details, `STORAGE_*` credentials, `PLATFORM_FEE_PERCENT`. This file defines every runtime toggle.
- `next.config.ts:1` exposes `STRIPE_PUBLISHABLE_KEY` to the browser while keeping Stripe secret keys server-only.
- `tsconfig.json:1`, `next-env.d.ts:1`, and `postcss.config.mjs:1` drive TypeScript/Tailwind compilation; `eslint.config.mjs:1` enforces linting.
- `package.json:1` scripts ensure Prisma is generated/migrated before builds; `postinstall` regenerates the client.
- Secrets live only in environment variables; no `.env` is committed but `.env.example` documents what each value means.

## 10. Async & Background Processing
- Stripe webhook `app/api/payments/webhook/route.ts:1` listens for `checkout.session.completed`, validates the signature, creates a `Payment` record, updates the milestone status to `FUNDED`, and records the platform fee via `lib/platformFee.ts:1`.
- `app/api/client/milestones/fund/route.ts:1` asynchronously creates Stripe PaymentIntents and returns `clientSecret`; `app/api/client/milestones/release/route.ts:1` performs payment status transitions and fires email notifications (`lib/email.ts:1`, `lib/emailTemplates.ts:1`).
- Email notifications (welcome, proposal, invite, withdrawal, milestone release) are `fire-and-forget` async calls that log errors but do not block the request flow.
- `app/api/upload/route.ts:1` uploads binary files to S3 with signed URLs; `lib/storage.ts:1` later generates signed URLs for downloads.

## 11. Testing Structure
- No unit/integration/e2e tests exist currently; the repo relies on manual smoke testing via `npm run dev` + `package.json:1` seeds.
- To add coverage, wrap API route logic in shareable functions and test them with your preferred runner (`vitest`, `jest`, etc.), mocking `lib/prisma.ts:1` and `lib/requireAuth.ts:1`.
- Maintain `prisma/seed.ts:1` for deterministic data when running tests against a local instance.
- Linting is available via `npm run lint` (`eslint.config.mjs:1`), so any new TypeScript/React work should pass ESLint before merging.

## 12. File & Directory Index
```
.
├─ `README.md:1` – describes this project as a Next.js bootstrap plus enviable landing copy.
├─ `.env.example:1` – lists every runtime variable (DB URL, auth secret, Stripe/SendGrid/storage config).
├─ `.gitattributes:1` – marks exports for Git.
├─ `.gitignore:1` – ignores `.next`, `node_modules`, `.env`, and other build artifacts.
├─ `package.json:1` – defines dependencies, Prisma/Next scripts, and lint/seed helpers.
├─ `package-lock.json:1` – lockfile for npm dependencies used by CI.
├─ `next.config.ts:1` – exposes only the publishable Stripe key to the browser.
├─ `tsconfig.json:1` – TypeScript compiler options for both client and server code.
├─ `next-env.d.ts:1` – Next.js ambient types.
├─ `postcss.config.mjs:1` – tailwindcss plugin referenced by `@tailwindcss/postcss`.
├─ `eslint.config.mjs:1` – Next.js-aware ESLint config.
├─ `app/`
│  ├─ `layout.tsx:1` – root layout wrapping every page in `AuthGuard` and global fonts.
│  ├─ `page.tsx:1` – marketing hero, CTA buttons, stats, and category cards.
│  ├─ `globals.css:1` – Tailwind theme tokens for background/foreground/accent colors.
│  ├─ `favicon.ico` – default favicon.
│  ├─ `auth/`
│  │  ├─ `login/page.tsx:1` – login form (Formik + Yup) posting to `/api/auth/login`.
│  │  ├─ `register/page.tsx:1` – registration form (role toggle, validation, toast feedback).
│  │  ├─ `forgot-password/page.tsx:1` – email form calling `/api/auth/forgot-password`.
│  │  └─ `reset-password/page.tsx:1` – token-based password reset form.
│  ├─ `client/`
│  │  ├─ `dashboard/page.tsx:1` – client overview calling `/api/client/stats` and `/api/client/my-jobs`.
│  │  ├─ `jobpost/page.tsx:1` – job posting UI that hits `/api/client/jobs`.
│  │  ├─ `jobs/page.tsx:1` – lists client’s posted jobs.
│  │  ├─ `jobs/[id]/invite/page.tsx:1` – invite workflow for a job.
│  │  ├─ `contracts/page.tsx:1` – lists contracts using `/api/client/contracts`.
│  │  ├─ `contracts/[id]/page.tsx:1` – contract detail view for the client.
│  │  ├─ `proposals/page.tsx:1` – proposal inbox for client jobs.
│  │  ├─ `freelancers/[id]/page.tsx:1` – detailed freelancer profile (calls `/api/client/freelancers/[id]`).
│  │  └─ `invite/page.tsx:1` – invite composer for freelancers.
│  ├─ `freelancer/`
│  │  ├─ `dashboard/page.tsx:1` – freelancer overview calling `/api/freelancer/stats` plus proposals.
│  │  ├─ `jobs/page.tsx:1` – marketplace jobs list hitting `/api/freelancer/jobs`.
│  │  ├─ `jobs/[id]/page.tsx:1` – job detail view used before applying.
│  │  ├─ `jobs/[id]/apply/page.tsx:1` – proposal form posting to `/api/freelancer/proposals`.
│  │  ├─ `saved/page.tsx:1` – saved jobs list integrating API + `lib/savedJobs.ts:1`.
│  │  ├─ `proposals/page.tsx:1` – proposal management list.
│  │  ├─ `invites/page.tsx:1` – invite inbox using `/api/freelancer/invites`.
│  │  ├─ `contracts/page.tsx:1` – contract/milestone tracker.
│  │  ├─ `contracts/[id]/page.tsx:1` – contract detail view.
│  │  ├─ `profile/page.tsx:1` – profile editor calling `/api/freelancer/profile`.
│  │  ├─ `withdrawals/page.tsx:1` – withdrawal UI tied to `/api/freelancer/withdrawals` and `/api/freelancer/balance`.
│  ├─ `components/`
│  │  ├─ `AuthGuard.tsx:1` – client-side guard redirecting based on token + role.
│  │  ├─ `ClientNavbar.tsx:1` – client workspace navbar with profile menus.
│  │  ├─ `FreelancerNavbar.tsx:1` – freelancer navbar with badges (saved jobs, profile photo).
│  │  ├─ `JobCard.tsx:1` – reusable card for job listings.
│  │  ├─ `AlertModal.tsx:1` – confirmation/alert modal used in multiple flows.
│  │  └─ `BackButton.tsx:1` – shared back-link component.
│  └─ `data/jobs.ts:1` – mock job data / helper used by marketing cards.
├─ `app/api/`
│  ├─ `auth/`
│  │  ├─ `login/route.ts:1`
│  │  ├─ `logout/route.ts:1`
│  │  ├─ `signup/route.ts:1`
│  │  ├─ `forgot-password/route.ts:1`
│  │  └─ `reset-password/route.ts:1`
│  ├─ `client/`
│  │  ├─ `stats/route.ts:1`
│  │  ├─ `my-jobs/route.ts:1`
│  │  ├─ `jobs/route.ts:1`
│  │  ├─ `jobs/[id]/route.ts:1`
│  │  ├─ `proposals/route.ts:1`
│  │  ├─ `contracts/route.ts:1`
│  │  ├─ `contracts/[id]/route.ts:1`
│  │  ├─ `freelancers/route.ts:1`
│  │  ├─ `freelancers/[id]/route.ts:1`
│  │  ├─ `invites/route.ts:1`
│  │  ├─ `milestones/`
│  │  │  ├─ `fund/route.ts:1`
│  │  │  └─ `release/route.ts:1`
│  ├─ `freelancer/`
│  │  ├─ `saved-jobs/route.ts:1`
│  │  ├─ `saved-jobs/count/route.ts:1`
│  │  ├─ `saved-jobs/check/route.ts:1`
│  │  ├─ `jobs/route.ts:1`
│  │  ├─ `jobs/[id]/route.ts:1`
│  │  ├─ `proposals/route.ts:1`
│  │  ├─ `proposals/check/route.ts:1`
│  │  ├─ `invites/route.ts:1`
│  │  ├─ `invites/[id]/route.ts:1`
│  │  ├─ `contracts/route.ts:1`
│  │  ├─ `contracts/[id]/route.ts:1`
│  │  ├─ `balance/route.ts:1`
│  │  ├─ `withdrawals/route.ts:1`
│  │  ├─ `stats/route.ts:1`
│  │  ├─ `profile/route.ts:1`
│  │  └─ `milestones/submit/route.ts:1`
│  ├─ `contracts/[id]/route.ts:1`
│  ├─ `proposals/[id]/route.ts:1`
│  ├─ `payments/`
│  │  ├─ `webhook/route.ts:1`
│  │  └─ `history/route.ts:1`
│  ├─ `upload/route.ts:1`
│  └─ `reviews/route.ts:1`
├─ `lib/`
│  ├─ `prisma.ts:1`
│  ├─ `auth.ts:1`
│  ├─ `requireAuth.ts:1`
│  ├─ `email.ts:1`
│  ├─ `emailTemplates.ts:1`
│  ├─ `platformFee.ts:1`
│  ├─ `storage.ts:1`
│  └─ `savedJobs.ts:1`
├─ `prisma/`
│  ├─ `schema.prisma:1`
│  ├─ `seed.ts:1`
│  └─ `tsconfig.seed.json:1`
├─ `public/`
│  ├─ `public/file.svg:1` – placeholder asset for marketing.
│  ├─ `public/globe.svg:1` – icon used on landing hero.
│  ├─ `public/next.svg:1` – default Next.js mark.
│  ├─ `public/vercel.svg:1` – Vercel icon.
│  └─ `public/window.svg:1` – decorative asset.
├─ `.next/` – build output (ignored in Git; regenerated each `npm run dev`).
```

## 13. How to Modify This Codebase Safely
- **Where to add new features:** Extend a focused module—e.g., add a new client UI page under `app/client/*` and its API route under `app/api/client`; reuse shared components (`app/components/*`) and `lib/*` helpers.
- **Where NOT to touch:** Avoid modifying generated artifacts (`.next/`, `node_modules/`) or the Prisma schema without updating migrations + `prisma/seed.ts:1`; keep `lib/prisma.ts:1` singleton logic unchanged to prevent hot-reload issues.
- **Request tracing:** Follow `/api/*` handler → `lib/requireAuth.ts:1` guard → `lib/prisma.ts:1` call → `prisma/schema.prisma:1` model; UI pages call `/api/*` via `axios` (see `app/client/dashboard/page.tsx:1` and `app/freelancer/dashboard/page.tsx:1`).
- **Finding files for a feature/bug:** Match the affected UI folder (`app/client` vs `app/freelancer`), plus the API route under `app/api/<domain>` and any helpers in `lib` (e.g., payment issues involve `app/api/payments/*` and `lib/platformFee.ts:1`).
- **Common NestJS pitfalls to avoid:** This stack is Next.js, so do not expect `@Module`/`@Injectable`; keep logic in API route handlers or shared helpers, avoid server-side decorators, and guard input manually (no auto-DTO binding).
