import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicApiRoute = createRouteMatcher([
  '/api/events/slug/(.*)',
  '/api/events/(.*)/registrations',
])

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/events(.*)',
  '/api/registrations(.*)',
  '/api/users(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isPublicApiRoute(req)) return
  
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}