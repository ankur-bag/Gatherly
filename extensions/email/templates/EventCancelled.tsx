import {
  Html,
  Body,
  Head,
  Heading,
  Text,
  Container,
  Preview,
} from 'react-email'

interface EventCancelledProps {
  eventTitle: string
}

export default function EventCancelled({
  eventTitle,
}: EventCancelledProps) {
  return (
    <Html>
      <Head />
      <Preview>{eventTitle} has been cancelled</Preview>
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f9fafb' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
          <Heading style={{ color: '#dc2626', marginBottom: '16px' }}>Event Cancelled</Heading>
          <Text style={{ color: '#374151', marginBottom: '12px' }}>
            <strong>{eventTitle}</strong> has been cancelled by the organizer.
          </Text>
          <Text style={{ color: '#374151', marginBottom: '12px' }}>
            We apologize for any inconvenience this may cause.
          </Text>
          <Text style={{ color: '#6b7280', marginTop: '20px' }}>
            If you have any questions, please contact the event organizer.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
