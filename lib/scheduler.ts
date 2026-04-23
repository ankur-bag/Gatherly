import cron from 'node-cron'
import { runReminderJob } from './jobs/reminder'

let started = false

export function startScheduler() {
  if (started) return
  started = true

  console.log('[Scheduler] Started')

  cron.schedule('0 * * * *', async () => {
    console.log('[Scheduler] Running reminder job...')
    await runReminderJob()
  })
}
