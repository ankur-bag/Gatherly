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
  color: '#4b463d',
}

const infoCard = {
  backgroundColor: '#fff5f5',
  padding: '24px',
  borderRadius: '18px',
  margin: '24px 0',
  border: '1px solid #f4caca',
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
