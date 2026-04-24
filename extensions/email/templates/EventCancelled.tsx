import * as React from 'react'
import BaseLayout from './BaseLayout'
import { Text, Section, Link } from '@react-email/components'

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
        We're sorry to inform you that the event <strong>{eventTitle}</strong> has been cancelled by the organizer.
      </Text>
      
      <Section style={infoCard}>
        <Text style={infoLabel}>Status</Text>
        <Text style={{ ...infoValue, color: '#D32F2F' }}>Cancelled</Text>
        <Text style={textSmall}>
          You don't need to take any action. Your registration has been voided.
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
  color: '#484848',
}

const textSmall = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#8A8A8A',
}

const infoCard = {
  backgroundColor: '#D32F2F05',
  padding: '24px',
  borderRadius: '16px',
  margin: '24px 0',
  borderLeft: '4px solid #D32F2F',
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
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1A1A1A',
  margin: '0 0 12px',
}

