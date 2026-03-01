'use client'

import { useState, useEffect } from 'react'
import {
  User, Lock, Bell, CreditCard, Users,
  Building2, AlertTriangle, CheckCircle2, Key, Shield,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useBreadcrumb } from '@/contexts/breadcrumb-context'

// ── Design tokens ──────────────────────────────────────────────────────────────
const INPUT_STYLE = {
  backgroundColor: '#111827',
  border: '1px solid #1F2937',
  color: '#FFFFFF',
  borderRadius: 8,
  height: 40,
  padding: '0 12px',
  fontSize: 14,
  width: '100%',
  outline: 'none',
}
const INPUT_READONLY_STYLE = {
  ...INPUT_STYLE,
  color: '#4B5563',
  cursor: 'default',
}
const LABEL_STYLE = { color: '#6B7280', fontSize: 12, marginBottom: 4, display: 'block' as const }
const SECTION_CARD = {
  backgroundColor: '#1C1C1C',
  border: '1px solid #2A2A2A',
  borderRadius: 12,
  padding: '20px 24px',
  marginBottom: 16,
}

// ── Sidebar nav items ─────────────────────────────────────────────────────────
const NAV = [
  { key: 'profile',       label: 'Profile',       Icon: User },
  { key: 'security',      label: 'Security',      Icon: Lock },
  { key: 'notifications', label: 'Notifications', Icon: Bell },
  { key: 'billing',       label: 'Billing',       Icon: CreditCard },
  { key: 'team',          label: 'Team',          Icon: Users },
] as const
type NavKey = typeof NAV[number]['key']

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ Icon, title, subtitle, danger = false }: {
  Icon: any; title: string; subtitle: string; danger?: boolean
}) {
  return (
    <div
      className="flex items-center gap-3 pb-4 mb-5"
      style={{ borderBottom: '1px solid #2A2A2A' }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          backgroundColor: danger ? 'rgba(220,38,38,0.12)' : 'rgba(245,166,36,0.12)',
        }}
      >
        <Icon
          className="h-4 w-4"
          style={{ color: danger ? '#F87171' : '#F5A624' }}
        />
      </div>
      <div>
        <h2 className="text-sm font-bold text-white">{title}</h2>
        <p className="text-xs" style={{ color: '#6B7280' }}>{subtitle}</p>
      </div>
    </div>
  )
}

// ── Save Changes button ───────────────────────────────────────────────────────
function SaveBtn({ onClick, saving }: { onClick: () => void; saving?: boolean }) {
  return (
    <div className="flex justify-end mt-5 pt-4" style={{ borderTop: '1px solid #2A2A2A' }}>
      <button
        onClick={onClick}
        disabled={saving}
        className="px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
        style={{ backgroundColor: '#F5A624', color: '#000000', opacity: saving ? 0.6 : 1 }}
      >
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  )
}

