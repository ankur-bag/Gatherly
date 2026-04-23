import * as React from 'react'
import BaseLayout from './BaseLayout'
import { Text, Section } from '@react-email/components'

interface UnderReviewProps {
  attendeeName: string
  eventTitle: string
}

export default function UnderReview({
  attendeeName,
  eventTitle,
}: UnderReviewProps) {
  return (
    <BaseLayout 
      previewText={`Your application for ${eventTitle} is being reviewed`}
      title="Application Received"
    >
      <Text style={text}>
        Hi {attendeeName},
      </Text>
      <Text style={text}>
        Thank you for your interest in <strong>{eventTitle}</strong>. We've received your registration and it's currently under review by the event organizer.
      </Text>
      
      <Section style={infoCard}>
        <Text style={infoLabel}>Status</Text>
        <Text style={infoValue}>Under Review</Text>
        <Text style={textSmall}>
          We'll notify you as soon as a decision is made. Usually, this takes 24-48 hours.
        </Text>
      </Section>

      <Text style={text}>
        No further action is required from your side at this time.
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
  backgroundColor: '#F8F8F7',
  padding: '24px',
  borderRadius: '16px',
  margin: '24px 0',
  borderLeft: '4px solid #CCA000',
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
  margin: '0 0 12px',
}
