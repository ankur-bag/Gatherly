import type { IEvent, PublicStatus } from '@/types'
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
  const suffix = Math.random().toString(36).substring(2, 6)
  return `${base}-${suffix}`
}

export function getPublicStatus(event: IEvent, activeCount: number): PublicStatus {
  if (event.status === 'draft') return null
  if (event.status === 'cancelled') return 'Cancelled'
  if (new Date() > new Date(event.dateTime)) return 'Closed'
  if (activeCount >= event.capacity) return 'Full'
  return 'Open'
}

export const EVENT_TEMPLATES = [
  {
    id: 'tech-meetup',
    label: 'Tech Meetup',
    icon: 'code',
    description: 'In-person tech community gathering',
    prefill: {
      title: 'Tech Meetup - ',
      description: 'Join us for an evening of tech talks, demos, and networking with fellow developers...',
      isOnline: false,
      registrationMode: 'open' as const,
      capacity: 100,
    },
  },
  {
    id: 'webinar',
    label: 'Webinar',
    icon: 'video',
    description: 'Online presentation or panel',
    prefill: {
      title: 'Webinar: ',
      description: 'An interactive online session where our speakers will cover...',
      isOnline: true,
      registrationMode: 'shortlisted' as const,
      capacity: 500,
    },
  },
  {
    id: 'workshop',
    label: 'Workshop',
    icon: 'tool',
    description: 'Hands-on, small-group learning session',
    prefill: {
      title: 'Workshop: ',
      description: 'A focused hands-on workshop. You will leave with practical skills in...',
      isOnline: false,
      registrationMode: 'shortlisted' as const,
      capacity: 30,
    },
  },
  {
    id: 'networking',
    label: 'Networking Event',
    icon: 'network',
    description: 'Professional networking and mingling',
    prefill: {
      title: 'Networking Night - ',
      description: 'Connect with professionals in your field over drinks and conversation...',
      isOnline: false,
      registrationMode: 'open' as const,
      capacity: 60,
    },
  },
]
