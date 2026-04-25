const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

export const ZOOM_REDIRECT_URI = process.env.ZOOM_REDIRECT_URI || `${getBaseUrl()}/api/zoom/callback`
export const ZOOM_OAUTH_SCOPES = process.env.ZOOM_OAUTH_SCOPES || 'meeting:write:meeting'
