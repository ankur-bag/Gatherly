import * as React from 'react'
import BaseLayout from './BaseLayout'
import { Text, Section } from '@react-email/components'

interface RejectedProps {
  attendeeName: string
  eventTitle: string
}

export default function Rejected({
  attendeeName,
  eventTitle,
}: RejectedProps) {
  return (
    <BaseLayout 
      previewText={`Update regarding your registration for ${eventTitle}`}
      title="Registration Update"
    >
      <Text style={text}>
        Hi {attendeeName},
      </Text>
      <Text style={text}>
        Thank you for your interest in <strong>{eventTitle}</strong>. Unfortunately, we are unable to accept your registration at this time.
      </Text>
      
      <Section style={infoCard}>
        <Text style={infoLabel}>Event</Text>
        <Text style={infoValue}>{eventTitle}</Text>
        <Text style={infoLabel}>Status</Text>
        <Text style={{ ...infoValue, color: '#D32F2F' }}>Declined</Text>
      </Section>

      <Text style={text}>
        We appreciate your interest and hope to see you at future events.
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
