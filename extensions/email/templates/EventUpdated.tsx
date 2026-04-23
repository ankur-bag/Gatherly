import * as React from 'react'
import BaseLayout from './BaseLayout'
import { Text, Section, Link } from '@react-email/components'

interface EventUpdatedProps {
  eventTitle: string
  changedFields: string[]
}

export default function EventUpdated({
  eventTitle,
  changedFields,
}) {
  return (
    <BaseLayout 
      previewText={`Important updates for ${eventTitle}`}
      title="Event Updated"
    >
      <Text style={text}>
        Hi,
      </Text>
      <Text style={text}>
        There have been some changes to the event <strong>{eventTitle}</strong> that you're registered for.
      </Text>
      
      <Section style={infoCard}>
        <Text style={infoLabel}>Updated Details</Text>
        <ul style={list}>
          {changedFields.map((field) => (
            <li key={field} style={listItem}>
              {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
            </li>
          ))}
        </ul>
      </Section>


      <Text style={text}>
        Please check the event page for the latest information.
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
  backgroundColor: '#FFF4EB',
  padding: '24px',
  borderRadius: '16px',
  margin: '24px 0',
  borderLeft: '4px solid #FF6B00',
}

const infoLabel = {
  fontSize: '10px',
  fontWeight: 'bold',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
  color: '#FF6B00',
  margin: '0 0 12px',
}

const list = {
  margin: '0',
  padding: '0 0 0 20px',
  color: '#1A1A1A',
}

const listItem = {
  fontSize: '16px',
  fontWeight: 'bold',
  marginBottom: '8px',
}

