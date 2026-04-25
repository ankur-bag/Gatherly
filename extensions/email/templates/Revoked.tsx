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
  color: '#4b463d',
}

const infoCard = {
  backgroundColor: '#f8f7f4',
  padding: '24px',
  borderRadius: '18px',
  margin: '24px 0',
  border: '1px solid #e7ddd0',
  boxShadow: '0 8px 24px rgba(31, 26, 20, 0.04)',
}

const infoLabel = {
  fontSize: '10px',
  fontWeight: 'bold',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
  color: '#9a8f80',
  margin: '0 0 4px',
}

const infoValue = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1f1a14',
  margin: '0 0 16px',
}
