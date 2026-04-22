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

interface RegistrationConfirmedProps {
  attendeeName: string
  eventTitle: string
  eventDateTime: string
  eventLink: string
}

export default function RegistrationConfirmed({
  attendeeName,
  eventTitle,
  eventDateTime,
  eventLink,
}: RegistrationConfirmedProps) {
  return (
    <Html>
      <Head />
      <Preview>You are registered for {eventTitle}</Preview>
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f9fafb' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
          <Heading style={{ color: '#1f2937', marginBottom: '16px' }}>You are registered!</Heading>
          <Text style={{ color: '#374151', marginBottom: '12px' }}>
            Hi {attendeeName},
          </Text>
          <Text style={{ color: '#374151', marginBottom: '12px' }}>
            Thank you for registering for <strong>{eventTitle}</strong>
          </Text>
          <Text style={{ color: '#374151', marginBottom: '20px' }}>
            Event Date & Time: <strong>{eventDateTime}</strong>
          </Text>
          <Link href={eventLink} style={{ backgroundColor: '#7c3aed', color: '#ffffff', padding: '12px 24px', borderRadius: '4px', textDecoration: 'none', display: 'inline-block' }}>
            View Event
          </Link>
        </Container>
      </Body>
    </Html>
  )
}
