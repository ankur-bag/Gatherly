# GoAvo Mini-Avento

GoAvo Mini is a Next.js event management app for organizers who publish events, manage RSVPs, and sync online events with Zoom.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Clerk for authentication and route protection
- MongoDB with Mongoose
- Resend and React Email for transactional email
- Zoom Server-to-Server OAuth for meeting sync

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file and set the required variables.

3. Start the development server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

## Environment Variables

Required variables:

- `MONGODB_URI`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `ZOOM_ACCOUNT_ID`
- `ZOOM_CLIENT_ID`
- `ZOOM_CLIENT_SECRET`

Optional but useful:

- `NEXT_PUBLIC_BASE_URL` for email template links and previews

## Assumptions and Tradeoffs

- Auth is handled by Clerk sessions, not custom JWTs or NextAuth.
- Event ownership is enforced in controllers using `organizerClerkId`, so organizers only access their own data.
- Public event URLs are ID-based at `/events/[id]` to keep links stable around the stored MongoDB ObjectId.
- Business side effects are pushed into hooks and extensions so routes stay thin and controllers own the core logic.
- Zoom credentials can come from organizer settings or environment variables; failures are captured in `zoomSyncStatus` and `zoomError` instead of breaking the request.
- Email delivery uses Resend. If delivery fails, the app logs the error and continues.

## Feature Checklist

01. Auth - implemented
- Organizer sign-up/login uses Clerk.
- Protected routes and API endpoints check Clerk auth.
- Organizers only access their own events.

02. Event Creation - implemented
- Events can be created from scratch or from a template.
- Required fields are validated in the event controller.

03. Templates - implemented
- Four predefined templates exist: Tech Meetup, Webinar, Workshop, and Networking Event.
- Templates prefill event fields and remain editable after selection.

04. Public Event Page - mostly implemented
- Published events have a shareable public URL at `/events/[id]`.
- The public page shows event details, registration, and live Open / Full / Closed state.
- Cancelled-state handling exists in the UI layer, but the public event API still returns only published events, so the cancelled public path is not fully wired end to end.

05. RSVP System - implemented
- Open registration sends attendees straight to confirmed status until capacity is reached.
- Shortlisted registration uses pending review and manual organizer approval.

06. Attendee Dashboard - implemented
- Organizers can view registrations per event.
- Search, filtering, approve, reject, revoke, and bulk actions are supported.

07. Email Notifications - implemented
- Resend sends transactional emails for registration received, approved, rejected, revoked, event updated, and event cancelled.
- Extension failures are caught and logged so they do not break the client request.

08. Capacity Rules - implemented
- New registrations are blocked when an event is full, cancelled, or past its date.
- Revoked attendees no longer count against capacity.

## Run Commands

```bash
npm run dev
npm run build
npm run lint
```
