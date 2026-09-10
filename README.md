# Inzicht

A learning project: a booking site for a solo therapist's private practice.
The goal is to understand how a real scheduling app works end to end, not
just to end up with a finished product — so slices are built one at a time,
explained, and reviewed before moving on.

## Status

All six planned phase-1 slices are in: data model, availability/booking
logic with conflict prevention, the slot-picker UI, booking submission, a
stubbed confirmation email, and an admin view (login, cancel bookings, block
off time).

## Running it

```
npm install
npm run dev      # http://localhost:3000
npm test         # availability/conflict logic tests
npm run db:init  # create/inspect the SQLite file without starting the app
```

The admin view is at `/admin`. The password defaults to `changeme` — set
`ADMIN_PASSWORD` in the environment (e.g. an untracked `.env.local`) to
change it. See "Explicitly out of scope" below for why this is deliberately
minimal.

## Stack decisions

- **Frontend + backend: Next.js (App Router), one project.**
  Next.js Route Handlers act as the API layer instead of a separate Express
  server. Tradeoff: a standalone Express backend would make the "this is the
  API" boundary more explicit and would be easier to reuse from a future
  mobile app, but it means running two servers, wiring up CORS, and writing
  routing/middleware by hand. For a single-developer learning project, one
  Next.js app keeps the dev loop simple (`npm run dev`, one process) without
  hiding much — Route Handlers are just functions that read a request and
  return a response, same mental model as an Express handler.
- **No ORM.** Database access is plain SQL against SQLite (via
  `better-sqlite3`), wrapped in a small hand-written data-access layer under
  `src/lib/db/`. An ORM (e.g. Prisma) would hide exactly the part — how
  queries and constraints work — that's most worth learning here, and this
  project's dependency list stays intentionally short.
- **SQLite now, Postgres-ready later.** All SQL lives behind functions in
  `src/lib/db/`, not scattered through route handlers or components. Moving
  to Postgres later means rewriting that one layer's implementation, not the
  business logic that calls it.
- **JavaScript, not TypeScript**, to start — one less thing to learn
  alongside React/Next and raw SQL. Can revisit if it starts to hurt,
  especially around date/time handling.

## Folder structure

```
src/
  app/            Next.js pages (public site + admin) and API route handlers.
                   Route handlers should stay thin: parse the request, call
                   into src/lib/, return a response.
  lib/
    db/            SQLite connection + schema + query functions. The only
                     place raw SQL lives.
    availability/  Slot generation and double-booking conflict logic.
                     This is the part we're building most carefully, with
                     tests, since it's the core of what a scheduling app does.
    email/         Email sending. Stubbed (console.log) for now — no real
                     provider until this becomes more than a learning project.
  components/      Shared React UI components (components/admin/ for the
                     admin-only ones).
  proxy.js         Next.js proxy (formerly "middleware"): gates /admin and
                     /api/admin behind the admin password.
tests/            Tests, focused first on src/lib/availability/.
data/             SQLite database file lives here at runtime (gitignored).
```

## Explicitly out of scope for now

- Payments
- Real email/SMS delivery
- HIPAA compliance / real client health data — this is a learning project.
  If it's ever pointed at real clients, encryption, hosting, and compliance
  need a dedicated pass before that happens.
- Auth beyond a single hardcoded admin password — no hashing, no rate
  limiting, no CSRF protection, no real session tokens. Fine for a learning
  project; would need real auth before ever holding real client data.
- Multi-timezone support (single practice timezone only)
