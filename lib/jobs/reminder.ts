import Event from '@/models/Event'
import { triggerHook } from '@/lib/hooks'

export async function runReminderJob() {
  const now = new Date()

  const lower = new Date(now.getTime() + 23 * 60 * 60 * 1000)
  const upper = new Date(now.getTime() + 25 * 60 * 60 * 1000)

  const events = await Event.find({
    status: 'published',
    reminderSentAt: { $exists: false },
    dateTime: { $gte: lower, $lte: upper }
  })

  for (const event of events) {
    // Atomic lock to prevent duplicate processing
    const locked = await Event.findOneAndUpdate(
      {
        _id: event._id,
        reminderSentAt: { $exists: false }
      },
      {
        reminderSentAt: new Date()
      }
    )

    if (!locked) continue

    await triggerHook('event.reminder', {
      eventId: event._id
    })
  }
}
