# GoAvo.ai — Mini Event Management Platform
## Product Requirements Document (PRD)
> For use with GitHub Copilot. Read this before generating any code.

---

## 1. Project Overview

A fullstack event management platform where **organizers** create and manage events, and **attendees** register via a public page. Built in a single Next.js 14 monorepo using **MVC architecture** for the backend layer.

**Assignment constraints:**
- 72-hour take-home
- Evaluated on: functional correctness, code quality, product thinking, extensibility
- Extension task: **Zoom Integration** (Extension C)

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Database | MongoDB via Mongoose |
| Auth | **Clerk** (replaces NextAuth entirely) |
| Email | Resend + React Email |
| Zoom | Zoom Server-to-Server OAuth |
| Architecture | MVC (Controllers + Models + Extensions as Services) |
| Package manager | npm |

---

## 3. Architecture — MVC Pattern

```
HTTP Request
     ↓
app/api/**/route.ts        ← ROUTE (thin — auth check + call controller)
     ↓
controllers/*.ts           ← CONTROLLER (business logic, validation, orchestration)
     ↓
models/*.ts                ← MODEL (Mongoose schema + DB queries only)
     ↓
extensions/**/index.ts     ← SERVICE (side effects via hook system)
```

### Layer responsibilities
- **Routes** — thin. Get `userId` from Clerk, call controller, return result. Nothing else.
- **Controllers** — own all business logic: validation, capacity checks, state machine, firing hooks.
- **Models** — pure Mongoose schemas + indexes. No business logic, no email, no hooks.
- **Extensions (Services)** — react to hooks. Never called directly by routes or controllers.

### Folder structure
```
nextjs/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx     ← Clerk hosted UI
│   │   └── sign-up/[[...sign-up]]/page.tsx     ← Clerk hosted UI
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── events/
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── attendees/page.tsx
│   │   └── settings/page.tsx
│   ├── e/[slug]/page.tsx                        ← public (no auth)
│   └── api/
│       ├── events/
│       │   ├── route.ts
│       │   └── [id]/
│       │       ├── route.ts
│       │       ├── publish/route.ts
│       │       ├── cancel/route.ts
│       │       └── registrations/route.ts
│       ├── registrations/
│       │   └── [id]/
│       │       └── status/route.ts
│       ├── events/slug/[slug]/route.ts          ← public
│       └── users/
│           └── me/
│               ├── route.ts
│               └── settings/route.ts
│
├── controllers/                                 ← MVC Controllers
│   ├── EventController.ts
│   ├── RegistrationController.ts
│   └── UserController.ts
│
├── models/                                      ← MVC Models
│   ├── Event.ts
│   ├── Registration.ts
│   └── User.ts
│
├── lib/
│   ├── mongodb.ts
│   ├── hooks.ts
│   ├── bootstrap.ts
│   ├── templates.ts
│   └── utils.ts
│
├── extensions/                                  ← MVC Services
│   ├── index.ts
│   ├── email/
│   │   ├── index.ts
│   │   ├── service.ts
│   │   └── templates/
│   │       ├── RegistrationConfirmed.tsx
│   │       ├── UnderReview.tsx
│   │       ├── Approved.tsx
│   │       ├── Rejected.tsx
│   │       ├── Revoked.tsx
│   │       ├── EventUpdated.tsx
│   │       └── EventCancelled.tsx
│   └── zoom/
│       ├── index.ts
│       └── service.ts
│
├── middleware.ts                                ← Clerk only
├── types/index.ts
├── .env.local
└── .env.example
```

---

## 4. Authentication — Clerk

Clerk replaces NextAuth entirely. No custom session/JWT code.

### What Clerk gives us
- Hosted sign-in / sign-up UI
- Session cookies + JWT (handled automatically)
- `userId` string (e.g. `user_2abc...`) available server-side via `auth()`
- Middleware to protect routes

### What we build on top
- A MongoDB `User` doc per organizer, keyed by `clerkId`, to store Zoom credentials

### middleware.ts
```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect()
})

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}
```

