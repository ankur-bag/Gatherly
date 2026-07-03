import { PublicEventPageUI } from '@/components/PublicEventPage/PublicEventPageUI'
import Event from '@/models/Event'
import { dbConnect } from '@/lib/mongodb'
import { Metadata } from 'next'

interface PublicEventRouteProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PublicEventRouteProps): Promise<Metadata> {
  const { id } = await params

  try {
    await dbConnect()
    const event = await Event.findById(id)

    if (!event) {
      return { title: 'Event Not Found | Gatherly' }
    }

    const title = `${event.title} - Gatherly`
    const description = event.description.substring(0, 160).replace(/[#*`]/g, '') + '...'

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'article',
        publishedTime: event.createdAt?.toISOString(),
        authors: ['Gatherly Organizer'],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      }
    }
  } catch {
    return { title: 'Event | Gatherly' }
  }
}

export default async function PublicEventRoute({ params }: PublicEventRouteProps) {
  const { id } = await params

  return <PublicEventPageUI id={id} />
}