// ── Toggle switch ──────────────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative flex-shrink-0 transition-colors"
      style={{
        width: 40, height: 22, borderRadius: 11,
        backgroundColor: value ? '#F5A624' : '#2A2A2A',
        border: '1px solid',
        borderColor: value ? '#F5A624' : '#3A3A3A',
      }}
    >
      <span
        className="absolute top-0.5 transition-transform"
        style={{
          left: value ? 20 : 2, width: 16, height: 16,
          borderRadius: 8, backgroundColor: value ? '#000' : '#6B7280',
        }}
      />
    </button>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user, workspace } = useAuthStore()
  const { setBreadcrumbItems } = useBreadcrumb()
  const [activeTab, setActiveTab] = useState<NavKey>('profile')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setBreadcrumbItems([{ label: 'Settings' }])
  }, [setBreadcrumbItems])

  // Derive initials
  const fullName   = (user as any)?.name || (user as any)?.displayName || ''
  const email      = (user as any)?.email || ''
  const nameParts  = fullName.trim().split(' ')
  const firstName  = (user as any)?.given_name || nameParts[0] || ''
  const lastName   = (user as any)?.family_name || nameParts.slice(1).join(' ') || ''
  const initials   = [firstName[0], lastName[0]].filter(Boolean).join('').toUpperCase() || email.slice(0, 2).toUpperCase() || 'YC'
  const orgId      = workspace?.workspace_id || 'org_stud_x8IQ9mz'
  const orgName    = (workspace as any)?.name || 'Studio'

  // Profile form state
  const [profile, setProfile] = useState({
    firstName, lastName,
    email,
    displayName: fullName || `${firstName} ${lastName}`.trim(),
  })

  // Org form state
  const [org, setOrg] = useState({
    name: orgName,
    timezone: 'Asia/Kolkata (GMT+5:30)',
  })

  // Security form
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })

  // Notifications
  const [notif, setNotif] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    systemUpdates: false,
    marketingEmails: false,
  })

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
  }

  return (
    <div style={{ backgroundColor: '#0D0D0D', minHeight: '100vh' }}>

      {/* ── Slim hero banner ── */}
      <div className="px-5 pt-5">
        <div
          className="rounded-xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1B1B35 0%, #162040 50%, #0F2044 100%)',
            border: '1px solid #2A3050',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="relative z-10 px-6 py-5">
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#F5A624' }}>
              Settings
            </p>
            <h1 className="text-3xl font-bold text-white mb-1">Account Settings</h1>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              Manage your account preferences, security, notifications, and team.
            </p>
          </div>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="px-5 py-4 flex gap-4 items-start">

        {/* ── Left sidebar nav ── */}
        <div
          className="flex-shrink-0 rounded-xl overflow-hidden"
          style={{ width: 160, backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A' }}
        >
          {NAV.map(({ key, label, Icon }) => {
            const isActive = activeTab === key
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors text-left"
                style={
                  isActive
                    ? {
                        color: '#F5A624',
                        backgroundColor: 'rgba(245,166,36,0.08)',
                        borderLeft: '2px solid #F5A624',
                      }
                    : {
                        color: '#6B7280',
                        borderLeft: '2px solid transparent',
                      }
                }
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
              </button>
            )
          })}
        </div>

        {/* ── Right content ── */}
        <div className="flex-1 min-w-0">

          {/* ══ PROFILE TAB ══ */}
          {activeTab === 'profile' && (
            <>
              {/* Profile Information */}
              <div style={SECTION_CARD}>
                <SectionHeader Icon={User} title="Profile Information" subtitle="Your personal details and avatar" />

                <div className="flex gap-8">
                  {/* Avatar */}
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <div
                      className="w-20 h-20 rounded-xl flex items-center justify-center text-2xl font-bold"
                      style={{ backgroundColor: '#F5A624', color: '#000000' }}
                    >
                      {initials}
                    </div>
                    <button className="text-xs font-medium" style={{ color: '#F5A624' }}>
                      Change
                    </button>
                  </div>

                  {/* Form fields */}
                  <div className="flex-1 space-y-4">
                    {/* First + Last Name row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label style={LABEL_STYLE}>First Name</label>
                        <input
                          style={INPUT_STYLE}
                          value={profile.firstName}
                          onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                          onFocus={(e) => (e.currentTarget.style.borderColor = '#F5A624')}
                          onBlur={(e)  => (e.currentTarget.style.borderColor = '#1F2937')}
                        />
                      </div>
                      <div>
                        <label style={LABEL_STYLE}>Last Name</label>
                        <input
                          style={INPUT_STYLE}
                          value={profile.lastName}
                          onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                          onFocus={(e) => (e.currentTarget.style.borderColor = '#F5A624')}
                          onBlur={(e)  => (e.currentTarget.style.borderColor = '#1F2937')}
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div>
                      <label style={LABEL_STYLE}>Email Address</label>
                      <div className="relative">
                        <input
                          style={INPUT_STYLE}
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          onFocus={(e) => (e.currentTarget.style.borderColor = '#F5A624')}
                          onBlur={(e)  => (e.currentTarget.style.borderColor = '#1F2937')}
                        />
                        {/* Verified badge */}
                        <div
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: 'rgba(5,150,105,0.15)',
                            color: '#34D399',
                          }}
                        >
                          Verified
                        </div>
                      </div>
                    </div>

                    {/* Display Name */}
                    <div>
                      <label style={LABEL_STYLE}>Display Name</label>
                      <input
                        style={INPUT_STYLE}
                        value={profile.displayName}
                        onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                        onFocus={(e) => (e.currentTarget.style.borderColor = '#F5A624')}
                        onBlur={(e)  => (e.currentTarget.style.borderColor = '#1F2937')}
                      />
                      <p className="text-xs mt-1.5" style={{ color: '#4B5563' }}>
                        This is how your name appears to team members.
                      </p>
                    </div>
                  </div>
                </div>

                <SaveBtn onClick={handleSave} saving={saving} />
              </div>

              {/* Organization */}
              <div style={SECTION_CARD}>
                <SectionHeader Icon={Building2} title="Organization" subtitle="Your workspace settings" />

                <div className="space-y-4">
                  {/* Org Name + Timezone */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label style={LABEL_STYLE}>Organization Name</label>
                      <input
                        style={INPUT_STYLE}
                        value={org.name}
                        onChange={(e) => setOrg({ ...org, name: e.target.value })}
                        onFocus={(e) => (e.currentTarget.style.borderColor = '#F5A624')}
                        onBlur={(e)  => (e.currentTarget.style.borderColor = '#1F2937')}
                      />
                    </div>
                    <div>
                      <label style={LABEL_STYLE}>Timezone</label>
                      <input
                        style={INPUT_STYLE}
                        value={org.timezone}
                        onChange={(e) => setOrg({ ...org, timezone: e.target.value })}
                        onFocus={(e) => (e.currentTarget.style.borderColor = '#F5A624')}
                        onBlur={(e)  => (e.currentTarget.style.borderColor = '#1F2937')}
                      />
                    </div>
                  </div>

                  {/* Org ID (readonly) */}
                  <div>
                    <label style={LABEL_STYLE}>Organization ID</label>
                    <input
                      style={INPUT_READONLY_STYLE}
                      value={orgId}
                      readOnly
                    />
                    <p className="text-xs mt-1.5" style={{ color: '#4B5563' }}>
                      Used for API integrations
                    </p>
                  </div>
                </div>

                <SaveBtn onClick={handleSave} saving={saving} />
              </div>

              {/* Danger Zone */}
              <div style={SECTION_CARD}>
                <SectionHeader Icon={AlertTriangle} title="Danger Zone" subtitle="Irreversible account actions" danger />

                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold mb-1" style={{ color: '#DC2626' }}>
                      Delete Account
                    </p>
                    <p className="text-xs" style={{ color: '#6B7280' }}>
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <button
                    className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold ml-6"
                    style={{
                      backgroundColor: 'rgba(220,38,38,0.12)',
                      color: '#F87171',
                      border: '1px solid rgba(220,38,38,0.3)',
                    }}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ══ SECURITY TAB ══ */}
          {activeTab === 'security' && (
            <>
              {/* Change Password */}
              <div style={SECTION_CARD}>
                <SectionHeader Icon={Key} title="Change Password" subtitle="Update your password to keep your account secure" />

                <div className="space-y-4">
                  <div>
                    <label style={LABEL_STYLE}>Current Password</label>
                    <input
                      style={INPUT_STYLE}
                      type="password"
                      placeholder="••••••••"
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      onFocus={(e) => (e.currentTarget.style.borderColor = '#F5A624')}
                      onBlur={(e)  => (e.currentTarget.style.borderColor = '#1F2937')}
                    />
                  </div>
                  <div>
                    <label style={LABEL_STYLE}>New Password</label>
                    <input
                      style={INPUT_STYLE}
                      type="password"
                      placeholder="••••••••"
                      value={passwords.next}
                      onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                      onFocus={(e) => (e.currentTarget.style.borderColor = '#F5A624')}
                      onBlur={(e)  => (e.currentTarget.style.borderColor = '#1F2937')}
                    />
                    <p className="text-xs mt-1.5" style={{ color: '#4B5563' }}>Must be at least 8 characters</p>
                  </div>
                  <div>
                    <label style={LABEL_STYLE}>Confirm New Password</label>
                    <input
                      style={INPUT_STYLE}
                      type="password"
                      placeholder="••••••••"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      onFocus={(e) => (e.currentTarget.style.borderColor = '#F5A624')}
                      onBlur={(e)  => (e.currentTarget.style.borderColor = '#1F2937')}
                    />
                  </div>
                </div>

                <SaveBtn onClick={handleSave} saving={saving} />
              </div>

              {/* 2FA */}
              <div style={SECTION_CARD}>
                <SectionHeader Icon={Shield} title="Two-Factor Authentication" subtitle="Add an extra layer of security to your account" />

                <div
                  className="flex items-center justify-between p-4 rounded-lg"
                  style={{
                    backgroundColor: 'rgba(5,150,105,0.06)',
                    border: '1px solid rgba(5,150,105,0.2)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" style={{ color: '#34D399' }} />
                    <div>
                      <p className="text-sm font-medium text-white">2FA is enabled</p>
                      <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>Your account is protected with 2FA</p>
                    </div>
                  </div>
                  <button
                    className="px-4 py-1.5 rounded-lg text-sm font-medium"
                    style={{
                      backgroundColor: 'rgba(220,38,38,0.10)',
                      color: '#F87171',
                      border: '1px solid rgba(220,38,38,0.25)',
                    }}
                  >
                    Disable
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ══ NOTIFICATIONS TAB ══ */}
          {activeTab === 'notifications' && (
            <div style={SECTION_CARD}>
              <SectionHeader Icon={Bell} title="Notification Preferences" subtitle="Control how and when you receive notifications" />

              <div className="space-y-3">
                {(Object.keys(notif) as (keyof typeof notif)[]).map((key) => {
                  const labels: Record<string, [string, string]> = {
                    emailNotifications: ['Email Notifications', 'Receive updates and alerts via email'],
                    pushNotifications:  ['Push Notifications', 'Browser push notifications for real-time alerts'],
                    weeklyReports:      ['Weekly Reports', 'Weekly summary of your display network performance'],
                    systemUpdates:      ['System Updates', 'Notifications about platform updates and maintenance'],
                    marketingEmails:    ['Marketing Emails', 'Product news and feature announcements'],
                  }
                  const [title, subtitle] = labels[key] ?? [key, '']
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between p-4 rounded-lg"
                      style={{ backgroundColor: '#111827', border: '1px solid #1F2937' }}
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{title}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{subtitle}</p>
                      </div>
                      <Toggle value={notif[key]} onChange={(v) => setNotif({ ...notif, [key]: v })} />
                    </div>
                  )
                })}
              </div>

              <SaveBtn onClick={handleSave} saving={saving} />
            </div>
          )}

          {/* ══ BILLING TAB ══ */}
          {activeTab === 'billing' && (
            <div style={SECTION_CARD}>
              <SectionHeader Icon={CreditCard} title="Current Plan" subtitle="Manage your subscription and billing" />

              <div
                className="p-5 rounded-xl mb-5"
                style={{
                  backgroundColor: 'rgba(245,166,36,0.06)',
                  border: '1px solid rgba(245,166,36,0.2)',
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">Free Plan</h3>
                    <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>Perfect for getting started</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold" style={{ color: '#F5A624' }}>$0</p>
                    <p className="text-xs" style={{ color: '#6B7280' }}>per month</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {['Up to 5 screens', '1GB storage', 'Basic templates', 'Email support'].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm" style={{ color: '#9CA3AF' }}>
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: '#34D399' }} />
                      {f}
                    </div>
                  ))}
                </div>
                <button
                  className="w-full py-2.5 rounded-lg text-sm font-semibold"
                  style={{ backgroundColor: '#F5A624', color: '#000000' }}
                >
                  Upgrade Plan
                </button>
              </div>
            </div>
          )}

          {/* ══ TEAM TAB ══ */}
          {activeTab === 'team' && (
            <div style={SECTION_CARD}>
              <SectionHeader Icon={Users} title="Team Members" subtitle="Manage who has access to your workspace" />

              <div
                className="flex flex-col items-center justify-center py-12"
                style={{ borderRadius: 8, backgroundColor: '#111827', border: '1px solid #1F2937' }}
              >
                <Users className="h-10 w-10 mb-3" style={{ color: '#2A2A2A' }} />
                <p className="text-sm font-medium text-white mb-1">No team members yet</p>
                <p className="text-xs mb-4" style={{ color: '#4B5563' }}>Invite colleagues to collaborate on your workspace</p>
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
                  style={{ backgroundColor: '#F5A624', color: '#000000' }}
                >
                  Invite Member
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
