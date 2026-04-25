# GoAvo Mini-Avento

<p align="center">
  <img src="https://i.postimg.cc/Ssm246y8/Whats-App-Image-2026-04-25-at-6-35-55-PM.jpg" width="100%" />
</p>

 Live Website: https://goavo-avento.vercel.app/

Avento is a full-stack event management platform built with Next.js that enables organizers to create events, manage RSVPs, and seamlessly sync online events with Zoom.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Clerk for authentication and route protection
- MongoDB with Mongoose
- Resend and React Email for transactional email
- Zoom User OAuth + extension hooks for meeting sync

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
- `ZOOM_CLIENT_ID`
- `ZOOM_CLIENT_SECRET`

Optional but useful:

- `NEXT_PUBLIC_BASE_URL` for email template links and previews
- `ZOOM_REDIRECT_URI` (default: `http://localhost:3000/api/zoom/callback`)
- `ZOOM_OAUTH_SCOPES` (default in code: `meeting:write:meeting`)

## Assumptions and Tradeoffs

- Auth is handled by Clerk sessions, not custom JWTs or NextAuth.
- Event ownership is enforced in controllers using `organizerClerkId`, so organizers only access their own data.
- Public event URLs are ID-based at `/events/[id]` to keep links stable around the stored MongoDB ObjectId.
- Business side effects are pushed into hooks and extensions so routes stay thin and controllers own the core logic.
- Zoom connect/disconnect is managed through OAuth routes, and token lifecycle is handled in the Zoom service layer.
- Online event launch is guarded in the create UI: organizers must connect Zoom first before publishing online events.
- Zoom failures are captured in `zoomSyncStatus` and `zoomError` instead of breaking organizer workflows.
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

09. Zoom Integration Layer - implemented
- Organizer OAuth connect flow is available at `/api/zoom/connect` and callback handling is done at `/api/zoom/callback`.
- Zoom extension subscribes to event hooks to create, update, end, and delete meetings.
- If Zoom account profile scopes are missing, account detail lookup is skipped safely and connection still succeeds.
- Online events require a connected Zoom account before launch from the create page.

## Zoom Extension Layer

Zoom is implemented as an extension, not as route-level business logic.

- Routes:
	- `/api/zoom/connect` builds OAuth authorize URL, sets CSRF/state cookies, and redirects to Zoom consent.
	- `/api/zoom/callback` validates state, exchanges code for tokens, and stores token metadata on the organizer user.
	- `/api/zoom/disconnect` clears Zoom connection state.
- Service (`extensions/zoom/service.ts`):
	- Handles token exchange and refresh.
	- Automatically refreshes access tokens before Zoom API calls.
	- Marks disconnected/revoked/expired states and prevents unsafe retries.
	- Uses a safe account-details lookup so missing optional scopes do not fail OAuth completion.
- Extension (`extensions/zoom/index.ts`):
	- `event.published` -> create meeting for online events.
	- `event.updated` -> patch meeting details or delete when switched to in-person.
	- `event.cancelled` -> end and delete meeting, then clear join metadata.

This keeps API routes thin and keeps Zoom side effects isolated from core event CRUD logic.

## Run Commands

```bash
npm run dev
npm run build
npm run lint
```