### Getting userId in API routes
```typescript
import { auth } from '@clerk/nextjs/server'

const { userId } = auth()
if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

### Ownership check (in controllers — not routes)
```typescript
if (event.organizerClerkId !== userId) {
  throw new Error('Forbidden')   // controller throws, route catches and returns 403
}
```

### Clerk env vars
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_
CLERK_SECRET_KEY=sk_test_
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

---

## 5. User Roles

### Organizer
- Authenticated via Clerk
- Has a MongoDB `User` doc (`clerkId` as key)
- Can: create/edit/publish/cancel events, view and manage all registrations for their events
- Ownership enforced in controllers via `event.organizerClerkId === userId`

### Attendee
- No account, no Clerk session
- Visits `/e/[slug]`, submits name + email to register
- Receives transactional emails
- Never accesses the dashboard

---

## 6. End-to-End Flows (Acceptance Criteria)

### Organizer Flow
```
Sign up (Clerk) → /dashboard → Create event from template → Edit → Publish → View in dashboard
```

### Attendee Flow
```
Visit /e/[slug] → Submit registration form (name + email)
  Open mode     → status: registered  → "You're registered" email
  Shortlisted   → status: pending     → "Under review" email
```

### Review Flow
```
Organizer: /dashboard/events/[id]/attendees
→ Search / filter attendees
→ Approve / Reject / Revoke
→ Status updates in DB → correct email sent
```

### Event State Flow
```
Full events      → registration blocked (409)
Closed events    → registration blocked (date passed)
Cancelled events → public page shows cancelled, no registrations
```

---

## 7. Data Models

### User
```typescript
{
  _id: ObjectId
  clerkId: string           // unique — Clerk's userId
  name: string
  email: string
  zoomAccountId?: string    // Extension C
  zoomClientId?: string
  zoomClientSecret?: string
  createdAt: Date
}
```

### Event
```typescript
{
  _id: ObjectId
  organizerClerkId: string  // Clerk userId string — used for ownership checks

  // Required fields
  title: string
  description: string
  dateTime: Date
  venue?: string            // required when isOnline = false
  isOnline: boolean
  capacity: number
  registrationMode: 'open' | 'shortlisted'

  slug: string              // unique, generated once on creation, never changes
  status: 'draft' | 'published' | 'cancelled'
  templateUsed?: string

  // Extension C — Zoom
  zoomMeetingId?: string
  zoomJoinUrl?: string
  zoomSyncStatus?: 'pending' | 'synced' | 'failed' | 'cancelled'

  createdAt: Date
  updatedAt: Date
}
```

### Derived Public Status (computed, never stored)
```typescript
// lib/utils.ts
export function getPublicStatus(event: IEvent, activeCount: number): PublicStatus | null {
  if (event.status === 'draft') return null          // 404 on public page
  if (event.status === 'cancelled') return 'Cancelled'
  if (new Date() > new Date(event.dateTime)) return 'Closed'
  if (activeCount >= event.capacity) return 'Full'
  return 'Open'
}
export type PublicStatus = 'Open' | 'Full' | 'Closed' | 'Cancelled'
```

### Registration
```typescript
{
  _id: ObjectId
  eventId: ObjectId         // ref: Event
  attendeeName: string
  attendeeEmail: string
  status: 'pending' | 'registered' | 'approved' | 'rejected' | 'revoked'
  createdAt: Date
  updatedAt: Date
}
// Indexes:
// { eventId: 1 }
// { eventId: 1, attendeeEmail: 1 }  unique: true  ← prevents duplicate registrations
```

---

## 8. MVC Controllers

### EventController.ts — methods
```
list(userId)
  → find all events where organizerClerkId === userId

create(userId, body)
  → validate required fields
  → generate slug
  → save with status: 'draft'

getById(userId, eventId)
  → find by _id + ownership check

getBySlug(slug)
  → public, no auth
  → compute activeCount + publicStatus
  → return event + publicStatus + zoomJoinUrl (if published + online)

update(userId, eventId, body)
  → ownership check
  → save changes
  → track changedFields
  → triggerHook('event.updated', { event, changedFields })

publish(userId, eventId)
  → ownership check
  → validate all required fields present
  → set status: 'published'
  → triggerHook('event.published', { event, organizer })

