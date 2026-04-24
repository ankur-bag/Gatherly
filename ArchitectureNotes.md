
## App Structure

The app follows a thin-route, controller-driven structure. `app/api/**/route.ts` files authenticate with Clerk and delegate to controllers. Controllers own validation, ownership checks, capacity rules, and RSVP transitions. Models are plain Mongoose schemas, and extensions handle side effects such as email and Zoom sync. The `bootstrap()` call at the top of each route registers extensions once per server process.

The main models are `User`, `Event`, and `Registration`. `User` stores Clerk and Zoom credential fields. `Event` stores organizer ownership, event metadata, RSVP mode, and Zoom sync state. `Registration` stores attendee details plus the RSVP status used by the approval flow.

## RSVP Logic

Registration mode is part of the event itself. In open mode, new registrations are immediately confirmed; in shortlisted mode, they begin as pending and wait for organizer approval. The registration controller enforces the state machine, so pending can move to confirmed or rejected, confirmed can move to revoked, and revoked or rejected are terminal. Capacity is counted only from confirmed registrations, which means revoked attendees free up space again.

## Email Flow

Email is implemented as an extension layer, not inside routes or models. Controllers fire hooks such as `registration.created`, `registration.approved`, `registration.rejected`, `registration.revoked`, `event.updated`, and `event.cancelled`. The email extension listens to those hooks and renders React Email templates through Resend. Failures are logged and swallowed so a bad email send does not block the organizer action.

Zoom follows the same pattern: event publish, update, and cancellation hooks trigger Zoom meeting creation, patching, and cleanup without coupling the API routes to the Zoom service directly.
