'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Search, Zap, Monitor, Image, Clock, CreditCard, Code2,
  Plus, Minus, MessageCircle, Mail, Users, ArrowRight,
  FileText, ExternalLink,
} from 'lucide-react'

/* ─────────────────── data ─────────────────── */

const topics = [
  {
    icon: Zap,
    label: 'Getting Started',
    description: 'Setup guides, first steps, and onboarding',
    articles: 12,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/20',
  },
  {
    icon: Monitor,
    label: 'Players & Devices',
    description: 'Connect, configure, and troubleshoot displays',
    articles: 18,
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/20',
  },
  {
    icon: Image,
    label: 'Content & Media',
    description: 'Upload, organize, and manage your content',
    articles: 24,
    color: 'text-sky-500',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
  },
  {
    icon: Clock,
    label: 'Scheduling',
    description: 'Timers, playlists, and content rotation',
    articles: 15,
    color: 'text-rose-400',
    bg: 'bg-rose-400/10',
    border: 'border-rose-400/20',
  },
  {
    icon: CreditCard,
    label: 'Billing & Plans',
    description: 'Subscriptions, invoices, and upgrades',
    articles: 9,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
  },
  {
    icon: Code2,
    label: 'API & Integrations',
    description: 'Developer docs, webhooks, and third-party tools',
    articles: 21,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/20',
  },
]

const faqs = [
  { q: 'How do I connect a new screen to my workspace?' },
  { q: 'Can I schedule content for specific dates?' },
  { q: 'What file formats are supported for upload?' },
  { q: 'How do I transfer workspace ownership?' },
  { q: 'Is there a limit on the number of team members?' },
]

const faqAnswers: Record<number, string> = {
  0: 'Go to Players → Add Player, download the app on your device, and enter the pairing code shown on screen.',
  1: 'Yes. In the Schedules section, create a new schedule and set custom start and end dates for any content.',
  2: 'We support MP4, WEBM, MOV, JPG, PNG, GIF, SVG, PDF, and HTML bundles. Max file size is 2 GB.',
  3: 'Navigate to Workspace Settings → Team, click the current owner, and use the Transfer Ownership option.',
  4: 'Team member limits depend on your plan. Free supports 2, Pro supports 10, and Enterprise is unlimited.',
}

const contacts = [
  {
    icon: MessageCircle,
    label: 'Live Chat',
    description: 'Talk to our team in real-time',
    meta: 'Online now',
    metaColor: 'text-emerald-400',
    dot: 'bg-emerald-400',
  },
  {
    icon: Mail,
    label: 'Email Support',
    description: 'We reply within 4 hours',
    meta: 'support@signage.com',
    metaColor: 'text-text-muted',
    dot: null,
  },
  {
    icon: Users,
    label: 'Community',
    description: 'Ask questions, share tips',
    meta: '2.4k members',
    metaColor: 'text-text-muted',
    dot: null,
  },
]

type StatusLevel = 'operational' | 'degraded' | 'outage'

const systemStatus: { label: string; status: StatusLevel }[] = [
  { label: 'API', status: 'operational' },
  { label: 'Dashboard', status: 'operational' },
  { label: 'Player Sync', status: 'operational' },
  { label: 'Media CDN', status: 'degraded' },
  { label: 'Webhooks', status: 'operational' },
]

const statusColor: Record<StatusLevel, string> = {
  operational: 'text-emerald-400',
  degraded: 'text-amber-400',
  outage: 'text-rose-400',
}
const statusDot: Record<StatusLevel, string> = {
  operational: 'bg-emerald-400',
  degraded: 'bg-amber-400',
  outage: 'bg-rose-400',
}

const popularTags = ['connect screen', 'upload media', 'schedule content', 'API keys']

/* ─────────────────── component ─────────────────── */

