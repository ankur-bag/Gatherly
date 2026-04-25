import { HomePageUI } from '@/components/HomePage/HomePageUI'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Avento — Scale Your Events with Precision',
  description: 'Manage registrations, automate attendee approvals, and seamlessly sync with Zoom. Avento provides industrial-grade solutions for your event organizer dashboard.',
  keywords: ['event management', 'zoom integration', 'rsvp system', 'online events', 'conference management', 'meetup organizer'],
  openGraph: {
    title: 'Avento — High-Fidelity Event Management',
    description: 'The operational command center for event organizers. Scale your reach and manage logistics with clinical clarity.',
    url: 'https://goavo-avento.vercel.app',
    siteName: 'Avento',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: "https://i.postimg.cc/NF2GtxMM/avento.jpg",
        width: 1200,
        height: 630,
        alt: "Avento - High-Fidelity Event Management"
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Avento — Scale Your Events with Precision',
    description: 'Industrial-grade solutions for event organizers. From RSVP to Zoom sync.',
    images: ['https://i.postimg.cc/NF2GtxMM/avento.jpg'],
  },
}

export default function LandingPage() {
  return <HomePageUI />
}