'use client'

import { useState } from 'react'
import { Button, Input, Label } from '@/components/ui'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuthStore } from '@/stores/auth-store'
import { motion } from 'framer-motion'
import { User, Mail, Building2, MapPin, Phone, Link as LinkIcon, Save, Upload, Camera } from 'lucide-react'

export default function ProfilePage() {
  const { user, account } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    firstName: account?.first_name || user?.given_name || '',
    lastName: account?.last_name || user?.family_name || '',
    email: user?.email || '',
    phone: account?.phone || '',
    company: account?.company || '',
    location: account?.location || '',
    website: account?.website || '',
    bio: account?.bio || '',
  })

  const userInitials = `${formData.firstName[0] || ''}${formData.lastName[0] || ''}`

  const handleSave = async () => {
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setSaving(false)
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="glass-light sticky top-0 z-20 border-b border-border/50">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Profile</h1>
              <p className="text-sm text-text-secondary mt-1">
                Manage your personal information
              </p>
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
                  className="bg-primary hover:bg-primary-hover text-white gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="gap-2"
              >
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-border rounded-lg bg-surface p-8"
        >
          <div className="flex items-start gap-8">
            <div className="relative group">
              <Avatar className="h-32 w-32 border-4 border-border">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary-hover text-white text-3xl font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <button className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-8 w-8 text-white" />
                </button>
              )}
            </div>

            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="pl-10 bg-surface-alt"
                  />
                </div>
                <p className="text-xs text-text-muted">Email cannot be changed</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      placeholder="+1 (555) 000-0000"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      disabled={!isEditing}
                      placeholder="San Francisco, CA"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Acme Inc."
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <Input
                      id="website"
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

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed resize-none"
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
          <h2 className="text-xl font-semibold text-text-primary mb-6">Account Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-text-muted mb-1">Account ID</p>
              <p className="text-sm font-mono text-text-primary">{account?.account_id || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-text-muted mb-1">Member since</p>
              <p className="text-sm text-text-primary">
                {account?.created_at ? new Date(account.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-muted mb-1">Subscription Plan</p>
              <p className="text-sm text-text-primary capitalize">{account?.subscription_plan || 'Free'}</p>
            </div>
            <div>
              <p className="text-sm text-text-muted mb-1">Account Status</p>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-success/10 text-success border border-success/20 text-xs font-medium">
                Active
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
