'use client'

import { useState, useEffect } from 'react'
import { Button, Input, Label, Select } from '@/components/ui'
import { DataTable } from '@/components/ui/data-table'
import { StatusDot } from '@/components/ui/status-dot'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useAuthStore } from '@/stores/auth-store'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Users, Settings, Trash2, UserPlus, Mail, Shield,
  AlertTriangle, RefreshCw, X, Monitor, Calendar, LayoutGrid, Edit3,
} from 'lucide-react'
import {
  useUpdateWorkspace,
  useWorkspaceMembers,
  useUpdateMemberRole,
  useRemoveMember,
  useWorkspaceInvitations,
  useSendInvitation,
  useRevokeInvitation,
  useResendInvitation,
} from '@/hooks/queries'
import type { WorkspaceMember, InvitationResponse } from '@signage/types'

export default function WorkspaceSettingsPage() {
  const { workspace } = useAuthStore()
  const workspaceId = Number(workspace?.id || workspace?.workspace_id || 0)
  const [activeTab, setActiveTab] = useState<'general' | 'team'>('general')

  const [isEditing, setIsEditing] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [removeMemberTarget, setRemoveMemberTarget] = useState<WorkspaceMember | null>(null)

  const [workspaceData, setWorkspaceData] = useState({
    name: workspace?.name || '',
    slug: workspace?.slug || '',
    description: (workspace as any)?.description || '',
  })

  const { data: members = [], isLoading: membersLoading } = useWorkspaceMembers(workspaceId)
  const { data: invitations = [], isLoading: invLoading } = useWorkspaceInvitations(workspaceId)

  const updateWorkspaceMutation = useUpdateWorkspace()
  const updateRoleMutation      = useUpdateMemberRole()
  const removeMemberMutation    = useRemoveMember()
  const sendInviteMutation      = useSendInvitation()
  const revokeInviteMutation    = useRevokeInvitation()
  const resendInviteMutation    = useResendInvitation()

  useEffect(() => {
    if (workspace) {
      setWorkspaceData({
        name: workspace.name,
        slug: workspace.slug,
        description: (workspace as any)?.description || '',
      })
    }
  }, [workspace])

  const handleSave = () => {
    if (!workspaceId) return
      updateWorkspaceMutation.mutate(
      { id: workspaceId, data: { name: workspaceData.name, slug: workspaceData.slug } },
      { onSuccess: () => setIsEditing(false) }
    )
  }

  const handleInvite = () => {
    if (!inviteEmail || !workspaceId) return
    sendInviteMutation.mutate(
      { workspaceId, email: inviteEmail, role: inviteRole },
      { onSuccess: () => setInviteEmail('') }
    )
  }

  const handleRoleChange = (member: WorkspaceMember, newRole: string) => {
    updateRoleMutation.mutate({ workspaceId, userSub: member.cognito_sub, role: newRole })
  }

  const handleRemoveMember = () => {
    if (!removeMemberTarget) return
    removeMemberMutation.mutate(
      { workspaceId, userSub: removeMemberTarget.cognito_sub },
      { onSuccess: () => setRemoveMemberTarget(null) }
    )
  }

  const saving = updateWorkspaceMutation.isPending
  const workspaceInitials = (workspaceData.name[0] || 'W').toUpperCase()
  const memberList = (members as WorkspaceMember[]).map(m => ({ ...m, id: m.cognito_sub }))
  const inviteList = invitations as InvitationResponse[]
  const createdAt = workspace?.created_at ? new Date(workspace.created_at) : null

  const teamColumns = [
    {
      key: 'name',
      header: 'Member',
      cell: (member: WorkspaceMember) => {
        const displayName = member.name || member.email || member.cognito_sub
        const initials = displayName.slice(0, 2).toUpperCase()
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              {initials}
            </div>
            <div>
              <p className="font-medium text-text-primary">{member.name || '—'}</p>
              <p className="text-sm text-text-muted">{member.email || ''}</p>
            </div>
          </div>
        )
      },
    },
    {
      key: 'role',
      header: 'Role',
      cell: (member: WorkspaceMember) => (
        <div className="flex items-center gap-2">
          {(member.role === 'admin' || member.role === 'owner') && (
            <Shield className="h-3 w-3 text-primary" />
          )}
          <Select
            value={member.role}
            onValueChange={(val) => handleRoleChange(member, val)}
            disabled={updateRoleMutation.isPending}
            options={[
              { value: 'owner', label: 'Owner' },
              { value: 'admin', label: 'Admin' },
              { value: 'editor', label: 'Editor' },
              { value: 'viewer', label: 'Viewer' },
              { value: 'member', label: 'Member' },
            ]}
            className="h-8 text-sm capitalize"
          />
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (member: WorkspaceMember) => (
        <div className="flex items-center gap-2">
          <StatusDot status={member.status === 'active' ? 'online' : 'pending'} />
          <span className="text-sm text-text-secondary capitalize">{member.status}</span>
        </div>
      ),
    },
    {
      key: 'joined',
      header: 'Joined',
      cell: (member: WorkspaceMember) => (
        <span className="text-sm text-text-muted">
          {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: (member: WorkspaceMember) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-text-muted hover:text-error hover:bg-error/10"
          onClick={() => setRemoveMemberTarget(member)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  return (
    <>
      <div className="min-h-screen bg-background">

        {/* Page Header */}
        <div className="px-6 lg:px-8 pt-8 pb-6">
          <div className="max-w-7xl mx-auto flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0">
                <Monitor className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-text-primary tracking-tight">Workspace Settings</h1>
                <p className="text-sm text-text-secondary mt-1">Manage your workspace and team</p>
              </div>
            </div>

            {/* Tab switcher */}
            <div className="flex items-center gap-1 bg-surface border border-border rounded-xl p-1 shrink-0">
              <button
                onClick={() => setActiveTab('general')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  activeTab === 'general'
                    ? 'bg-surface-elevated border border-border text-primary'
                    : 'text-text-muted hover:text-text-primary'
                )}
              >
                <Settings className="h-4 w-4" />
                General
              </button>
              <button
                onClick={() => setActiveTab('team')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  activeTab === 'team'
                    ? 'bg-surface-elevated border border-border text-primary'
                    : 'text-text-muted hover:text-text-primary'
                )}
              >
                <Users className="h-4 w-4" />
                Team
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-10">

          {/* ── General Tab ── */}
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

              {/* Left: Workspace Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface border border-border rounded-2xl overflow-hidden"
              >
                {/* Card header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                      <Settings className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-text-primary">Workspace Details</h2>
                      <p className="text-xs text-text-muted">Update your workspace information</p>
                    </div>
                  </div>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={saving}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(true)} className="gap-1.5">
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  )}
                </div>

                <div className="p-6 space-y-5">
                  {/* Workspace Preview */}
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-alt border border-border">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-2xl font-bold text-white select-none shrink-0">
                      {workspaceInitials}
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">{workspaceData.name || 'My Workspace'}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="h-2 w-2 rounded-full bg-success" />
                        <span className="text-xs text-text-muted">Online · 12 screens active</span>
                      </div>
                    </div>
                  </div>

                  {/* Workspace name */}
                  <div className="space-y-1.5">
                    <Label className="text-sm text-text-secondary font-medium">Workspace name</Label>
                    <Input
                      value={workspaceData.name}
                      onChange={(e) => setWorkspaceData({ ...workspaceData, name: e.target.value })}
                      disabled={!isEditing}
                      placeholder="My Workspace"
                    />
                  </div>

                  {/* Workspace URL */}
                  <div className="space-y-1.5">
                    <Label className="text-sm text-text-secondary font-medium">Workspace URL</Label>
                    <div className="flex rounded-lg border border-border overflow-hidden bg-background focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                      <span className="flex items-center px-4 text-sm text-text-muted bg-surface-alt border-r border-border whitespace-nowrap shrink-0">
                        app.signage.com/
                      </span>
                      <input
                        value={workspaceData.slug}
                        onChange={(e) => setWorkspaceData({ ...workspaceData, slug: e.target.value })}
                        disabled={!isEditing}
                        placeholder="my-workspace"
                        className="flex-1 px-4 py-2.5 text-sm font-mono text-text-primary bg-transparent focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <Label className="text-sm text-text-secondary font-medium">Description</Label>
                    <textarea
                      value={workspaceData.description}
                      onChange={(e) => setWorkspaceData({ ...workspaceData, description: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Digital signage workspace for managing displays and content across the organization."
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed resize-none transition-colors"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Right: Information + Usage stacked */}
              <div className="flex flex-col gap-6">

                {/* Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="bg-surface border border-border rounded-2xl p-6"
                >
                  <div className="flex items-center gap-2 mb-5">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-xs font-semibold text-text-muted tracking-widest uppercase">Information</span>
                  </div>
                  <div className="space-y-5">
                    <div className="flex items-start gap-3">
                      <LayoutGrid className="h-4 w-4 text-text-muted mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-text-muted mb-0.5">Workspace ID</p>
                        <p className="text-xs font-mono text-text-secondary break-all leading-relaxed">
                          {workspace?.workspace_id || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-4 w-4 text-text-muted mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-text-muted mb-0.5">Created</p>
                        <p className="text-sm font-semibold text-text-primary">
                          {createdAt
                            ? createdAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="h-4 w-4 text-text-muted mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-text-muted mb-0.5">Team Members</p>
                        <p className="text-sm font-semibold text-primary">
                          {membersLoading ? '…' : `${memberList.length} members`}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Usage */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-surface border border-border rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-success" />
                      <span className="text-xs font-semibold text-text-muted tracking-widest uppercase">Usage</span>
                    </div>
                    <span className="text-xs font-bold border border-border rounded-md px-2 py-0.5 bg-surface-alt text-text-secondary tracking-widest">
                      FREE
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* Players */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-text-secondary">Players</span>
                        <span className="text-xs text-text-muted">1 / 3</span>
                      </div>
                      <div className="h-1.5 bg-surface-alt rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: '33%' }} />
                      </div>
                    </div>
                    {/* Storage */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-text-secondary">Storage</span>
                        <span className="text-xs text-text-muted">45.2 MB / 5 GB</span>
                      </div>
                      <div className="h-1.5 bg-surface-alt rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: '1%' }} />
                      </div>
                    </div>
                    {/* Schedules */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-text-secondary">Schedules</span>
                        <span className="text-xs text-text-muted">6 / 10</span>
                      </div>
                      <div className="h-1.5 bg-surface-alt rounded-full overflow-hidden">
                        <div className="h-full bg-success rounded-full transition-all" style={{ width: '60%' }} />
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-5 text-xs tracking-widest uppercase font-semibold"
                  >
                    Upgrade Plan
                  </Button>
                </motion.div>
              </div>
            </div>
          )}

          {/* ── Team Tab ── */}
          {activeTab === 'team' && (
            <div className="space-y-6">

              {/* Invite section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface border border-border rounded-2xl p-6"
              >
                <div className="mb-5">
                  <h2 className="text-base font-semibold text-text-primary">Invite Team Members</h2>
                  <p className="text-sm text-text-muted mt-0.5">Add new members to your workspace</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                    <Input
                      type="email"
                      placeholder="colleague@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleInvite() }}
                      className="pl-10"
                    />
                  </div>
                  <Select
                    value={inviteRole}
                    onValueChange={(val) => setInviteRole(val)}
                    options={[
                      { value: 'member', label: 'Member' },
                      { value: 'editor', label: 'Editor' },
                      { value: 'admin', label: 'Admin' },
                      { value: 'viewer', label: 'Viewer' },
                    ]}
                    className="w-[130px]"
                  />
                  <Button
                    onClick={handleInvite}
                    disabled={!inviteEmail || sendInviteMutation.isPending}
                    className="gap-2 shrink-0"
                  >
                    <UserPlus className="h-4 w-4" />
                    {sendInviteMutation.isPending ? 'Sending...' : 'Invite'}
                  </Button>
                </div>
                {sendInviteMutation.isError && (
                  <p className="text-sm text-error mt-3">Failed to send invitation. Please try again.</p>
                )}
              </motion.div>

              {/* Members table */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-surface border border-border rounded-2xl overflow-hidden"
              >
                <div className="px-6 py-5 border-b border-border">
                  <h2 className="text-base font-semibold text-text-primary">Team Members</h2>
                  <p className="text-sm text-text-muted mt-0.5">Manage your team members and their roles</p>
                </div>
                {membersLoading ? (
                  <div className="p-10 text-center text-text-muted text-sm">Loading members…</div>
                ) : memberList.length === 0 ? (
                  <div className="p-10 text-center text-text-muted text-sm">No members found</div>
                ) : (
                  <DataTable data={memberList} columns={teamColumns} />
                )}
              </motion.div>

              {/* Pending Invitations */}
              {!invLoading && inviteList.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-surface border border-border rounded-2xl overflow-hidden"
                >
                  <div className="px-6 py-5 border-b border-border">
                    <h2 className="text-base font-semibold text-text-primary">Pending Invitations</h2>
                    <p className="text-sm text-text-muted mt-0.5">Invitations awaiting acceptance</p>
                  </div>
                  <div className="divide-y divide-border">
                    {inviteList.map((inv) => (
                      <div key={inv.invitation_id} className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                            {inv.email.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-primary">{inv.email}</p>
                            <p className="text-xs text-text-muted capitalize">
                              {inv.role} · Expires {new Date(inv.expires_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded bg-warning/10 text-warning border border-warning/20 capitalize">
                            {inv.status}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resendInviteMutation.mutate({ workspaceId, invitationId: inv.id })}
                            disabled={resendInviteMutation.isPending}
                            className="h-8 gap-1.5 text-text-secondary"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Resend
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => revokeInviteMutation.mutate({ workspaceId, invitationId: inv.id })}
                            disabled={revokeInviteMutation.isPending}
                            className="h-8 gap-1.5 text-error hover:bg-error/10"
                          >
                            <X className="h-3.5 w-3.5" />
                            Revoke
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Remove Member Confirmation Dialog */}
      <Dialog open={!!removeMemberTarget} onOpenChange={(open) => { if (!open) setRemoveMemberTarget(null) }}>
        <DialogContent hideClose className="!p-0 max-w-sm">
          <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertTriangle className="h-5 w-5" style={{ color: '#DC2626' }} />
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Remove Member</h2>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '4px 0 0', lineHeight: 1.4 }}>
                Remove <strong>{removeMemberTarget?.name || removeMemberTarget?.email || 'this member'}</strong> from the workspace? They will lose all access.
              </p>
            </div>
          </div>
          <div style={{ padding: '14px 22px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              onClick={() => setRemoveMemberTarget(null)}
              style={{ height: 40, padding: '0 18px', borderRadius: 10, backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              onClick={handleRemoveMember}
              disabled={removeMemberMutation.isPending}
              style={{ height: 40, padding: '0 18px', borderRadius: 10, backgroundColor: '#DC2626', color: '#FFFFFF', fontSize: 13, fontWeight: 700, border: 'none', cursor: removeMemberMutation.isPending ? 'not-allowed' : 'pointer', opacity: removeMemberMutation.isPending ? 0.7 : 1 }}
            >
              {removeMemberMutation.isPending ? 'Removing...' : 'Remove Member'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
