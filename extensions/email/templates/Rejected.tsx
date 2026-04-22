import {
  Html,
  Body,
  Head,
  Heading,
  Text,
  Container,
  Preview,
} from 'react-email'

interface RejectedProps {
  attendeeName: string
  eventTitle: string
}

export default function Rejected({
  attendeeName,
  eventTitle,
}: RejectedProps) {
  return (
    <Html>
      <Head />
      <Preview>Update on your {eventTitle} application</Preview>
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f9fafb' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
          <Heading style={{ color: '#dc2626', marginBottom: '16px' }}>Application Decision</Heading>
          <Text style={{ color: '#374151', marginBottom: '12px' }}>
            Hi {attendeeName},
          </Text>
          <Text style={{ color: '#374151', marginBottom: '12px' }}>
            Thank you for applying to <strong>{eventTitle}</strong>.
          </Text>
          <Text style={{ color: '#374151', marginBottom: '12px' }}>
            Unfortunately, we are unable to accept your application at this time. We appreciate your interest and hope to see you at future events.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
