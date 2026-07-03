
## App Structure

The app follows a thin-route, controller-driven structure. `app/api/**/route.ts` files authenticate with Clerk and delegate to controllers. Controllers own validation, ownership checks, capacity rules, and RSVP transitions. Models are plain Mongoose schemas, and extensions handle side effects such as email and Zoom sync. The `bootstrap()` call at the top of each route registers extensions once per server process.

The main models are `User`, `Event`, and `Registration`. `User` stores Clerk and Zoom credential fields. `Event` stores organizer ownership, event metadata, RSVP mode, and Zoom sync state. `Registration` stores attendee details plus the RSVP status used by the approval flow.

## Zoom Extension Layer

Zoom is implemented as a hook-driven extension layer with OAuth-backed organizer identity.

### Flow

- Connect: `GET /api/zoom/connect`
	- Reads Zoom client credentials from env.
	- Builds authorize URL and redirects to Zoom.
	- Stores state and user cookies for callback validation.
- Callback: `GET /api/zoom/callback`
	- Validates OAuth state cookies.
	- Exchanges code for access + refresh token.
	- Stores token, expiry, and Zoom connection status on `User`.
	- Uses safe account-profile lookup; missing optional profile scopes do not block connection.
- Disconnect: `POST /api/zoom/disconnect`
	- Clears Zoom tokens and resets Zoom connection status.

### Runtime Responsibilities

- `extensions/zoom/service.ts`
	- Access token retrieval and refresh with guard window.
	- Connection status transitions (`connected`, `refreshing`, `expired`, `revoked`, `disconnected`).
	- Zoom API wrapper with consistent error boundaries.
- `extensions/zoom/index.ts`
	- Hook subscriptions for event lifecycle side effects.
	- `event.published`: create Zoom meeting for online events.
	- `event.updated`: patch Zoom meeting or clean up if switched to in-person.
	- `event.cancelled`: end + delete Zoom meeting and clear join metadata.

### UX Guardrails

- Online event launch requires an active Zoom connection.
- The create-event UI surfaces a warning and Settings CTA when organizer Zoom is disconnected.
- Publish button for online events is disabled until Zoom is connected, preventing meeting-link failures at launch time.

### Scope Strategy

- OAuth scopes are provided via `ZOOM_OAUTH_SCOPES` env, with code-level default `meeting:write:meeting`.
- Profile read scopes are treated as optional in callback flow.

## RSVP Logic

Registration mode is part of the event itself. In open mode, new registrations are immediately confirmed; in shortlisted mode, they begin as pending and wait for organizer approval. The registration controller enforces the state machine, so pending can move to confirmed or rejected, confirmed can move to revoked, and revoked or rejected are terminal. Capacity is counted only from confirmed registrations, which means revoked attendees free up space again.

## Email Flow

Email is implemented as an extension layer, not inside routes or models. Controllers fire hooks such as `registration.created`, `registration.approved`, `registration.rejected`, `registration.revoked`, `event.updated`, and `event.cancelled`. The email extension listens to those hooks and renders React Email templates through Nodemailer. Failures are logged and swallowed so a bad email send does not block the organizer action.

Zoom follows the same pattern: event publish, update, and cancellation hooks trigger Zoom meeting creation, patching, and cleanup without coupling the API routes to the Zoom service directly.
