import {
  Html,
  Body,
  Head,
  Heading,
  Text,
  Container,
  Preview,
  Section,
  Hr,
} from '@react-email/components'
import * as React from 'react'

interface BaseLayoutProps {
  previewText: string
  title: string
  children: React.ReactNode
  footerText?: string
}

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
          <Section style={topAccent} />

          <Section style={header}>
            <Text style={brandPill}>GATHERLY</Text>
            <Text style={eyebrow}>Event management made easier</Text>
          </Section>

          <Section style={contentBox}>
            <Heading style={heading}>{title}</Heading>
            <Section style={divider} />
            {children}
          </Section>

          <Section style={footer}>
            <Text style={footerContent}>
              {footerText || 'You received this email because you registered for an event on Gatherly.'}
            </Text>
            <Hr style={hr} />
            <Text style={copyright}>© 2026 Gatherly. All rights reserved.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f4efe8',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '24px auto',
  padding: '0 20px 20px',
  width: '640px',
}

const header = {
  padding: '28px 12px 18px',
  textAlign: 'center' as const,
}

const topAccent = {
  height: '8px',
  borderRadius: '999px',
  backgroundColor: '#f97316',
  margin: '8px 0 20px',
}

const brandPill = {
  display: 'inline-block',
  margin: '0 auto 8px',
  padding: '10px 18px',
  borderRadius: '999px',
  backgroundColor: '#1f1a14',
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '800',
  letterSpacing: '0.22em',
}

const eyebrow = {
  margin: '0',
  color: '#8b7763',
  fontSize: '12px',
  fontWeight: '700',
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
  textAlign: 'center' as const,
}

const divider = {
  height: '1px',
  backgroundColor: '#eadfce',
  margin: '0 0 28px',
}

const contentBox = {
  backgroundColor: '#ffffff',
  padding: '36px',
  borderRadius: '28px',
  border: '1px solid #e7ddd0',
  boxShadow: '0 18px 40px rgba(31, 26, 20, 0.08)',
}

const heading = {
  fontSize: '34px',
  lineHeight: '1.1',
  fontWeight: '800',
  color: '#1f1a14',
  textAlign: 'left' as const,
  margin: '0',
  letterSpacing: '-0.03em',
}

const footer = {
  padding: '28px 12px 0',
  textAlign: 'center' as const,
}

const footerContent = {
  fontSize: '13px',
  color: '#85786a',
  lineHeight: '1.6',
}

const hr = {
  borderColor: '#e7ddd0',
  margin: '20px 0 14px',
}

const copyright = {
  fontSize: '10px',
  color: '#a89a8b',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.16em',
}