cancel(userId, eventId)
  → ownership check
  → set status: 'cancelled'
  → fetch activeRegistrations
  → triggerHook('event.cancelled', { event, organizer, activeRegistrations })

delete(userId, eventId)
  → ownership check
  → only if status === 'draft'
  → hard delete
```

### RegistrationController.ts — methods
```
list(userId, eventId, { search, status })
  → verify event ownership (userId must own the event)
  → build query: eventId + optional status filter + optional name/email regex search
  → return registrations array

create(eventId, body)
  → find event, verify published
  → compute publicStatus → block if not 'Open'
  → check duplicate (same email + eventId)
  → create with correct initial status (registered or pending)
  → triggerHook('registration.created', { registration, event })

updateStatus(userId, registrationId, newStatus)
  → find registration → find event → ownership check
  → validate transition via VALID_TRANSITIONS map
  → if approving: re-check capacity
  → update status
  → triggerHook('registration.{newStatus}', { registration, event })
```

### UserController.ts — methods
```
syncOrGet(clerkId, { name, email })
  → findOneAndUpdate({ clerkId }, upsert: true
  → returns User doc

updateSettings(clerkId, { zoomAccountId, zoomClientId, zoomClientSecret })
  → find by clerkId → update zoom fields
```

---

## 9. RSVP State Machine

### Mode A — Open
```
submit → registered    (instant confirmation)
organizer → revoke     (frees one capacity slot)
```

### Mode B — Shortlisted
```
submit → pending
pending → approved | rejected    (organizer decision)
approved → revoked               (organizer revocation)
```

### Valid transitions (enforced in RegistrationController)
```typescript
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending:    ['approved', 'rejected'],
  approved:   ['revoked'],
  registered: ['revoked'],
  // rejected and revoked are terminal states
}
```

### Capacity rules
- `activeCount = count({ status: { $in: ['registered', 'approved'] } })`
- `pending` does NOT count toward capacity
- Block if `activeCount >= capacity` → 409, reason: 'full'
- Block if `event.dateTime < now` → 409, reason: 'closed'
- Block if `event.status === 'cancelled'` → 409, reason: 'cancelled'
- Block if `event.status === 'draft'` → public page 404s

---

## 10. Slug Generation

```typescript
// lib/utils.ts
export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
  const suffix = Math.random().toString(36).substring(2, 6)
  return `${base}-${suffix}`
}
// "Tech Meetup Bangalore" → "tech-meetup-bangalore-x7k2"
// Generated once. Never updated even if title changes.
```

---

## 11. Event Templates (static config)

Lives in `lib/templates.ts`. Not in DB.

```typescript
export const EVENT_TEMPLATES = [
  {
    id: 'tech-meetup',
    label: 'Tech Meetup',
    icon: '💻',
    description: 'In-person tech community gathering',
    prefill: {
      title: 'Tech Meetup — ',
      description: 'Join us for an evening of tech talks, demos, and networking with fellow developers...',
      isOnline: false,
      registrationMode: 'open',
      capacity: 100,
    }
  },
  {
    id: 'webinar',
    label: 'Webinar',
    icon: '🎙️',
    description: 'Online presentation or panel',
    prefill: {
      title: 'Webinar: ',
      description: 'An interactive online session where our speakers will cover...',
      isOnline: true,
      registrationMode: 'shortlisted',
      capacity: 500,
    }
  },
  {
    id: 'workshop',
    label: 'Workshop',
    icon: '🛠️',
    description: 'Hands-on, small-group learning session',
    prefill: {
      title: 'Workshop: ',
      description: 'A focused hands-on workshop. You will leave with practical skills in...',
      isOnline: false,
      registrationMode: 'shortlisted',
      capacity: 30,
    }
  },
  {
    id: 'networking',
    label: 'Networking Event',
    icon: '🤝',
    description: 'Professional networking and mingling',
    prefill: {
      title: 'Networking Night — ',
      description: 'Connect with professionals in your field over drinks and conversation...',
      isOnline: false,
      registrationMode: 'open',
      capacity: 60,
    }
  }
]
```

---

## 12. Email Notifications

Sent via **Resend + React Email**. Triggered by hooks from `extensions/email/`. Never called directly from controllers or routes.

| Hook event | When | Email |
|---|---|---|
| `registration.created` (open mode) | signup → `registered` | "You're registered for [Event]" |
| `registration.created` (shortlisted) | signup → `pending` | "Your application is under review" |
| `registration.approved` | `pending` → `approved` | "You're in! Approved for [Event]" |
| `registration.rejected` | `pending` → `rejected` | "Update on your [Event] application" |
| `registration.revoked` | any → `revoked` | "Your spot for [Event] has been cancelled" |
| `event.updated` | organizer edits published event | "[Event] details have changed" |
| `event.cancelled` | organizer cancels event | "[Event] has been cancelled" |

Email failures: caught in handler try/catch, logged, never bubble up.

---

## 13. Zoom Integration (Extension C)

**Auth:** Server-to-Server OAuth. Organizer pastes credentials in `/dashboard/settings`. No redirect flow.

### service functions (`extensions/zoom/service.ts`)
```
getAccessToken(organizer)               → POST zoom.us/oauth/token (cache 1hr)
createMeeting(event, organizer)         → POST /v2/users/me/meetings
updateMeeting(meetingId, event, org)    → PATCH /v2/meetings/{id}
deleteMeeting(meetingId, organizer)     → DELETE /v2/meetings/{id}
```

### hook subscriptions (`extensions/zoom/index.ts`)
```
event.published  → isOnline? → createMeeting() → save meetingId + joinUrl + syncStatus
event.updated    → isOnline + meetingId + title/dateTime changed? → updateMeeting()
event.cancelled  → meetingId exists? → deleteMeeting()
```

### failure rule
Event always saves first. Zoom in try/catch. Failure → `zoomSyncStatus: 'failed'`. Never throws to client. Dashboard shows sync badge per event.

---

## 14. Extensibility Architecture

### Hook system (`lib/hooks.ts`)
```typescript
export async function triggerHook<T>(event: string, payload: T) {
  const handlers = registry.get(event) ?? []
  await Promise.allSettled(handlers.map(h => h(payload).catch(console.error)))
}
// Promise.allSettled: one handler failing never breaks others
```

### Hook events
```
registration.created   → { registration, event }
registration.approved  → { registration, event }
registration.rejected  → { registration, event }
registration.revoked   → { registration, event }
event.published        → { event, organizer }
event.updated          → { event, organizer, changedFields: string[] }
event.cancelled        → { event, organizer, activeRegistrations }
```

### Adding a new extension (e.g. HubSpot tomorrow)
1. `extensions/hubspot/index.ts` → `registerHubSpotExtension()` with `onHook(...)` calls
2. One line in `extensions/index.ts` → `registerHubSpotExtension()`
3. Zero changes to routes, controllers, or models

---

## 15. Page Routes

```
/sign-in                            public — Clerk UI
/sign-up                            public — Clerk UI
/e/[slug]                           public — event + registration form + status badge
/dashboard                          organizer — event list
/dashboard/events/new               organizer — template picker + form
/dashboard/events/[id]              organizer — edit event + Zoom sync status
/dashboard/events/[id]/attendees    organizer — attendee table
                                      • search by name or email
                                      • filter by status dropdown
                                      • action buttons per row (conditional on status)
/dashboard/settings                 organizer — Zoom credentials form
```

---

## 16. Environment Variables (.env.example)

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/goavo

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_
CLERK_SECRET_KEY=sk_test_
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Resend
RESEND_API_KEY=re_
RESEND_FROM_EMAIL=GoAvo <no-reply@yourdomain.com>

# Zoom (also stored per-organizer in MongoDB)
ZOOM_ACCOUNT_ID=
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=
```

---

## 17. Out of Scope

- Payment gateway
- Seat maps / ticketing
- Multi-tenant RBAC
- Native mobile app
- Production deployment
- Deep analytics

---

## 18. Bonus Goals

- [ ] Docker Compose for local MongoDB
- [ ] Seed script (`npm run seed`)
- [ ] Audit trail on Registration (log status changes with timestamps)
- [ ] Loading + empty states on all dashboard pages
- [ ] Error boundary components
