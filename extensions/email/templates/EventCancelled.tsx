import * as React from 'react'
import BaseLayout from './BaseLayout'
import { Text, Section } from '@react-email/components'

interface EventCancelledProps {
  eventTitle: string
}

export default function EventCancelled({
  eventTitle,
}: EventCancelledProps) {
  return (
    <BaseLayout 
      previewText={`Important: ${eventTitle} has been cancelled`}
      title="Event Cancelled"
    >
      <Text style={text}>
        Hi,
      </Text>
      <Text style={text}>
        We are sorry to inform you that the event <strong>{eventTitle}</strong> has been cancelled by the organizer.
      </Text>
      
      <Section style={infoCard}>
        <Text style={infoLabel}>Status</Text>
        <Text style={{ ...infoValue, color: '#D32F2F' }}>Cancelled</Text>
        <Text style={textSmall}>
          You do not need to take any action. Your registration has been voided.
        </Text>
      </Section>


      <Text style={text}>
        We apologize for any inconvenience caused.
      </Text>
    </BaseLayout>
  )
}

const text = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#4b463d',
}

const textSmall = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#85786a',
}

const infoCard = {
  backgroundColor: '#fff5f5',
  padding: '24px',
  borderRadius: '18px',
  margin: '24px 0',
  borderLeft: '4px solid #ef4444',
  border: '1px solid #fecaca',
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
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1f1a14',
  margin: '0 0 12px',
}

