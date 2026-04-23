import { registerEmailExtension } from '@/extensions/email'
import { registerZoomExtension } from '@/extensions/zoom'

let isBootstrapped = false

export function bootstrap() {
  if (isBootstrapped) return
  isBootstrapped = true

  // Register all extensions here
  // Extensions register hooks when imported
  try {
    // Email extension
    registerEmailExtension()
  } catch (error) {
    console.error('Failed to register email extension:', error)
  }

  try {
    // Zoom extension
    registerZoomExtension()
  } catch (error) {
    console.error('Failed to register zoom extension:', error)
  }
}
