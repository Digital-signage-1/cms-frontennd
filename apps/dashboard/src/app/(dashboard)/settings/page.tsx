'use client'

import { useState, useEffect } from 'react'
import {
  User, Lock, Bell, CreditCard, Users,
  Building2, AlertTriangle, CheckCircle2, Key, Shield,
  Mail, Trash2, RefreshCw, UserPlus, X,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useBreadcrumb } from '@/contexts/breadcrumb-context'
import {
  useUpdateAccount, useDeleteAccount,
  useUpdateWorkspace, useWorkspaceMembers,
  useWorkspaceInvitations, useSendInvitation, useRevokeInvitation,
} from '@/hooks/queries'
import { api } from '@/services/api'
import { Dialog, DialogContent } from '@/components/ui/dialog'

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
  color: '#6B7280',
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
  const { user, account, workspace } = useAuthStore()
  const { setBreadcrumbItems } = useBreadcrumb()
  const [activeTab, setActiveTab] = useState<NavKey>('profile')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const updateAccountMutation = useUpdateAccount()
  const deleteAccountMutation = useDeleteAccount()
  const updateWorkspaceMutation = useUpdateWorkspace()
  const sendInvitationMutation = useSendInvitation()
  const revokeInvitationMutation = useRevokeInvitation()

  const workspaceNumId = workspace?.id ?? 0

  const { data: membersData } = useWorkspaceMembers(workspaceNumId)
  const { data: invitationsData } = useWorkspaceInvitations(workspaceNumId || undefined)
  const members = (membersData as any[]) ?? []
  const invitations = (invitationsData as any[]) ?? []

  useEffect(() => {
    setBreadcrumbItems([{ label: 'Settings' }])
  }, [setBreadcrumbItems])

  const fullName  = (user as any)?.name || (user as any)?.displayName || ''
  const email     = (user as any)?.email || ''
  const nameParts = fullName.trim().split(' ')
  const firstName = (user as any)?.given_name || nameParts[0] || ''
  const lastName  = (user as any)?.family_name || nameParts.slice(1).join(' ') || ''
  const initials  = [firstName[0], lastName[0]].filter(Boolean).join('').toUpperCase() || email.slice(0, 2).toUpperCase() || 'YC'
  const orgId     = workspace?.workspace_id || ''

  const [profile, setProfile] = useState({
    firstName, lastName,
    email,
    displayName: fullName || `${firstName} ${lastName}`.trim(),
  })

  const [org, setOrg] = useState({
    name: (workspace as any)?.name || '',
    timezone: (workspace as any)?.timezone || 'UTC',
  })

  const [pwStep, setPwStep] = useState<'form' | 'verify'>('form')
  const [pwForm, setPwForm] = useState({ newPassword: '', confirm: '' })
  const [pwCode, setPwCode] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMessage, setPwMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [notif, setNotif] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    systemUpdates: false,
    marketingEmails: false,
  })

  const [inviteForm, setInviteForm] = useState({ email: '', role: 'viewer' })
  const [inviteError, setInviteError] = useState('')

  const handleProfileSave = () => {
    if (!account?.account_id) return
    updateAccountMutation.mutate({
      accountId: account.account_id,
      data: { name: `${profile.firstName} ${profile.lastName}`.trim() },
    })
  }

  const handleDeleteAccount = () => {
    if (!account?.account_id) return
    deleteAccountMutation.mutate(account.account_id, {
      onSuccess: () => useAuthStore.getState().signOut(),
    })
  }

  const handleOrgSave = () => {
    if (!workspaceNumId) return
    updateWorkspaceMutation.mutate({
      id: workspaceNumId,
      data: { name: org.name, timezone: org.timezone },
    })
  }

  const handleSendPasswordCode = async () => {
    if (!email) return
    if (pwForm.newPassword.length < 8) {
      setPwMessage({ type: 'error', text: 'New password must be at least 8 characters.' })
      return
    }
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwMessage({ type: 'error', text: 'Passwords do not match.' })
      return
    }
    setPwSaving(true)
    setPwMessage(null)
    try {
      await api.auth.forgotPassword(email)
      setPwStep('verify')
      setPwMessage({ type: 'success', text: `Verification code sent to ${email}` })
    } catch (err: any) {
      setPwMessage({ type: 'error', text: err?.message || 'Failed to send code.' })
    } finally {
      setPwSaving(false)
    }
  }

  const handleConfirmPassword = async () => {
    if (!email || !pwCode) return
    setPwSaving(true)
    setPwMessage(null)
    try {
      await api.auth.confirmForgotPassword(email, pwCode, pwForm.newPassword)
      setPwMessage({ type: 'success', text: 'Password updated successfully.' })
      setPwStep('form')
      setPwForm({ newPassword: '', confirm: '' })
      setPwCode('')
    } catch (err: any) {
      setPwMessage({ type: 'error', text: err?.message || 'Invalid code or request expired.' })
    } finally {
      setPwSaving(false)
    }
  }

  const handleInvite = () => {
    if (!inviteForm.email.trim()) { setInviteError('Email is required.'); return }
    if (!workspaceNumId) return
    setInviteError('')
    sendInvitationMutation.mutate(
      { workspaceId: workspaceNumId, email: inviteForm.email.trim(), role: inviteForm.role },
      { onSuccess: () => setInviteForm({ email: '', role: 'viewer' }), onError: (e: any) => setInviteError(e?.message || 'Failed to send invitation.') }
    )
  }

  const handleRevokeInvitation = (invitationId: number) => {
    if (!workspaceNumId) return
    revokeInvitationMutation.mutate({ workspaceId: workspaceNumId, invitationId })
  }

  return (
    <div style={{ backgroundColor: '#0D0D0D', minHeight: '100vh' }}>

      {/* ── Slim hero banner ── */}
      <div className="page-container pt-4 sm:pt-5">
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
          <div className="relative z-10 responsive-hero">
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#F5A624' }}>
              Settings
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Account Settings</h1>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              Manage your account preferences, security, notifications, and team.
            </p>
          </div>
        </div>
      </div>

      {/* ── Mobile tab nav (horizontal scroll) ── */}
      <div className="md:hidden scroll-x px-3 py-3" style={{ borderBottom: '1px solid #1C1C1C' }}>
        <div className="flex gap-1 w-max">
          {NAV.map(({ key, label, Icon }) => {
            const isActive = activeTab === key
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex-shrink-0 touch-target"
                style={
                  isActive
                    ? { backgroundColor: 'rgba(245,166,36,0.12)', color: '#F5A624', border: '1px solid rgba(245,166,36,0.3)' }
                    : { color: '#6B7280', border: '1px solid transparent' }
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Two-column layout (desktop) / stacked (mobile) ── */}
      <div className="page-container py-4 flex flex-col md:flex-row gap-4 items-start">

        {/* ── Left sidebar nav – desktop only ── */}
        <div
          className="hidden md:block flex-shrink-0 rounded-xl overflow-hidden"
          style={{ width: 160, backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A' }}
        >
          {NAV.map(({ key, label, Icon }) => {
            const isActive = activeTab === key
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors text-left touch-target"
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
        <div className="flex-1 min-w-0 w-full">

          {/* ══ PROFILE TAB ══ */}
          {activeTab === 'profile' && (
            <>
              {/* Profile Information */}
              <div style={SECTION_CARD}>
                <SectionHeader Icon={User} title="Profile Information" subtitle="Your personal details and avatar" />

                <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
                  {/* Avatar */}
                  <div className="flex flex-row sm:flex-col items-center gap-4 sm:gap-2 flex-shrink-0">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <p className="text-xs mt-1.5" style={{ color: '#6B7280' }}>
                        This is how your name appears to team members.
                      </p>
                    </div>
                  </div>
                </div>

                <SaveBtn onClick={handleProfileSave} saving={updateAccountMutation.isPending} />
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
                    <p className="text-xs mt-1.5" style={{ color: '#6B7280' }}>
                      Used for API integrations
                    </p>
                  </div>
                </div>

                <SaveBtn onClick={handleOrgSave} saving={updateWorkspaceMutation.isPending} />
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
                    onClick={() => setShowDeleteDialog(true)}
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
              <div style={SECTION_CARD}>
                <SectionHeader Icon={Key} title="Change Password" subtitle="A verification code will be sent to your email" />

                {pwMessage && (
                  <div
                    className="flex items-center gap-2 p-3 rounded-lg mb-4 text-sm"
                    style={{
                      backgroundColor: pwMessage.type === 'success' ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)',
                      border: `1px solid ${pwMessage.type === 'success' ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'}`,
                      color: pwMessage.type === 'success' ? '#34D399' : '#F87171',
                    }}
                  >
                    {pwMessage.type === 'success'
                      ? <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                      : <AlertTriangle className="h-4 w-4 flex-shrink-0" />}
                    {pwMessage.text}
                  </div>
                )}

                {pwStep === 'form' ? (
                  <div className="space-y-4">
                    <div>
                      <label style={LABEL_STYLE}>Account Email</label>
                      <input style={{ ...INPUT_STYLE, color: '#6B7280', cursor: 'default' }} value={email} readOnly />
                    </div>
                    <div>
                      <label style={LABEL_STYLE}>New Password</label>
                      <input
                        style={INPUT_STYLE}
                        type="password"
                        placeholder="••••••••"
                        value={pwForm.newPassword}
                        onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                        onFocus={(e) => (e.currentTarget.style.borderColor = '#F5A624')}
                        onBlur={(e)  => (e.currentTarget.style.borderColor = '#1F2937')}
                      />
                      <p className="text-xs mt-1.5" style={{ color: '#6B7280' }}>Must be at least 8 characters</p>
                    </div>
                    <div>
                      <label style={LABEL_STYLE}>Confirm New Password</label>
                      <input
                        style={INPUT_STYLE}
                        type="password"
                        placeholder="••••••••"
                        value={pwForm.confirm}
                        onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                        onFocus={(e) => (e.currentTarget.style.borderColor = '#F5A624')}
                        onBlur={(e)  => (e.currentTarget.style.borderColor = '#1F2937')}
                      />
                    </div>
                    <div className="flex justify-end pt-4 mt-4" style={{ borderTop: '1px solid #2A2A2A' }}>
                      <button
                        onClick={handleSendPasswordCode}
                        disabled={pwSaving}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
                        style={{ backgroundColor: '#F5A624', color: '#000000', opacity: pwSaving ? 0.6 : 1 }}
                      >
                        <Mail className="h-4 w-4" />
                        {pwSaving ? 'Sending…' : 'Send Verification Code'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label style={LABEL_STYLE}>Verification Code</label>
                      <input
                        style={INPUT_STYLE}
                        placeholder="Enter the code from your email"
                        value={pwCode}
                        onChange={(e) => setPwCode(e.target.value)}
                        onFocus={(e) => (e.currentTarget.style.borderColor = '#F5A624')}
                        onBlur={(e)  => (e.currentTarget.style.borderColor = '#1F2937')}
                      />
                      <p className="text-xs mt-1.5" style={{ color: '#6B7280' }}>
                        Check your inbox at <span style={{ color: '#F5A624' }}>{email}</span>
                      </p>
                    </div>
                    <div className="flex justify-between pt-4 mt-4" style={{ borderTop: '1px solid #2A2A2A' }}>
                      <button
                        onClick={() => { setPwStep('form'); setPwMessage(null) }}
                        className="px-4 py-2 rounded-lg text-sm font-medium"
                        style={{ backgroundColor: '#1F2937', color: '#9CA3AF', border: '1px solid #2A2A2A' }}
                      >
                        Back
                      </button>
                      <button
                        onClick={handleConfirmPassword}
                        disabled={pwSaving || !pwCode}
                        className="px-5 py-2 rounded-lg text-sm font-semibold"
                        style={{ backgroundColor: '#F5A624', color: '#000000', opacity: pwSaving || !pwCode ? 0.6 : 1 }}
                      >
                        {pwSaving ? 'Applying…' : 'Apply Change'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div style={SECTION_CARD}>
                <SectionHeader Icon={Shield} title="Two-Factor Authentication" subtitle="Add an extra layer of security to your account" />
                <div
                  className="flex items-center justify-between p-4 rounded-lg"
                  style={{ backgroundColor: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.2)' }}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" style={{ color: '#34D399' }} />
                    <div>
                      <p className="text-sm font-medium text-white">2FA is enabled</p>
                      <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>Your account is protected with 2FA</p>
                    </div>
                  </div>
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
            <>
              <div style={SECTION_CARD}>
                <SectionHeader Icon={UserPlus} title="Invite Member" subtitle="Send an invitation to collaborate on this workspace" />

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label style={LABEL_STYLE}>Email Address</label>
                    <input
                      style={INPUT_STYLE}
                      type="email"
                      placeholder="colleague@example.com"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                      onFocus={(e) => (e.currentTarget.style.borderColor = '#F5A624')}
                      onBlur={(e)  => (e.currentTarget.style.borderColor = '#1F2937')}
                    />
                  </div>
                  <div style={{ width: 140 }}>
                    <label style={LABEL_STYLE}>Role</label>
                    <select
                      value={inviteForm.role}
                      onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                      style={{ ...INPUT_STYLE, width: '100%', cursor: 'pointer' }}
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                {inviteError && (
                  <p className="text-xs mt-2" style={{ color: '#F87171' }}>{inviteError}</p>
                )}

                <div className="flex justify-end mt-5 pt-4" style={{ borderTop: '1px solid #2A2A2A' }}>
                  <button
                    onClick={handleInvite}
                    disabled={sendInvitationMutation.isPending}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold"
                    style={{ backgroundColor: '#F5A624', color: '#000000', opacity: sendInvitationMutation.isPending ? 0.6 : 1 }}
                  >
                    <Mail className="h-4 w-4" />
                    {sendInvitationMutation.isPending ? 'Sending…' : 'Send Invitation'}
                  </button>
                </div>
              </div>

              <div style={SECTION_CARD}>
                <SectionHeader Icon={Users} title="Team Members" subtitle="Current members of this workspace" />

                {members.length === 0 ? (
                  <p className="text-sm py-4 text-center" style={{ color: '#6B7280' }}>No members found</p>
                ) : (
                  <div className="space-y-2">
                    {members.map((m: any, i: number) => (
                      <div
                        key={m.cognito_sub || i}
                        className="flex items-center justify-between px-4 py-3 rounded-lg"
                        style={{ backgroundColor: '#111827', border: '1px solid #1F2937' }}
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{m.email || m.cognito_sub}</p>
                          {m.joined_at && (
                            <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                              Joined {new Date(m.joined_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
                          style={{
                            backgroundColor: 'rgba(245,166,36,0.12)',
                            color: '#F5A624',
                            border: '1px solid rgba(245,166,36,0.25)',
                          }}
                        >
                          {m.role}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {invitations.length > 0 && (
                <div style={SECTION_CARD}>
                  <SectionHeader Icon={RefreshCw} title="Pending Invitations" subtitle="Invitations awaiting acceptance" />

                  <div className="space-y-2">
                    {invitations.map((inv: any, i: number) => (
                      <div
                        key={inv.invitation_id || i}
                        className="flex items-center justify-between px-4 py-3 rounded-lg"
                        style={{ backgroundColor: '#111827', border: '1px solid #1F2937' }}
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{inv.email}</p>
                          <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                            Role: {inv.role} · Expires {new Date(inv.expires_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRevokeInvitation(inv.id)}
                          disabled={revokeInvitationMutation.isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                          style={{
                            backgroundColor: 'rgba(220,38,38,0.10)',
                            color: '#F87171',
                            border: '1px solid rgba(220,38,38,0.25)',
                          }}
                        >
                          <X className="h-3.5 w-3.5" />
                          Revoke
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* ── Delete Account Confirmation Dialog ── */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent hideClose className="!p-0 max-w-sm">
          <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid #1E1E38', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertTriangle className="h-5 w-5" style={{ color: '#F87171' }} />
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Delete Account</h2>
              <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0', lineHeight: 1.4 }}>
                This will permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
          </div>
          <div style={{ padding: '14px 22px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              onClick={() => setShowDeleteDialog(false)}
              style={{ height: 40, padding: '0 18px', borderRadius: 10, backgroundColor: '#1A1A30', border: '1px solid #2A2A45', color: '#9CA3AF', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deleteAccountMutation.isPending}
              style={{ height: 40, padding: '0 18px', borderRadius: 10, backgroundColor: '#DC2626', color: '#FFFFFF', fontSize: 13, fontWeight: 700, border: 'none', cursor: deleteAccountMutation.isPending ? 'not-allowed' : 'pointer', opacity: deleteAccountMutation.isPending ? 0.7 : 1 }}
            >
              {deleteAccountMutation.isPending ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
