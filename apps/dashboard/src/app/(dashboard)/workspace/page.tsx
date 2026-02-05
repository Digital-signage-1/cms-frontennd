'use client'

import { useState } from 'react'
import { Button, Input, Label } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { DataTable } from '@/components/ui/data-table'
import { StatusDot } from '@/components/ui/status-dot'
import { useAuthStore } from '@/stores/auth-store'
import { motion } from 'framer-motion'
import { Users, Settings, Trash2, UserPlus, Mail, Shield, Crown, MoreVertical, Building2 } from 'lucide-react'

const mockTeamMembers = [
  { id: '1', name: 'John Doe', email: 'john@company.com', role: 'admin', status: 'active', joined: '2024-01-15' },
  { id: '2', name: 'Jane Smith', email: 'jane@company.com', role: 'member', status: 'active', joined: '2024-02-20' },
  { id: '3', name: 'Bob Johnson', email: 'bob@company.com', role: 'member', status: 'pending', joined: '2024-03-10' },
]

export default function WorkspaceSettingsPage() {
  const { workspace } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')

  const [workspaceData, setWorkspaceData] = useState({
    name: workspace?.name || '',
    slug: workspace?.slug || '',
    description: (workspace as any)?.description || '',
  })

  const handleSave = async () => {
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setSaving(false)
    setIsEditing(false)
  }

  const handleInvite = async () => {
    if (!inviteEmail) return
    await new Promise(resolve => setTimeout(resolve, 1000))
    setInviteEmail('')
  }

  const teamColumns = [
    {
      key: 'name',
      header: 'Member',
      cell: (member: any) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
            {member.name.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <div>
            <p className="font-medium text-text-primary">{member.name}</p>
            <p className="text-sm text-text-muted">{member.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      cell: (member: any) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-alt text-text-primary text-sm capitalize border border-border">
          {member.role === 'admin' && <Shield className="h-3 w-3 text-primary" />}
          {member.role}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (member: any) => (
        <div className="flex items-center gap-2">
          <StatusDot status={member.status === 'active' ? 'online' : 'pending'} />
          <span className="text-sm text-text-secondary capitalize">{member.status}</span>
        </div>
      ),
    },
    {
      key: 'joined',
      header: 'Joined',
      cell: (member: any) => (
        <span className="text-sm text-text-muted">
          {new Date(member.joined).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: (member: any) => (
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="glass-light sticky top-0 z-20 border-b border-border/50">
        <div className="max-w-5xl mx-auto px-8 py-6">
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Workspace Settings</h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage your workspace and team
          </p>
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
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-primary hover:bg-primary-hover text-white"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
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

                <div className="space-y-2">
                  <Label htmlFor="workspaceDescription">Description</Label>
                  <textarea
                    id="workspaceDescription"
                    value={workspaceData.description}
                    onChange={(e) => setWorkspaceData({ ...workspaceData, description: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Describe your workspace..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                  />
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
                  <p className="text-sm text-text-primary">{mockTeamMembers.length} members</p>
                </div>
                <div>
                  <p className="text-sm text-text-muted mb-1">Active Screens</p>
                  <p className="text-sm text-text-primary">12 screens</p>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border rounded-lg bg-surface p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">Invite Team Members</h2>
                  <p className="text-sm text-text-secondary mt-1">Add new members to your workspace</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
                  <Input
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <Button
                  onClick={handleInvite}
                  disabled={!inviteEmail}
                  className="bg-primary hover:bg-primary-hover text-white gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Invite
                </Button>
              </div>
            </motion.div>

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
              <DataTable
                data={mockTeamMembers}
                columns={teamColumns}
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
