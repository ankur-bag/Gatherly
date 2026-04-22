import {
  Html,
  Body,
  Head,
  Heading,
  Text,
  Link,
  Container,
  Preview,
} from 'react-email'

interface ApprovedProps {
  attendeeName: string
  eventTitle: string
  eventDateTime: string
  eventLink: string
}

export default function Approved({
  attendeeName,
  eventTitle,
  eventDateTime,
  eventLink,
}: ApprovedProps) {
  return (
    <Html>
      <Head />
      <Preview>You are approved for {eventTitle}</Preview>
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f9fafb' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
          <Heading style={{ color: '#059669', marginBottom: '16px' }}>You are approved!</Heading>
          <Text style={{ color: '#374151', marginBottom: '12px' }}>
            Hi {attendeeName},
          </Text>
          <Text style={{ color: '#374151', marginBottom: '12px' }}>
            Great news! Your application for <strong>{eventTitle}</strong> has been approved.
          </Text>
          <Text style={{ color: '#374151', marginBottom: '20px' }}>
            Event Date & Time: <strong>{eventDateTime}</strong>
          </Text>
          <Link href={eventLink} style={{ backgroundColor: '#059669', color: '#ffffff', padding: '12px 24px', borderRadius: '4px', textDecoration: 'none', display: 'inline-block' }}>
            View Event
          </Link>
        </Container>
      </Body>
    </Html>
  )
}
