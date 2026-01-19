'use client'

import { useState } from 'react'
import { Button, Input, Label } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthStore } from '@/stores/auth-store'
import { motion } from 'framer-motion'
import { Shield, Bell, CreditCard, Key, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuthStore()
  const [saving, setSaving] = useState(false)

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    systemUpdates: false,
    marketingEmails: false,
  })

  const handlePasswordChange = async () => {
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setSaving(false)
    setPasswordData({ current: '', new: '', confirm: '' })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="glass-light sticky top-0 z-20 border-b border-border/50">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Settings</h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage your account preferences and security
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8">
        <Tabs defaultValue="security" className="space-y-6">
          <TabsList className="inline-flex h-12 items-center justify-start gap-1 rounded-lg bg-surface p-1 border border-border">
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Billing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="security" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border rounded-lg bg-surface p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Key className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">Change Password</h2>
                  <p className="text-sm text-text-secondary">Update your password to keep your account secure</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    placeholder="••••••••"
                  />
                  <p className="text-xs text-text-muted">Must be at least 8 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm new password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>

                <Button
                  onClick={handlePasswordChange}
                  disabled={saving || !passwordData.current || !passwordData.new || passwordData.new !== passwordData.confirm}
                  className="bg-primary hover:bg-primary-hover text-white"
                >
                  {saving ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="border border-border rounded-lg bg-surface p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">Two-Factor Authentication</h2>
                  <p className="text-sm text-text-secondary">Add an extra layer of security to your account</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-success/5 border border-success/20">
                <div>
                  <p className="font-medium text-text-primary">2FA is enabled</p>
                  <p className="text-sm text-text-secondary mt-0.5">Your account is protected with 2FA</p>
                </div>
                <Button variant="outline" className="text-error border-error/30 hover:bg-error/10">
                  Disable
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border rounded-lg bg-surface p-8"
            >
              <h2 className="text-xl font-semibold text-text-primary mb-6">Notification Preferences</h2>

              <div className="space-y-4">
                {Object.entries({
                  emailNotifications: 'Email notifications',
                  pushNotifications: 'Push notifications',
                  weeklyReports: 'Weekly reports',
                  systemUpdates: 'System updates',
                  marketingEmails: 'Marketing emails',
                }).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-surface-alt cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="font-medium text-text-primary">{label}</p>
                      <p className="text-sm text-text-secondary mt-0.5">Receive {label.toLowerCase()} about your account</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings[key as keyof typeof notificationSettings]}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        [key]: e.target.checked
                      })}
                      className="h-5 w-5 rounded border-border"
                    />
                  </label>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <Button className="bg-primary hover:bg-primary-hover text-white">
                  Save Preferences
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border rounded-lg bg-surface p-8"
            >
              <h2 className="text-xl font-semibold text-text-primary mb-6">Current Plan</h2>

              <div className="p-6 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-text-primary">Free Plan</h3>
                    <p className="text-text-secondary mt-1">Perfect for getting started</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">$0</p>
                    <p className="text-sm text-text-muted">per month</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Up to 5 screens
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    1GB storage
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Basic templates
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Email support
                  </div>
                </div>

                <Button className="w-full mt-6 bg-primary hover:bg-primary-hover text-white">
                  Upgrade Plan
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="border border-error/30 rounded-lg bg-error/5 p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-error" />
                <h2 className="text-xl font-semibold text-text-primary">Danger Zone</h2>
              </div>
              <p className="text-text-secondary mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button variant="outline" className="text-error border-error hover:bg-error/10">
                Delete Account
              </Button>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
