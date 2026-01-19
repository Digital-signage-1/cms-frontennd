'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button, Input } from '@/components/ui'
import { useState } from 'react'
import { useChannels, useCreateSchedule, useUpdateSchedule } from '@/hooks/queries'
import { useAuthStore } from '@/stores/auth-store'
import { Clock } from 'lucide-react'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface ScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  schedule?: any
  workspaceId: string
}

export function ScheduleModal({ isOpen, onClose, schedule, workspaceId }: ScheduleModalProps) {
  const [name, setName] = useState(schedule?.name || '')
  const [startTime, setStartTime] = useState(schedule?.start_time || '09:00')
  const [endTime, setEndTime] = useState(schedule?.end_time || '17:00')
  const [selectedDays, setSelectedDays] = useState<number[]>(
    schedule?.days_of_week || [0, 1, 2, 3, 4]
  )
  const [isActive, setIsActive] = useState(schedule?.is_active ?? true)
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>(
    schedule?.channel_ids || []
  )

  const { data: channelsData } = useChannels(workspaceId)
  const createScheduleMutation = useCreateSchedule()
  const updateScheduleMutation = useUpdateSchedule()

  const channels = Array.isArray(channelsData) ? channelsData : []

  const handleClose = () => {
    setName('')
    setStartTime('09:00')
    setEndTime('17:00')
    setSelectedDays([0, 1, 2, 3, 4])
    setIsActive(true)
    setSelectedChannelIds([])
    onClose()
  }

  const toggleDay = (dayIndex: number) => {
    setSelectedDays(prev =>
      prev.includes(dayIndex)
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex].sort()
    )
  }

  const toggleChannel = (channelId: string) => {
    setSelectedChannelIds(prev =>
      prev.includes(channelId)
        ? prev.filter(c => c !== channelId)
        : [...prev, channelId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !startTime || !endTime || selectedDays.length === 0) {
      alert('Please fill all required fields')
      return
    }

    try {
      const data = {
        name,
        start_time: startTime,
        end_time: endTime,
        days_of_week: selectedDays,
        is_active: isActive,
        channel_ids: selectedChannelIds,
      }

      if (schedule) {
        await updateScheduleMutation.mutateAsync({
          workspaceId,
          scheduleId: schedule.schedule_id,
          data,
        })
      } else {
        await createScheduleMutation.mutateAsync({
          workspaceId,
          data,
        })
      }
      handleClose()
    } catch (error) {
      console.error('Failed to save schedule:', error)
      alert('Failed to save schedule')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {schedule ? 'Edit Schedule' : 'Create New Schedule'}
          </DialogTitle>
          <p className="text-text-secondary text-sm">
            Configure when your content should play
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div>
            <label className="text-sm font-medium text-text-primary mb-2 block">
              Schedule Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Business Hours, Weekend Display"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">
                Start Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">
                End Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-text-primary mb-3 block">
              Days of Week
            </label>
            <div className="flex gap-2">
              {DAYS.map((day, idx) => {
                const isSelected = selectedDays.includes(idx)
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(idx)}
                    className={`flex-1 h-12 rounded-lg text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-primary text-white'
                        : 'bg-surface border border-border text-text-secondary hover:border-primary/50'
                    }`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-text-primary mb-3 block">
              Channels
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto rounded-lg border border-border p-3 bg-surface">
              {channels.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-4">
                  No channels available. Create channels first.
                </p>
              ) : (
                channels.map((channel: any) => (
                  <label
                    key={channel.channel_id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-alt cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedChannelIds.includes(channel.channel_id)}
                      onChange={() => toggleChannel(channel.channel_id)}
                      className="h-4 w-4 rounded border-border"
                    />
                    <span className="text-sm text-text-primary">{channel.name}</span>
                    <span className="ml-auto text-xs text-text-muted capitalize">
                      {channel.status}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-lg bg-surface border border-border">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <label htmlFor="isActive" className="flex-1 cursor-pointer">
              <p className="text-sm font-medium text-text-primary">Active Schedule</p>
              <p className="text-xs text-text-secondary">
                Schedule will start running immediately if active
              </p>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createScheduleMutation.isPending || updateScheduleMutation.isPending}
              className="flex-1 bg-primary hover:bg-primary-hover text-white"
            >
              {createScheduleMutation.isPending || updateScheduleMutation.isPending
                ? 'Saving...'
                : schedule
                ? 'Update Schedule'
                : 'Create Schedule'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
