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
        Thank you for your interest in <strong>{eventTitle}</strong>. We have received your registration and it is currently under review by the event organizer.
      </Text>
      
      <Section style={infoCard}>
        <Text style={infoLabel}>Status</Text>
        <Text style={infoValue}>Under Review</Text>
        <Text style={textSmall}>
          We will notify you as soon as a decision is made. Usually, this takes 24-48 hours.
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
  color: '#4b463d',
}

const textSmall = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#85786a',
}

const infoCard = {
  backgroundColor: '#fff8e7',
  padding: '24px',
  borderRadius: '18px',
  margin: '24px 0',
  borderLeft: '4px solid #f59e0b',
  border: '1px solid #f2dfb6',
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
  margin: '0 0 12px',
}
