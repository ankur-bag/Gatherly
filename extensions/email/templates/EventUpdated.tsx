import {
  Html,
  Body,
  Head,
  Heading,
  Text,
  Container,
  Preview,
} from 'react-email'

interface EventUpdatedProps {
  eventTitle: string
  changedFields: string[]
}

export default function EventUpdated({
  eventTitle,
  changedFields,
}: EventUpdatedProps) {
  return (
    <Html>
      <Head />
      <Preview>{eventTitle} details have been updated</Preview>
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f9fafb' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
          <Heading style={{ color: '#1f2937', marginBottom: '16px' }}>Event Updated</Heading>
          <Text style={{ color: '#374151', marginBottom: '12px' }}>
            <strong>{eventTitle}</strong> details have been updated.
          </Text>
          <Text style={{ color: '#374151', marginBottom: '12px' }}>
            The following information has changed:
          </Text>
          <ul style={{ color: '#374151', marginBottom: '12px' }}>
            {changedFields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
          <Text style={{ color: '#6b7280', marginTop: '20px' }}>
            Please review the event details if needed.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
