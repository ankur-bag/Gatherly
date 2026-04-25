import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { bootstrap } from '@/lib/bootstrap'
import { ZOOM_OAUTH_SCOPES, ZOOM_REDIRECT_URI } from '@/lib/constants'

bootstrap()

export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clientId = process.env.ZOOM_CLIENT_ID || ''
    const clientSecret = process.env.ZOOM_CLIENT_SECRET || ''
    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'Zoom OAuth credentials are missing' }, { status: 400 })
    }

    const origin = new URL(request.url).origin
    const redirectUri = process.env.ZOOM_REDIRECT_URI || `${origin}/api/zoom/callback`

    console.log('[Zoom Connect] Redirect URI:', redirectUri)
    if (ZOOM_OAUTH_SCOPES) {
      console.log('[Zoom Connect] Requested scopes:', ZOOM_OAUTH_SCOPES)
    } else {
      console.log('[Zoom Connect] Requested scopes: using app defaults from Zoom portal')
    }

    const state = crypto.randomUUID()
    console.log('[Zoom Connect] Generated state:', state)

    const authorizeUrl = new URL('https://zoom.us/oauth/authorize')
    authorizeUrl.searchParams.set('response_type', 'code')
    authorizeUrl.searchParams.set('client_id', clientId)
    authorizeUrl.searchParams.set('redirect_uri', redirectUri)
    authorizeUrl.searchParams.set('state', state)
    if (ZOOM_OAUTH_SCOPES) {
      authorizeUrl.searchParams.set('scope', ZOOM_OAUTH_SCOPES)
    }
    authorizeUrl.searchParams.set('prompt', 'consent')

    const response = NextResponse.redirect(authorizeUrl)
    response.cookies.set('zoom_oauth_state', state, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 10 * 60,
    })
    response.cookies.set('zoom_oauth_user', userId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 10 * 60,
    })
    return response
  } catch (error) {
    console.error('GET /api/zoom/connect error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}