'use client'

import { useState } from 'react'
import { Button, Input, Label } from '@/components/ui'
import { useAuthStore } from '@/stores/auth-store'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  User, Mail, Building2, MapPin, Phone, Link as LinkIcon,
  Save, Camera, Copy, Calendar, Shield, Lock, CreditCard,
  CheckCircle2, Edit3, Hash,
} from 'lucide-react'

export default function ProfilePage() {
  const { user, account } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  const [formData, setFormData] = useState({
    firstName: user?.given_name || '',
    lastName: user?.family_name || '',
    email: user?.email || '',
    phone: (account as any)?.phone || '',
    company: (account as any)?.company || '',
    location: (account as any)?.location || '',
    website: (account as any)?.website || '',
    bio: (account as any)?.bio || '',
  })

  const userInitials = `${formData.firstName[0] || ''}${formData.lastName[0] || ''}`.toUpperCase() || 'S'
  const accountId = account?.account_id || ''
  const memberSince = account?.created_at ? new Date(account.created_at) : null
  const plan = (account as any)?.plan || 'Free'

  const handleSave = async () => {
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setSaving(false)
    setIsEditing(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(accountId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getMemberSinceText = () => {
    if (!memberSince) return ''
    const diffMs = Date.now() - memberSince.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return '1 day ago'
    return `${diffDays} days ago`
  }

  const stats = [
    { value: 12, label: 'SCREENS' },
    { value: 3, label: 'CHANNELS' },
    { value: 47, label: 'MEDIA' },
    { value: 6, label: 'SCHEDULES' },
  ]

  const securityItems = [
    { label: 'Password', status: 'Strong', ok: true },
    { label: '2FA', status: 'Authenticator', ok: true },
    { label: 'Sessions', status: '3 active', ok: true },
    { label: 'Recovery', status: 'Not set', ok: false },
  ]

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Row: Profile Card + Personal Details */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">

          {/* Left: Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface border border-border rounded-2xl p-6 flex flex-col items-center text-center"
          >
            {/* Avatar */}
            <div className="relative mb-4 group">
              <div className="h-28 w-28 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-4xl font-bold text-black shadow-lg select-none">
                {userInitials}
              </div>
              <div className="absolute bottom-0.5 right-0.5 h-4 w-4 rounded-full bg-success border-2 border-surface" />
              {isEditing && (
                <button className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-7 w-7 text-white" />
                </button>
              )}
            </div>

            {/* Name & Email */}
            <h2 className="text-xl font-bold text-text-primary leading-tight">
              {formData.firstName} {formData.lastName}
            </h2>
            <p className="text-sm text-text-muted mt-1 mb-4 truncate max-w-full px-2">
              {formData.email}
            </p>

            {/* Badges */}
            <div className="flex gap-2 mb-6 flex-wrap justify-center">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-success/15 text-success border border-success/25">
                Active
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-surface-alt text-text-secondary border border-border">
                {plan}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-surface-alt text-text-secondary border border-border">
                Owner
              </span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 w-full mb-6">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-surface-alt rounded-xl p-4 flex flex-col items-center">
                  <span className="text-2xl font-bold text-primary">{stat.value}</span>
                  <span className="text-xs text-text-muted mt-1 tracking-widest font-medium">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* Edit Button */}
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </Button>
          </motion.div>

          {/* Right: Personal Details + Bio */}
          <div className="flex flex-col gap-6">
            {/* Personal Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-surface border border-border rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-xs font-semibold text-text-muted tracking-widest uppercase">
                  Personal Details
                </span>
              </div>

              <div className="space-y-5">
                {/* First Name + Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                      First Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                      <Input
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10"
                        placeholder="First name"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                      Last Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                      <Input
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10"
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                    <Input
                      type="email"
                      value={formData.email}
                      disabled
                      className="pl-10 pr-10 bg-surface-alt opacity-70"
                    />
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                  </div>
                  <p className="text-xs text-text-muted italic">Email cannot be changed</p>
                </div>

                {/* Phone + Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                      Phone
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!isEditing}
                        placeholder="+1 (555) 000-0000"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                      Location
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                      <Input
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        disabled={!isEditing}
                        placeholder="San Francisco, CA"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Company + Website */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                      Company
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                      <Input
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        disabled={!isEditing}
                        placeholder="Acme Inc."
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                      Website
                    </Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                      <Input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        disabled={!isEditing}
                        placeholder="https://example.com"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Bio */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-surface border border-border rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-xs font-semibold text-text-muted tracking-widest uppercase">Bio</span>
              </div>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={!isEditing}
                placeholder="Tell us about yourself..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed resize-none text-sm transition-colors"
              />
            </motion.div>

            {/* Save / Cancel */}
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end gap-3"
              >
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Middle Row: Account ID + Member Since + Plan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Account ID */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-surface border border-border rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Hash className="h-4 w-4 text-text-muted" />
              <span className="text-xs font-semibold text-text-muted tracking-widest uppercase">Account ID</span>
            </div>
            <p className="font-mono text-xs text-text-secondary break-all leading-relaxed mb-4">
              {accountId || 'N/A'}
            </p>
            {accountId && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 text-xs text-text-muted hover:text-text-primary transition-colors border border-border rounded-lg px-3 py-1.5 bg-surface-alt hover:bg-surface-hover"
              >
                <Copy className="h-3.5 w-3.5" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </motion.div>

          {/* Member Since */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface border border-border rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-4 w-4 text-text-muted" />
              <span className="text-xs font-semibold text-text-muted tracking-widest uppercase">Member Since</span>
            </div>
            {memberSince ? (
              <>
                <p className="text-3xl font-bold text-text-primary leading-none">
                  {memberSince.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                <p className="text-sm text-text-muted mt-1 mb-3">
                  {memberSince.getFullYear()}
                </p>
                <span className="text-xs text-success font-medium">{getMemberSinceText()}</span>
              </>
            ) : (
              <p className="text-sm text-text-muted">N/A</p>
            )}
          </motion.div>

          {/* Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-surface border border-border rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-4 w-4 text-text-muted" />
              <span className="text-xs font-semibold text-text-muted tracking-widest uppercase">Plan</span>
            </div>
            <p className="text-3xl font-bold text-text-primary capitalize leading-none mb-1">{plan}</p>
            <p className="text-sm text-text-muted mb-5">3 players · 5GB storage</p>
            <Button size="sm" variant="outline" className="w-full text-xs tracking-widest uppercase font-semibold">
              Upgrade Plan
            </Button>
          </motion.div>
        </div>

        {/* Bottom Row: Status + Security */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-surface border border-border rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <CheckCircle2 className="h-4 w-4 text-text-muted" />
              <span className="text-xs font-semibold text-text-muted tracking-widest uppercase">Status</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-success/15 border border-success/25 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-lg font-bold text-success leading-tight">Active</p>
                <p className="text-xs text-text-muted">All systems running</p>
              </div>
            </div>
            <div className="mt-5 flex gap-1">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex-1 rounded-sm h-2',
                    i < 17 ? 'bg-success/60' : 'bg-warning/50'
                  )}
                />
              ))}
            </div>
            <p className="text-xs text-text-muted mt-2">Activity last 14 days</p>
          </motion.div>

          {/* Security Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-surface border border-border rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-surface-alt border border-border flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5 text-text-secondary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Security Overview</p>
                <p className="text-xs text-text-muted">Password, 2FA, and active sessions</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {securityItems.map((item) => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <div className={cn(
                    'h-2.5 w-2.5 rounded-full shrink-0',
                    item.ok ? 'bg-success' : 'bg-error'
                  )} />
                  <div>
                    <p className="text-xs font-medium text-text-secondary">{item.label}</p>
                    <p className={cn(
                      'text-xs font-medium',
                      item.ok ? 'text-success' : 'text-error'
                    )}>
                      {item.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  )
}
