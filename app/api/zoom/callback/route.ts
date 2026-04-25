import { auth, currentUser } from '@clerk/nextjs/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { bootstrap } from '@/lib/bootstrap'
import { ZOOM_REDIRECT_URI } from '@/lib/constants'
import * as UserController from '@/controllers/UserController'
import { completeZoomOAuthConnection } from '@/extensions/zoom/service'

bootstrap()

export async function GET(request: Request) {
  const failRedirect = (message: string) => {
    const target = new URL('/dashboard/settings', request.url)
    target.searchParams.set('zoom', 'failed')
    target.searchParams.set('message', message)
    return NextResponse.redirect(target)
  }

  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const code = url.searchParams.get('code') || ''
    const state = url.searchParams.get('state') || ''
    const error = url.searchParams.get('error') || ''
    const errorDescription = url.searchParams.get('error_description') || ''

    console.log('[Zoom Callback] Code:', code)
    console.log('[Zoom Callback] Redirect URI:', ZOOM_REDIRECT_URI)

    if (error) {
      console.error('[Zoom OAuth Error]', error, errorDescription)
      return failRedirect(errorDescription || error)
    }

    const cookieStore = await cookies()
    const storedState = cookieStore.get('zoom_oauth_state')?.value || ''
    const storedUser = cookieStore.get('zoom_oauth_user')?.value || ''

    console.log('[Zoom Callback] Incoming state:', state)
    console.log('[Zoom Callback] Stored state:', storedState)
    console.log('[Zoom Callback] Stored user:', storedUser)
    console.log('[Zoom Callback] Auth user:', userId)

    if (!storedState || !storedUser || storedState !== state || storedUser !== userId) {
      console.error('[Zoom Callback] Invalid OAuth state payload', {
        hasStoredState: Boolean(storedState),
        hasStoredUser: Boolean(storedUser),
        stateMatches: storedState === state,
        userMatches: storedUser === userId,
      })
      return failRedirect('Invalid Zoom OAuth state. Please try connecting again.')
    }

    cookieStore.delete('zoom_oauth_state')
    cookieStore.delete('zoom_oauth_user')

    if (!code) {
      return failRedirect('Missing OAuth code from Zoom callback.')
    }

    const clerkUser = await currentUser()
    if (clerkUser) {
      const fullName = clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User'
      const email = clerkUser.emailAddresses[0]?.emailAddress || ''
      if (email) {
        await UserController.syncOrGet(userId, { name: fullName, email })
      }
    }

    await completeZoomOAuthConnection(userId, code, ZOOM_REDIRECT_URI)

    const target = new URL('/dashboard/settings', request.url)
    target.searchParams.set('zoom', 'connected')
    return NextResponse.redirect(target)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('GET /api/zoom/callback error:', message, error)
    return failRedirect(message)
  }
}