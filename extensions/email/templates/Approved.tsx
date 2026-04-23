import * as React from 'react'
import BaseLayout from './BaseLayout'
import { Text, Link, Section } from '@react-email/components'

interface ApprovedProps {
  attendeeName: string
  eventTitle: string
  eventDateTime: string
}

export default function Approved({
  attendeeName,
  eventTitle,
  eventDateTime,
}) {
  return (
    <BaseLayout 
      previewText={`Great news! You are approved for ${eventTitle}`}
      title="You're Approved!"
    >
      <Text style={text}>
        Hi {attendeeName},
      </Text>
      <Text style={text}>
        Great news! Your application for <strong>{eventTitle}</strong> has been approved. We're excited to have you join us.
      </Text>
      
      <Section style={infoCard}>
        <Text style={infoLabel}>Event Details</Text>
        <Text style={infoValue}>{eventTitle}</Text>
        <Text style={infoLabel}>Date & Time</Text>
        <Text style={infoValue}>{eventDateTime}</Text>
      </Section>


      <Text style={text}>
        If you have any questions, feel free to reach out to the event organizer.
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

