'use client'

import { EVENT_TEMPLATES } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FiArrowRight, FiCode, FiVideo, FiTool, FiUsers, FiPlus, FiArrowLeft } from 'react-icons/fi'

export function EventTemplateSelector() {
  const router = useRouter()
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const handleSelect = (templateId: string) => {
    router.push(`/dashboard/events/new?template=${templateId}`)
  }

  const handleScratch = () => {
    router.push('/dashboard/events/new')
  }

  const iconMap: Record<string, React.ReactNode> = {
    code: <FiCode size={40} />,
    video: <FiVideo size={40} />,
    tool: <FiTool size={40} />,
    network: <FiUsers size={40} />,
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream via-white to-beige/30 p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-charcoal/60 hover:text-charcoal transition-colors mb-8 group"
        >
          <FiArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="text-center mb-12 animate-reveal">
          <h1 className="text-4xl md:text-5xl font-display text-charcoal mb-3 leading-tight">
            Create Your Event
          </h1>
          <p className="text-lg text-charcoal/60 font-medium max-w-xl mx-auto">
            Start from scratch or choose a template to get up and running in seconds.
          </p>
        </div>

        {/* Scratch Option - Featured */}
        <div className="mb-12 animate-reveal">
          <button
            onClick={handleScratch}
            className="w-full group relative overflow-hidden rounded-2xl p-6 md:p-8 transition-all duration-300 border-2 border-beige bg-gradient-to-br from-beige/50 to-white hover:border-orange hover:shadow-lg hover:shadow-orange/20 cursor-pointer"
          >
            {/* Background accent */}
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl bg-orange/10 transition-all duration-300 group-hover:bg-orange/20" />

            {/* Content */}
            <div className="relative z-10 flex items-center gap-6">
              <div className="flex-shrink-0 p-3 rounded-xl bg-beige/40 group-hover:bg-orange/20 transition-all duration-300">
                <FiPlus size={32} className="text-charcoal group-hover:text-orange transition-colors" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-2xl font-display text-charcoal mb-1 group-hover:text-orange transition-colors">
                  Start from Scratch
                </h3>
                <p className="text-charcoal/60 font-medium">
                  Full control: customize every detail of your event
                </p>
              </div>
              <FiArrowRight
                size={24}
                className="flex-shrink-0 text-charcoal/40 group-hover:text-orange transition-all group-hover:translate-x-1"
              />
            </div>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px bg-charcoal/10" />
          <span className="text-xs font-bold uppercase tracking-widest text-charcoal/30">Or choose a template</span>
          <div className="flex-1 h-px bg-charcoal/10" />
        </div>

        {/* Template Grid - Smaller cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {EVENT_TEMPLATES.map((template, idx) => (
            <div
              key={template.id}
              className="group relative animate-reveal"
              style={{ animationDelay: `${(idx + 1) * 100}ms` }}
            >
              <button
                onClick={() => handleSelect(template.id)}
                onMouseEnter={() => setHoveredId(template.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="w-full h-full text-left cursor-pointer"
              >
                <div
                  className={`relative overflow-hidden rounded-xl p-5 transition-all duration-300 h-full flex flex-col justify-between border-2 ${
                    hoveredId === template.id
                      ? 'border-orange bg-orange/5 shadow-lg shadow-orange/20 -translate-y-1'
                      : 'border-charcoal/8 bg-white shadow-sm hover:border-orange/30 hover:shadow-md'
                  }`}
                >
                  {/* Background accent */}
                  <div
                    className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl transition-all duration-300 ${
                      hoveredId === template.id ? 'bg-orange/15' : 'bg-beige/30'
                    }`}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div
                      className={`mb-3 p-2.5 w-fit rounded-lg transition-all duration-300 ${
                        hoveredId === template.id
                          ? 'bg-orange/20 text-orange'
                          : 'bg-beige/40 text-charcoal'
                      }`}
                    >
                      {iconMap[template.icon] || <FiCode size={40} />}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-display text-charcoal mb-1 group-hover:text-orange transition-colors line-clamp-2">
                      {template.label}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-charcoal/60 font-medium leading-tight line-clamp-2 mb-4">
                      {template.description}
                    </p>

                    {/* Template specs - more compact */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-charcoal/50">
                        <span className="inline-block w-1 h-1 rounded-full bg-orange" />
                        <span className="truncate">
                          {template.prefill?.isOnline ? 'Online' : 'In-person'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-charcoal/50">
                        <span className="inline-block w-1 h-1 rounded-full bg-orange" />
                        <span className="truncate">
                          {template.prefill?.capacity} capacity
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="relative z-10 mt-4 pt-3 border-t border-charcoal/5 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-orange opacity-0 group-hover:opacity-100 transition-opacity">
                      Select
                    </span>
                    <FiArrowRight
                      size={16}
                      className={`transition-all duration-300 ${
                        hoveredId === template.id ? 'translate-x-1 opacity-100' : 'opacity-60'
                      }`}
                    />
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-charcoal/50 font-medium">
          You can edit all fields while creating your event
        </div>
      </div>
    </div>
  )
}
