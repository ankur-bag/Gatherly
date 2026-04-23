import * as React from 'react'
import BaseLayout from './BaseLayout'
import { Text, Section } from '@react-email/components'

interface RevokedProps {
  attendeeName: string
  eventTitle: string
}

export default function Revoked({
  attendeeName,
  eventTitle,
}: RevokedProps) {
  return (
    <BaseLayout 
      previewText={`Your spot for ${eventTitle} has been cancelled`}
      title="Spot Cancelled"
    >
      <Text style={text}>
        Hi {attendeeName},
      </Text>
      <Text style={text}>
        Your registration for <strong>{eventTitle}</strong> has been cancelled and your spot has been released.
      </Text>
      
      <Section style={infoCard}>
        <Text style={infoLabel}>Event</Text>
        <Text style={infoValue}>{eventTitle}</Text>
        <Text style={infoLabel}>Status</Text>
        <Text style={{ ...infoValue, color: '#D32F2F' }}>Revoked</Text>
      </Section>

      <Text style={text}>
        If you believe this is a mistake, please contact the event organizer directly.
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
