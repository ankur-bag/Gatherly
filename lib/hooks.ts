import { HookPayload } from '@/types'

type HookEvent = keyof HookPayload
type HookHandler<T extends HookEvent> = (payload: HookPayload[T]) => Promise<void>

const registry = new Map<HookEvent, Set<HookHandler<any>>>()

export function onHook<T extends HookEvent>(event: T, handler: HookHandler<T>) {
  if (!registry.has(event)) {
    registry.set(event, new Set())
  }
  registry.get(event)!.add(handler)
}

export async function triggerHook<T extends HookEvent>(event: T, payload: HookPayload[T]) {
  const handlers = registry.get(event) ?? new Set()
  const results = await Promise.allSettled(
    Array.from(handlers).map((handler) => handler(payload).catch(console.error))
  )
  
  // Log any failures but don't throw
  results.forEach((result) => {
    if (result.status === 'rejected') {
      console.error('Hook handler failed:', result.reason)
    }
  })
}

export function getRegistry() {
  return registry
}
