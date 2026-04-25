import * as React from 'react'
import BaseLayout from './BaseLayout'
import { Text, Section } from '@react-email/components'

interface EventUpdatedProps {
  eventTitle: string
  changedFields: string[]
}

export default function EventUpdated({
  eventTitle,
  changedFields,
}: EventUpdatedProps) {
  return (
    <BaseLayout 
      previewText={`Important updates for ${eventTitle}`}
      title="Event Updated"
    >
      <Text style={text}>
        Hi,
      </Text>
      <Text style={text}>
        There have been some changes to the event <strong>{eventTitle}</strong> that you are registered for.
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
  color: '#4b463d',
}

const infoCard = {
  backgroundColor: '#fff7ed',
  padding: '24px',
  borderRadius: '18px',
  margin: '24px 0',
  borderLeft: '4px solid #f97316',
  border: '1px solid #fed7aa',
  boxShadow: '0 8px 24px rgba(31, 26, 20, 0.04)',
}

const infoLabel = {
  fontSize: '10px',
  fontWeight: 'bold',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
  color: '#f97316',
  margin: '0 0 12px',
}

const list = {
  margin: '0',
  padding: '0 0 0 20px',
  color: '#1f1a14',
}

const listItem = {
  fontSize: '16px',
  fontWeight: '600',
  marginBottom: '8px',
}

