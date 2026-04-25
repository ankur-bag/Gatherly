import * as React from 'react'
import BaseLayout from './BaseLayout'
import { Text, Link, Section, Button } from '@react-email/components'

interface ApprovedProps {
  attendeeName: string
  eventTitle: string
  eventDateTime: string
  zoomJoinUrl?: string
}

export default function Approved({
  attendeeName,
  eventTitle,
  eventDateTime,
  zoomJoinUrl,
}: ApprovedProps) {
  return (
    <BaseLayout
      previewText={`Great news! Approval confirmed for ${eventTitle}`}
      title="Approved"
    >
      <Text style={text}>
        Hi {attendeeName},
      </Text>
      <Text style={text}>
        Great news! Your application for <strong>{eventTitle}</strong> has been approved. We are excited to have you join us.
      </Text>

      <Section style={infoCard}>
        <Text style={infoLabel}>Event Details</Text>
        <Text style={infoValue}>{eventTitle}</Text>
        <Text style={infoLabel}>Date &amp; Time</Text>
        <Text style={infoValue}>{eventDateTime}</Text>

        {zoomJoinUrl && (
          <>
            <Text style={infoLabel}>Join Link</Text>
            <Text style={{ ...infoValue, fontSize: '14px' }}>
              <Link href={zoomJoinUrl} style={linkStyle}>
                {zoomJoinUrl}
              </Link>
            </Text>
          </>
        )}
      </Section>

      {zoomJoinUrl && (
        <Section style={{ textAlign: 'center' as const, margin: '16px 0 24px' }}>
          <Button href={zoomJoinUrl} style={joinButton}>
            Join Zoom Meeting
          </Button>
        </Section>
      )}

      <Text style={text}>
        If you have any questions, feel free to reach out to the event organizer.
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
  backgroundColor: '#fbf8f1',
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

const linkStyle = {
  color: '#c2410c',
  textDecoration: 'none',
}

const joinButton = {
  backgroundColor: '#1f1a14',
  color: '#ffffff',
  padding: '14px 24px',
  borderRadius: '12px',
  fontWeight: '800',
  fontSize: '14px',
  textDecoration: 'none',
  display: 'inline-block',
}
