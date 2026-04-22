# GitHub Copilot Instructions — GoAvo Event Platform
# Place at: nextjs/.github/copilot-instructions.md
# Copilot reads this automatically in VS Code.

---

## Project Summary

Next.js 14 fullstack event management platform.
Single monorepo. App Router. TypeScript strict mode.
Auth: Clerk. DB: MongoDB + Mongoose. Email: Resend + React Email. Zoom: Server-to-Server OAuth.
Architecture: MVC — Routes → Controllers → Models → Extensions (Services via hooks).

---

## MVC Layer Rules (Most Important)

### Layer 1 — Routes (`app/api/**/route.ts`)
Routes are THIN. They do exactly two things:
1. Get `userId` from Clerk
2. Call the correct controller method and return the result

```typescript
// ✅ Correct route
export async function POST(req: Request) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const result = await createEvent(userId, body)
  return NextResponse.json({ data: result }, { status: 201 })
}

// ❌ Wrong — business logic in route
export async function POST(req: Request) {
  const { userId } = auth()
  const body = await req.json()
  if (!body.title) return NextResponse.json({ error: 'Title required' }, { status: 400 })
  const activeCount = await Registration.countDocuments(...)  // NO — this belongs in controller
  const event = await Event.create({ ...body, organizerClerkId: userId })
  await sendEmail(...)  // NO — this belongs in extension
  return NextResponse.json({ data: event })
}
```

### Layer 2 — Controllers (`controllers/*.ts`)
Controllers own ALL business logic:
- Input validation
- Capacity checks
- RSVP state machine transitions
- Ownership verification
- Firing hooks (never calling extensions directly)

```typescript
// controllers/EventController.ts
export async function createEvent(userId: string, body: CreateEventInput) {
  await dbConnect()
  if (!body.title || !body.dateTime || !body.capacity) {
    throw new Error('Missing required fields')
  }
  const slug = generateSlug(body.title)
  const event = await Event.create({
    ...body,
    organizerClerkId: userId,
    slug,
    status: 'draft',
  })
  return event.toObject()
}
```

### Layer 3 — Models (`models/*.ts`)
Models are PURE Mongoose schemas.
- Schema definition
- Indexes
- Nothing else — no business logic, no email, no hooks, no pre-save side effects

```typescript
// ✅ Correct model
const EventSchema = new Schema({ title: String, status: String, ... })
EventSchema.index({ slug: 1 }, { unique: true })
export default mongoose.models.Event || mongoose.model('Event', EventSchema)

// ❌ Wrong — side effects in model
EventSchema.post('save', async function() {
  await sendEmail(...)   // NEVER do this
  await triggerHook(...) // NEVER do this
})
```

### Layer 4 — Extensions (`extensions/**/index.ts`)
Extensions are the SERVICE layer. They subscribe to hooks and handle side effects.
They are NEVER imported by routes or controllers.

```typescript
// extensions/email/index.ts
export function registerEmailExtension() {
  onHook('registration.approved', async ({ registration, event }) => {
    await sendApproved(registration.attendeeEmail, event)
  })
}
```

---

## Authentication — Clerk (not NextAuth)

Always use Clerk for auth. Never use NextAuth, sessions, or custom JWT.

```typescript
// Getting userId in any API route
import { auth } from '@clerk/nextjs/server'
const { userId } = auth()
if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

// Ownership check (in controllers, not routes)
if (event.organizerClerkId !== userId) throw new Error('Forbidden')

// Event model uses organizerClerkId: string (not ObjectId ref)
// User model uses clerkId: string as the unique key
```

---

## Extensibility — Hook System

```typescript
// lib/hooks.ts pattern
// Controllers fire hooks. Extensions listen. Routes know nothing about this.

// In controller:
await triggerHook('registration.approved', { registration, event })

// In extension:
onHook('registration.approved', async ({ registration, event }) => {
  await sendApproved(registration.attendeeEmail, event)
})
```

Import rules:
- `app/api/*` → imports from `lib/`, `models/`, `controllers/`, `types/`
- `controllers/` → imports from `lib/`, `models/`, `types/`
- `extensions/` → imports from `lib/`, `models/`, `types/`
- `extensions/` is NEVER imported by `app/api/` or `controllers/`

`triggerHook` uses `Promise.allSettled` — one extension failure never breaks others.

