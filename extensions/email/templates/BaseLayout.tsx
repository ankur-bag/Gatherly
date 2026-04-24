import {
  Html,
  Body,
  Head,
  Heading,
  Text,
  Container,
  Preview,
  Section,
  Row,
  Column,
  Img,
  Hr,
} from '@react-email/components'
import * as React from 'react'

interface BaseLayoutProps {
  previewText: string
  title: string
  children: React.ReactNode
  footerText?: string
}

const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')

export default function BaseLayout({
  previewText,
  title,
  children,
  footerText,
}: BaseLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Row style={logoRow}>
              <Column style={logoColumn}>
                <Img src={`${BASE_URL}/avento-mail.jpg`} alt="Avento logo" width={140} height={48} style={logoImage} />
              </Column>
            </Row>
          </Section>
          
          <Section style={contentBox}>
             <Heading style={heading}>{title}</Heading>
             {children}
          </Section>

          <Section style={footer}>
            <Text style={footerContent}>
              {footerText || "You received this email because you registered for an event on Avento."}
            </Text>
            <Hr style={hr} />
            <Text style={copyright}>
              © 2026 Avento. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#F8F8F7',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '40px auto',
  padding: '0 20px',
  width: '580px',
}

const header = {
  padding: '30px 0',
  textAlign: 'center' as const,
}

const logoRow = {
  margin: '0 auto',
  width: 'fit-content',
}

const logoColumn = {
  textAlign: 'center' as const,
}

const logoImage = {
  display: 'block',
  margin: '0 auto',
}

const logo = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1A1A1A',
  letterSpacing: '0.2em',
  margin: '0',
}

const contentBox = {
  backgroundColor: '#ffffff',
  padding: '40px',
  borderRadius: '24px',
  border: '1px solid #E5E5E5',
}

const heading = {
  fontSize: '32px',
  lineHeight: '1.2',
  fontWeight: 'bold',
  color: '#1A1A1A',
  textAlign: 'left' as const,
  margin: '0 0 30px',
  letterSpacing: '-0.02em',
}

const footer = {
  padding: '40px 0',
  textAlign: 'center' as const,
}

const footerContent = {
  fontSize: '12px',
  color: '#8A8A8A',
  lineHeight: '1.6',
}

const hr = {
  borderColor: '#E5E5E5',
  margin: '20px 0',
}

const copyright = {
  fontSize: '10px',
  color: '#B0B0B0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
}
