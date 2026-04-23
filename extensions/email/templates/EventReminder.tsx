import * as React from 'react'
import BaseLayout from './BaseLayout'
import { Text, Section } from '@react-email/components'

interface EventReminderProps {
  attendeeName: string
  eventTitle: string
  eventDateTime: string
  venueOrJoinUrl: string
  isOnline: boolean
}

export default function EventReminder({
  attendeeName,
  eventTitle,
  eventDateTime,
  venueOrJoinUrl,
  isOnline,
}: EventReminderProps) {
  return (
    <BaseLayout 
      previewText={`Reminder: ${eventTitle} is starting in 24 hours!`}
      title="Upcoming Event Reminder"
    >
      <Text style={text}>
        Hi {attendeeName},
      </Text>
      <Text style={text}>
        This is a friendly reminder that <strong>{eventTitle}</strong> is happening in exactly 24 hours. We can't wait to see you there!
      </Text>
      
      <Section style={infoCard}>
        <Text style={infoLabel}>Event Details</Text>
        <Text style={infoValue}>{eventTitle}</Text>
        
        <Text style={infoLabel}>Date & Time</Text>
        <Text style={infoValue}>{eventDateTime}</Text>
        
        <Text style={infoLabel}>{isOnline ? 'Join Link' : 'Venue'}</Text>
        <Text style={infoValue}>{venueOrJoinUrl || 'TBA'}</Text>
      </Section>

      <Text style={text}>
        If you have any questions or can no longer attend, please feel free to reach out.
      </Text>
    </BaseLayout>
  )
}

const text = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#484848',
}

const infoCard = {
  backgroundColor: '#F8F8F7',
  padding: '24px',
  borderRadius: '16px',
  margin: '24px 0',
}

const infoLabel = {
  fontSize: '10px',
  fontWeight: 'bold',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
  color: '#8A8A8A',
  margin: '0 0 4px',
}

const infoValue = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1A1A1A',
  margin: '0 0 16px',
}