### bootstrap.ts — call at top of every route file
```typescript
import { bootstrap } from '@/lib/bootstrap'
bootstrap()  // idempotent — registers extensions once per server process
```

---

## Public Event Status — Derived, Never Stored

```typescript
// lib/utils.ts
export function getPublicStatus(event: IEvent, activeCount: number): PublicStatus | null {
  if (event.status === 'draft') return null
  if (event.status === 'cancelled') return 'Cancelled'
  if (new Date() > new Date(event.dateTime)) return 'Closed'
  if (activeCount >= event.capacity) return 'Full'
  return 'Open'
}
// Only 'Open' allows new registrations. All others return 409.
```

---

## RSVP State Machine

```typescript
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending:    ['approved', 'rejected'],
  approved:   ['revoked'],
  registered: ['revoked'],
  // rejected and revoked are terminal — no transitions
}

// Always validate before updating:
const allowed = VALID_TRANSITIONS[registration.status] ?? []
if (!allowed.includes(newStatus)) {
  throw new Error(`Cannot transition from ${registration.status} to ${newStatus}`)
}
```

Capacity count: `{ status: { $in: ['registered', 'approved'] } }` — pending does NOT count.

---

## Attendee Dashboard — Search & Filter

`GET /api/events/[id]/registrations?search=john&status=pending`

```typescript
// In RegistrationController.list():
const query: Record<string, unknown> = { eventId }
if (status) query.status = status
if (search) {
  query.$or = [
    { attendeeName: { $regex: search, $options: 'i' } },
    { attendeeEmail: { $regex: search, $options: 'i' } },
  ]
}
```

Action buttons per row (conditional on status):
- `pending` → Approve + Reject
- `approved` or `registered` → Revoke
- `rejected` or `revoked` → no buttons

---

## Zoom Integration Rules

Zoom service lives in `extensions/zoom/service.ts` only.
Never import zoom service in controllers or routes.
Event always saves BEFORE Zoom is called.
Zoom failure sets `zoomSyncStatus: 'failed'` — never throws to client.

---

## Error Handling Pattern

Controllers throw errors. Routes catch them and return appropriate HTTP responses.

```typescript
// Route — catch controller errors
try {
  const result = await someControllerMethod(userId, params)
  return NextResponse.json({ data: result })
} catch (error) {
  if (error.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (error.message === 'Not found') return NextResponse.json({ error: 'Not found' }, { status: 404 })
  console.error(error)
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}
```

---

## Code Style

- TypeScript strict mode. No `any`. Proper types everywhere.
- Functional components only. Named exports for components, default exports for pages.
- `async/await` always. Never `.then().catch()`.
- Early returns for guards — no deeply nested if/else.
- Descriptive names: `registration` not `reg`, `event` not `evt`.
- Small, single-purpose functions.
- `===` always, never `==`.

---

## Tailwind / UI

- Tailwind only. No inline styles. No CSS modules.
- Status badge colors (use consistently):
  ```
  draft        → gray
  published    → green
  cancelled    → red
  Open         → green
  Full         → orange
  Closed       → gray
  Cancelled    → red
  pending      → yellow
  registered   → blue
  approved     → green
  rejected     → red
  revoked      → gray
  Zoom: synced → green
  Zoom: failed → red
  Zoom: pending → yellow
  ```
- Always show loading state (skeleton or spinner) — never blank screen.
- Always show empty state with message + CTA — never blank table.

---

## File Naming

```
controllers/  → PascalCase   (EventController.ts)
models/       → PascalCase   (Event.ts)
extensions/   → camelCase    (index.ts, service.ts)
lib/          → camelCase    (mongodb.ts, hooks.ts)
components/   → PascalCase   (EventCard.tsx, StatusBadge.tsx)
app/api/      → lowercase    (route.ts always)
```

---

## What NEVER to Do

- Never use NextAuth — project uses Clerk
- Never call email or Zoom services directly from routes or controllers — use triggerHook()
- Never put business logic in Mongoose models
- Never put side effects in pre/post save hooks
- Never import from `extensions/` in routes or controllers
- Never skip the ownership check on any organizer route
- Never let email or Zoom failure throw to the HTTP client
- Never use `any` type
- Never use `var`
- Never use `==` — always `===`
- Never skip the RSVP transition validation
- Never create any .md file
