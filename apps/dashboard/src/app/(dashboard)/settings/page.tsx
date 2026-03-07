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
const INPUT_CLASSES = 'bg-input border border-input-border text-text-primary rounded-lg h-10 px-3 text-sm w-full outline-none focus:border-primary'
const INPUT_READONLY_CLASSES = 'bg-input border border-input-border text-text-muted rounded-lg h-10 px-3 text-sm w-full outline-none cursor-default'
const LABEL_CLASSES = 'text-text-muted text-xs mb-1 block'
const SECTION_CARD_CLASSES = 'bg-surface border border-border rounded-xl px-6 py-5 mb-4'

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
    <div className="flex items-center gap-3 pb-4 mb-5 border-b border-border">
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${danger ? 'bg-error/10' : 'bg-primary/10'}`}
      >
        <Icon
          className={`h-4 w-4 ${danger ? 'text-error' : 'text-primary'}`}
        />
      </div>
      <div>
        <h2 className="text-sm font-bold text-text-primary">{title}</h2>
        <p className="text-xs text-text-muted">{subtitle}</p>
      </div>
    </div>
  )
}

// ── Save Changes button ───────────────────────────────────────────────────────
function SaveBtn({ onClick, saving }: { onClick: () => void; saving?: boolean }) {
  return (
    <div className="flex justify-end mt-5 pt-4 border-t border-border">
      <button
        onClick={onClick}
        disabled={saving}
        className="px-5 py-2 rounded-lg text-sm font-semibold transition-colors bg-primary text-on-primary"
        style={{ opacity: saving ? 0.6 : 1 }}
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
      className={`relative flex-shrink-0 transition-colors ${value ? 'bg-primary border-primary' : 'bg-surface-alt border-border'}`}
      style={{
        width: 40, height: 22, borderRadius: 11,
        borderWidth: 1, borderStyle: 'solid',
      }}
    >
      <span
        className="absolute top-0.5 transition-transform"
        style={{
          left: value ? 20 : 2, width: 16, height: 16,
          borderRadius: 8, backgroundColor: value ? 'var(--color-on-primary)' : 'var(--color-text-muted)',
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
    <div className="min-h-screen">

      {/* ── Slim hero banner ── */}
      <div className="page-container pt-4 sm:pt-5">
        <div
          className="rounded-xl relative overflow-hidden border border-primary/20"
          style={{
            background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-alt) 50%, var(--color-surface-hover) 100%)',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(var(--color-border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--color-border-subtle) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="relative z-10 responsive-hero">
            <p className="text-xs font-semibold tracking-widest uppercase mb-2 text-primary">
              Settings
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-1">Account Settings</h1>
            <p className="text-sm text-text-muted">
              Manage your account preferences, security, notifications, and team.
            </p>
          </div>
        </div>
      </div>

      {/* ── Mobile tab nav (horizontal scroll) ── */}
      <div className="md:hidden scroll-x px-3 py-3 border-b border-border">
        <div className="flex gap-1 w-max">
          {NAV.map(({ key, label, Icon }) => {
            const isActive = activeTab === key
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex-shrink-0 touch-target ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/30'
                    : 'text-text-muted border border-transparent'
                }`}
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
          className="hidden md:block flex-shrink-0 rounded-xl overflow-hidden bg-surface border border-border"
          style={{ width: 160 }}
        >
          {NAV.map(({ key, label, Icon }) => {
            const isActive = activeTab === key
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors text-left touch-target ${
                  isActive
                    ? 'text-primary bg-primary/10 border-l-2 border-l-primary'
                    : 'text-text-muted border-l-2 border-l-transparent hover:bg-surface-hover hover:text-text-primary'
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
              </button>
            )
          })}
        </div>

        {/* ── Right content ── */}
        <div className="flex-1 min-w-0 w-full">

          {/* == PROFILE TAB == */}
          {activeTab === 'profile' && (
            <>
              {/* Profile Information */}
              <div className={SECTION_CARD_CLASSES}>
                <SectionHeader Icon={User} title="Profile Information" subtitle="Your personal details and avatar" />

                <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
                  {/* Avatar */}
                  <div className="flex flex-row sm:flex-col items-center gap-4 sm:gap-2 flex-shrink-0">
                    <div className="w-20 h-20 rounded-xl flex items-center justify-center text-2xl font-bold bg-primary text-on-primary">
                      {initials}
                    </div>
                    <button className="text-xs font-medium text-primary">
                      Change
                    </button>
                  </div>

                  {/* Form fields */}
                  <div className="flex-1 space-y-4">
                    {/* First + Last Name row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={LABEL_CLASSES}>First Name</label>
                        <input
                          className={INPUT_CLASSES}
                          value={profile.firstName}
                          onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLASSES}>Last Name</label>
                        <input
                          className={INPUT_CLASSES}
                          value={profile.lastName}
                          onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className={LABEL_CLASSES}>Email Address</label>
                      <div className="relative">
                        <input
                          className={INPUT_CLASSES}
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        />
                        {/* Verified badge */}
                        <div
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium px-2 py-0.5 rounded bg-success/15 text-success"
                        >
                          Verified
                        </div>
                      </div>
                    </div>

                    {/* Display Name */}
                    <div>
                      <label className={LABEL_CLASSES}>Display Name</label>
                      <input
                        className={INPUT_CLASSES}
                        value={profile.displayName}
                        onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                      />
                      <p className="text-xs mt-1.5 text-text-muted">
                        This is how your name appears to team members.
                      </p>
                    </div>
                  </div>
                </div>

                <SaveBtn onClick={handleProfileSave} saving={updateAccountMutation.isPending} />
              </div>

              {/* Organization */}
              <div className={SECTION_CARD_CLASSES}>
                <SectionHeader Icon={Building2} title="Organization" subtitle="Your workspace settings" />

                <div className="space-y-4">
                  {/* Org Name + Timezone */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL_CLASSES}>Organization Name</label>
                      <input
                        className={INPUT_CLASSES}
                        value={org.name}
                        onChange={(e) => setOrg({ ...org, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASSES}>Timezone</label>
                      <input
                        className={INPUT_CLASSES}
                        value={org.timezone}
                        onChange={(e) => setOrg({ ...org, timezone: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Org ID (readonly) */}
                  <div>
                    <label className={LABEL_CLASSES}>Organization ID</label>
                    <input
                      className={INPUT_READONLY_CLASSES}
                      value={orgId}
                      readOnly
                    />
                    <p className="text-xs mt-1.5 text-text-muted">
                      Used for API integrations
                    </p>
                  </div>
                </div>

                <SaveBtn onClick={handleOrgSave} saving={updateWorkspaceMutation.isPending} />
              </div>

              {/* Danger Zone */}
              <div className={SECTION_CARD_CLASSES}>
                <SectionHeader Icon={AlertTriangle} title="Danger Zone" subtitle="Irreversible account actions" danger />

                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold mb-1 text-error">
                      Delete Account
                    </p>
                    <p className="text-xs text-text-muted">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeleteDialog(true)}
                    className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold ml-6 bg-error/10 text-error border border-error/30"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </>
          )}

          {/* == SECURITY TAB == */}
          {activeTab === 'security' && (
            <>
              <div className={SECTION_CARD_CLASSES}>
                <SectionHeader Icon={Key} title="Change Password" subtitle="A verification code will be sent to your email" />

                {pwMessage && (
                  <div
                    className={`flex items-center gap-2 p-3 rounded-lg mb-4 text-sm ${
                      pwMessage.type === 'success'
                        ? 'bg-success/10 border border-success/25 text-success'
                        : 'bg-error/10 border border-error/25 text-error'
                    }`}
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
                      <label className={LABEL_CLASSES}>Account Email</label>
                      <input className={INPUT_READONLY_CLASSES} value={email} readOnly />
                    </div>
                    <div>
                      <label className={LABEL_CLASSES}>New Password</label>
                      <input
                        className={INPUT_CLASSES}
                        type="password"
                        placeholder="••••••••"
                        value={pwForm.newPassword}
                        onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                      />
                      <p className="text-xs mt-1.5 text-text-muted">Must be at least 8 characters</p>
                    </div>
                    <div>
                      <label className={LABEL_CLASSES}>Confirm New Password</label>
                      <input
                        className={INPUT_CLASSES}
                        type="password"
                        placeholder="••••••••"
                        value={pwForm.confirm}
                        onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end pt-4 mt-4 border-t border-border">
                      <button
                        onClick={handleSendPasswordCode}
                        disabled={pwSaving}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors bg-primary text-on-primary"
                        style={{ opacity: pwSaving ? 0.6 : 1 }}
                      >
                        <Mail className="h-4 w-4" />
                        {pwSaving ? 'Sending…' : 'Send Verification Code'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className={LABEL_CLASSES}>Verification Code</label>
                      <input
                        className={INPUT_CLASSES}
                        placeholder="Enter the code from your email"
                        value={pwCode}
                        onChange={(e) => setPwCode(e.target.value)}
                      />
                      <p className="text-xs mt-1.5 text-text-muted">
                        Check your inbox at <span className="text-primary">{email}</span>
                      </p>
                    </div>
                    <div className="flex justify-between pt-4 mt-4 border-t border-border">
                      <button
                        onClick={() => { setPwStep('form'); setPwMessage(null) }}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-surface-alt text-text-secondary border border-border"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleConfirmPassword}
                        disabled={pwSaving || !pwCode}
                        className="px-5 py-2 rounded-lg text-sm font-semibold bg-primary text-on-primary"
                        style={{ opacity: pwSaving || !pwCode ? 0.6 : 1 }}
                      >
                        {pwSaving ? 'Applying…' : 'Apply Change'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className={SECTION_CARD_CLASSES}>
                <SectionHeader Icon={Shield} title="Two-Factor Authentication" subtitle="Add an extra layer of security to your account" />
                <div className="flex items-center justify-between p-4 rounded-lg bg-success/5 border border-success/20">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-success" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">2FA is enabled</p>
                      <p className="text-xs mt-0.5 text-text-muted">Your account is protected with 2FA</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* == NOTIFICATIONS TAB == */}
          {activeTab === 'notifications' && (
            <div className={SECTION_CARD_CLASSES}>
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
                      className="flex items-center justify-between p-4 rounded-lg bg-input border border-input-border"
                    >
                      <div>
                        <p className="text-sm font-medium text-text-primary">{title}</p>
                        <p className="text-xs mt-0.5 text-text-muted">{subtitle}</p>
                      </div>
                      <Toggle value={notif[key]} onChange={(v) => setNotif({ ...notif, [key]: v })} />
                    </div>
                  )
                })}
              </div>

            </div>
          )}

          {/* == BILLING TAB == */}
          {activeTab === 'billing' && (
            <div className={SECTION_CARD_CLASSES}>
              <SectionHeader Icon={CreditCard} title="Current Plan" subtitle="Manage your subscription and billing" />

              <div className="p-5 rounded-xl mb-5 bg-primary/5 border border-primary/20">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-text-primary">Free Plan</h3>
                    <p className="text-sm mt-0.5 text-text-muted">Perfect for getting started</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">$0</p>
                    <p className="text-xs text-text-muted">per month</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {['Up to 5 screens', '1GB storage', 'Basic templates', 'Email support'].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-success" />
                      {f}
                    </div>
                  ))}
                </div>
                <button className="w-full py-2.5 rounded-lg text-sm font-semibold bg-primary text-on-primary">
                  Upgrade Plan
                </button>
              </div>
            </div>
          )}

          {/* == TEAM TAB == */}
          {activeTab === 'team' && (
            <>
              <div className={SECTION_CARD_CLASSES}>
                <SectionHeader Icon={UserPlus} title="Invite Member" subtitle="Send an invitation to collaborate on this workspace" />

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label className={LABEL_CLASSES}>Email Address</label>
                    <input
                      className={INPUT_CLASSES}
                      type="email"
                      placeholder="colleague@example.com"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    />
                  </div>
                  <div style={{ width: 140 }}>
                    <label className={LABEL_CLASSES}>Role</label>
                    <select
                      value={inviteForm.role}
                      onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                      className={INPUT_CLASSES + ' cursor-pointer'}
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                {inviteError && (
                  <p className="text-xs mt-2 text-error">{inviteError}</p>
                )}

                <div className="flex justify-end mt-5 pt-4 border-t border-border">
                  <button
                    onClick={handleInvite}
                    disabled={sendInvitationMutation.isPending}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-primary text-on-primary"
                    style={{ opacity: sendInvitationMutation.isPending ? 0.6 : 1 }}
                  >
                    <Mail className="h-4 w-4" />
                    {sendInvitationMutation.isPending ? 'Sending…' : 'Send Invitation'}
                  </button>
                </div>
              </div>

              <div className={SECTION_CARD_CLASSES}>
                <SectionHeader Icon={Users} title="Team Members" subtitle="Current members of this workspace" />

                {members.length === 0 ? (
                  <p className="text-sm py-4 text-center text-text-muted">No members found</p>
                ) : (
                  <div className="space-y-2">
                    {members.map((m: any, i: number) => (
                      <div
                        key={m.cognito_sub || i}
                        className="flex items-center justify-between px-4 py-3 rounded-lg bg-input border border-input-border"
                      >
                        <div>
                          <p className="text-sm font-medium text-text-primary">{m.email || m.cognito_sub}</p>
                          {m.joined_at && (
                            <p className="text-xs mt-0.5 text-text-muted">
                              Joined {new Date(m.joined_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize bg-primary/10 text-primary border border-primary/25">
                          {m.role}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {invitations.length > 0 && (
                <div className={SECTION_CARD_CLASSES}>
                  <SectionHeader Icon={RefreshCw} title="Pending Invitations" subtitle="Invitations awaiting acceptance" />

                  <div className="space-y-2">
                    {invitations.map((inv: any, i: number) => (
                      <div
                        key={inv.invitation_id || i}
                        className="flex items-center justify-between px-4 py-3 rounded-lg bg-input border border-input-border"
                      >
                        <div>
                          <p className="text-sm font-medium text-text-primary">{inv.email}</p>
                          <p className="text-xs mt-0.5 text-text-muted">
                            Role: {inv.role} · Expires {new Date(inv.expires_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRevokeInvitation(inv.id)}
                          disabled={revokeInvitationMutation.isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-error/10 text-error border border-error/25"
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
          <div className="flex items-start gap-3.5 border-b border-border" style={{ padding: '20px 22px 16px' }}>
            <div className="w-11 h-11 rounded-[10px] bg-error/15 border border-error/25 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-error" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-text-primary m-0">Delete Account</h2>
              <p className="text-[13px] text-text-muted mt-1 leading-snug">
                This will permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2.5" style={{ padding: '14px 22px' }}>
            <button
              onClick={() => setShowDeleteDialog(false)}
              className="h-10 px-[18px] rounded-[10px] bg-surface-alt border border-border text-text-secondary text-[13px] font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deleteAccountMutation.isPending}
              className="h-10 px-[18px] rounded-[10px] bg-error text-on-primary text-[13px] font-bold border-none"
              style={{ cursor: deleteAccountMutation.isPending ? 'not-allowed' : 'pointer', opacity: deleteAccountMutation.isPending ? 0.7 : 1 }}
            >
              {deleteAccountMutation.isPending ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
