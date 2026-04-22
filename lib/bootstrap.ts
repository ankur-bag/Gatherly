let isBootstrapped = false

export function bootstrap() {
  if (isBootstrapped) return
  isBootstrapped = true

  // Register all extensions here
  // Extensions register hooks when imported
  try {
    // Email extension
    require('@/extensions/email').registerEmailExtension()
  } catch (error) {
    console.error('Failed to register email extension:', error)
  }

  try {
    // Zoom extension
    require('@/extensions/zoom').registerZoomExtension()
  } catch (error) {
    console.error('Failed to register zoom extension:', error)
  }
}
