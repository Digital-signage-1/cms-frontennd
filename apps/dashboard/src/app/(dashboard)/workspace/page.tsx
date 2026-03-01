'use client'

import { useState, useEffect } from 'react'
import { Button, Input, Label } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { DataTable } from '@/components/ui/data-table'
import { StatusDot } from '@/components/ui/status-dot'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useAuthStore } from '@/stores/auth-store'
import { motion } from 'framer-motion'
import {
  Users, Settings, Trash2, UserPlus, Mail, Shield,
  Building2, AlertTriangle, RefreshCw, X,
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
  const workspaceId = workspace?.workspace_id || ''

  const [isEditing, setIsEditing] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [removeMemberTarget, setRemoveMemberTarget] = useState<WorkspaceMember | null>(null)

  const [workspaceData, setWorkspaceData] = useState({
    name: workspace?.name || '',
    slug: workspace?.slug || '',
  })

  // Queries
  const { data: members = [], isLoading: membersLoading } = useWorkspaceMembers(workspaceId)
  const { data: invitations = [], isLoading: invLoading } = useWorkspaceInvitations(workspaceId)

  // Mutations
  const updateWorkspaceMutation = useUpdateWorkspace()
  const updateRoleMutation      = useUpdateMemberRole()
  const removeMemberMutation    = useRemoveMember()
  const sendInviteMutation      = useSendInvitation()
  const revokeInviteMutation    = useRevokeInvitation()
  const resendInviteMutation    = useResendInvitation()

  useEffect(() => {
    if (workspace) {
      setWorkspaceData({ name: workspace.name, slug: workspace.slug })
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
          <select
            value={member.role}
            onChange={(e) => handleRoleChange(member, e.target.value)}
            disabled={updateRoleMutation.isPending}
            className="px-2 py-1 rounded-md bg-surface-alt text-text-primary text-sm border border-border focus:outline-none focus:ring-1 focus:ring-primary/30 capitalize"
          >
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
            <option value="member">Member</option>
          </select>
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
          className="h-8 w-8 text-text-muted hover:text-red-400 hover:bg-red-400/10"
          onClick={() => setRemoveMemberTarget(member)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  const memberList  = (members as WorkspaceMember[]).map(m => ({ ...m, id: m.cognito_sub }))
  const inviteList  = invitations as InvitationResponse[]

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="glass-light sticky top-0 z-20 border-b border-border/50">
          <div className="max-w-5xl mx-auto px-8 py-6">
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Workspace Settings</h1>
            <p className="text-sm text-text-secondary mt-1">Manage your workspace and team</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-8 py-8">
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="inline-flex h-12 items-center justify-start gap-1 rounded-lg bg-surface p-1 border border-border">
              <TabsTrigger value="general" className="gap-2">
                <Settings className="h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="team" className="gap-2">
                <Users className="h-4 w-4" />
                Team
              </TabsTrigger>
            </TabsList>

            {/* ── General Tab ── */}
            <TabsContent value="general" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-border rounded-lg bg-surface p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-text-primary">Workspace Details</h2>
                      <p className="text-sm text-text-secondary">Update your workspace information</p>
                    </div>
                  </div>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsEditing(false)} disabled={saving}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary-hover text-white">
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>Edit</Button>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="workspaceName">Workspace name</Label>
                    <Input
                      id="workspaceName"
                      value={workspaceData.name}
                      onChange={(e) => setWorkspaceData({ ...workspaceData, name: e.target.value })}
                      disabled={!isEditing}
                      placeholder="My Workspace"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workspaceSlug">Workspace URL</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-text-muted text-sm">app.signage.com/</span>
                      <Input
                        id="workspaceSlug"
                        value={workspaceData.slug}
                        onChange={(e) => setWorkspaceData({ ...workspaceData, slug: e.target.value })}
                        disabled={!isEditing}
                        placeholder="my-workspace"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="border border-border rounded-lg bg-surface p-8"
              >
                <h2 className="text-xl font-semibold text-text-primary mb-4">Workspace Information</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-text-muted mb-1">Workspace ID</p>
                    <p className="text-sm font-mono text-text-primary">{workspace?.workspace_id || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-muted mb-1">Created</p>
                    <p className="text-sm text-text-primary">
                      {workspace?.created_at ? new Date(workspace.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-text-muted mb-1">Team Members</p>
                    <p className="text-sm text-text-primary">
                      {membersLoading ? '…' : `${memberList.length} members`}
                    </p>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            {/* ── Team Tab ── */}
            <TabsContent value="team" className="space-y-6">
              {/* Invite section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-border rounded-lg bg-surface p-8"
              >
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-text-primary">Invite Team Members</h2>
                  <p className="text-sm text-text-secondary mt-1">Add new members to your workspace</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
                    <Input
                      type="email"
                      placeholder="colleague@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleInvite() }}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="member">Member</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <Button
                    onClick={handleInvite}
                    disabled={!inviteEmail || sendInviteMutation.isPending}
                    className="bg-primary hover:bg-primary-hover text-white gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    {sendInviteMutation.isPending ? 'Sending...' : 'Invite'}
                  </Button>
                </div>
                {sendInviteMutation.isError && (
                  <p className="text-sm text-red-400 mt-3">
                    Failed to send invitation. Please try again.
                  </p>
                )}
              </motion.div>

              {/* Members table */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="border border-border rounded-lg bg-surface overflow-hidden"
              >
                <div className="p-6 border-b border-border">
                  <h2 className="text-xl font-semibold text-text-primary">Team Members</h2>
                  <p className="text-sm text-text-secondary mt-1">Manage your team members and their roles</p>
                </div>
                {membersLoading ? (
                  <div className="p-8 text-center text-text-muted text-sm">Loading members…</div>
                ) : memberList.length === 0 ? (
                  <div className="p-8 text-center text-text-muted text-sm">No members found</div>
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
                  className="border border-border rounded-lg bg-surface overflow-hidden"
                >
                  <div className="p-6 border-b border-border">
                    <h2 className="text-xl font-semibold text-text-primary">Pending Invitations</h2>
                    <p className="text-sm text-text-secondary mt-1">Invitations awaiting acceptance</p>
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
                          <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 capitalize">
                            {inv.status}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resendInviteMutation.mutate({ workspaceId, invitationId: inv.invitation_id })}
                            disabled={resendInviteMutation.isPending}
                            className="h-8 gap-1.5 text-text-secondary"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Resend
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => revokeInviteMutation.mutate({ workspaceId, invitationId: inv.invitation_id })}
                            disabled={revokeInviteMutation.isPending}
                            className="h-8 gap-1.5 text-red-400 hover:bg-red-400/10"
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
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* ── Remove Member Confirmation Dialog ── */}
      <Dialog open={!!removeMemberTarget} onOpenChange={(open) => { if (!open) setRemoveMemberTarget(null) }}>
        <DialogContent hideClose className="!p-0 max-w-sm">
          <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid #1E1E38', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertTriangle className="h-5 w-5" style={{ color: '#F87171' }} />
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Remove Member</h2>
              <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0', lineHeight: 1.4 }}>
                Remove <strong>{removeMemberTarget?.name || removeMemberTarget?.email || 'this member'}</strong> from the workspace? They will lose all access.
              </p>
            </div>
          </div>
          <div style={{ padding: '14px 22px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              onClick={() => setRemoveMemberTarget(null)}
              style={{ height: 40, padding: '0 18px', borderRadius: 10, backgroundColor: '#1A1A30', border: '1px solid #2A2A45', color: '#9CA3AF', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
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
