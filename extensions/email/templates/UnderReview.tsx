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

interface UnderReviewProps {
  attendeeName: string
  eventTitle: string
}

export default function UnderReview({
  attendeeName,
  eventTitle,
}: UnderReviewProps) {
  return (
    <Html>
      <Head />
      <Preview>Your application for {eventTitle} is under review</Preview>
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f9fafb' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
          <Heading style={{ color: '#1f2937', marginBottom: '16px' }}>Application Received</Heading>
          <Text style={{ color: '#374151', marginBottom: '12px' }}>
            Hi {attendeeName},
          </Text>
          <Text style={{ color: '#374151', marginBottom: '12px' }}>
            Thank you for applying to <strong>{eventTitle}</strong>
          </Text>
          <Text style={{ color: '#374151', marginBottom: '12px' }}>
            Your application is currently under review. We will notify you soon with the organizer's decision.
          </Text>
          <Text style={{ color: '#6b7280', marginTop: '20px' }}>
            You will receive another email once a decision has been made.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