export default function HelpPage() {
  const [search, setSearch] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const overallStatus = systemStatus.some(s => s.status === 'outage')
    ? 'outage'
    : systemStatus.some(s => s.status === 'degraded')
    ? 'degraded'
    : 'operational'

  const uptimePct = overallStatus === 'operational'
    ? '99.9% uptime'
    : overallStatus === 'degraded'
    ? '97.2% uptime'
    : '< 95% uptime'

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ── */}
      <div className="pt-16 pb-12 px-6 lg:px-8 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-bold tracking-[0.2em] uppercase text-amber-400 mb-3"
        >
          How can we help?
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="text-4xl lg:text-5xl font-extrabold text-text-primary leading-tight mb-4"
        >
          Find answers &amp;{' '}
          <span className="text-text-secondary">get support</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-text-muted max-w-md mx-auto leading-relaxed mb-8"
        >
          Search our knowledge base, browse categories, or reach out to
          our team directly.
        </motion.p>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="relative max-w-2xl mx-auto"
        >
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-text-muted pointer-events-none h-[18px] w-[18px]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search for articles, guides, or topics..."
            className="w-full h-14 pl-12 pr-5 rounded-2xl bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </motion.div>

        {/* Popular tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.18 }}
          className="flex items-center justify-center gap-2 mt-4 flex-wrap"
        >
          <span className="text-xs text-text-muted">Popular:</span>
          {popularTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSearch(tag)}
              className="px-3 py-1 rounded-full text-xs border border-border bg-surface text-text-secondary hover:border-primary/50 hover:text-text-primary transition-colors"
            >
              {tag}
            </button>
          ))}
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 pb-16 space-y-10">

        {/* ── Browse Topics ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-semibold tracking-[0.18em] uppercase text-text-muted">
              Browse Topics
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic, i) => (
              <motion.button
                key={topic.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24 + i * 0.05 }}
                className="group text-left bg-surface border border-border rounded-2xl p-6 hover:border-border-hover transition-all duration-200 hover:shadow-lg hover:shadow-black/10"
              >
                {/* Icon */}
                <div className={cn(
                  'h-12 w-12 rounded-xl border flex items-center justify-center mb-4',
                  topic.bg, topic.border
                )}>
                  <topic.icon className={cn('h-5 w-5', topic.color)} />
                </div>

                <h3 className="text-sm font-bold text-text-primary mb-1 group-hover:text-primary transition-colors">
                  {topic.label}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed mb-4">
                  {topic.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted font-medium">
                    {topic.articles} articles
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── Bottom two-column ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* Left: FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42 }}
            className="bg-surface border border-border rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="text-xs font-semibold text-text-muted tracking-widest uppercase">
                Frequently Asked Questions
              </span>
            </div>

            <div className="space-y-2">
              {faqs.map((item, i) => (
                <div
                  key={i}
                  className="border border-border rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-surface-alt transition-colors gap-4"
                  >
                    <span className="text-sm text-text-primary font-medium leading-snug">
                      {item.q}
                    </span>
                    <div className="shrink-0 h-6 w-6 rounded-md bg-surface-alt border border-border flex items-center justify-center">
                      {openFaq === i
                        ? <Minus className="h-3 w-3 text-text-muted" />
                        : <Plus className="h-3 w-3 text-text-muted" />
                      }
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="px-4 pb-4 text-xs text-text-muted leading-relaxed border-t border-border pt-3">
                          {faqAnswers[i]}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Contact + Status + Docs */}
          <div className="space-y-4">

            {/* Contact Us */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.46 }}
              className="bg-surface border border-border rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-xs font-semibold text-text-muted tracking-widest uppercase">
                  Contact Us
                </span>
              </div>

              <div className="space-y-3">
                {contacts.map((c, i) => (
                  <button
                    key={i}
                    className="w-full flex items-center gap-4 p-3.5 rounded-xl bg-surface-alt border border-border hover:border-border-hover transition-all group"
                  >
                    <div className="h-10 w-10 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0">
                      <c.icon className="h-4.5 w-4.5 text-text-secondary h-[18px] w-[18px]" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary leading-tight">
                        {c.label}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">{c.description}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        {c.dot && (
                          <span className={cn('h-1.5 w-1.5 rounded-full', c.dot)} />
                        )}
                        <span className={cn('text-xs font-medium', c.metaColor)}>
                          {c.meta}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-text-muted shrink-0 group-hover:text-text-primary group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* System Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-surface border border-border rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={cn('h-2 w-2 rounded-full', statusDot[overallStatus])} />
                  <span className="text-xs font-semibold text-text-muted tracking-widest uppercase">
                    System Status
                  </span>
                </div>
                <span className="text-xs text-text-muted font-medium">{uptimePct}</span>
              </div>

              <div className="space-y-2.5">
                {systemStatus.map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary font-medium">{s.label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={cn('h-1.5 w-1.5 rounded-full', statusDot[s.status])} />
                      <span className={cn('text-xs font-medium capitalize', statusColor[s.status])}>
                        {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Documentation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.54 }}
              className="bg-surface border border-border rounded-2xl p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-surface-alt border border-border flex items-center justify-center shrink-0">
                  <FileText className="h-[18px] w-[18px] text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Documentation</p>
                  <p className="text-xs text-text-muted">Full developer docs &amp; API reference</p>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {['Quick Start', 'API Ref', 'Changelog'].map(link => (
                  <button
                    key={link}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-border bg-surface-alt text-xs font-medium text-text-secondary hover:text-text-primary hover:border-border-hover transition-colors"
                  >
                    {link}
                    <ExternalLink className="h-3 w-3" />
                  </button>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  )
}
