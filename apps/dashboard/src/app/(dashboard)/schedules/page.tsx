'use client'

import { Button, Input } from '@/components/ui'
import { EmptyState } from '@/components/ui/empty-state'
import { GlassCard } from '@/components/ui/glass-card'
import { StatusDot } from '@/components/ui/status-dot'
import { ScheduleModal } from '@/components/schedules/ScheduleModal'
import { useSchedules, useDeleteSchedule } from '@/hooks/queries'
import { Calendar as CalendarIcon, Clock, Plus, Search, Play, Pause, Edit, Trash2 } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { motion } from 'framer-motion'
import { fadeInUpVariants, staggerChildrenVariants } from '@/lib/animations'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

const TimelineGrid = ({ schedules }: { schedules: any[] }) => {
  return (
    <div className="relative overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="grid grid-cols-[80px_1fr] gap-0">
          <div className="sticky left-0 bg-surface z-10">
            <div className="h-12 border-b border-border/50" />
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="h-16 border-b border-border/30 flex items-start justify-end pr-3 text-xs text-text-muted pt-1"
              >
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          <div className="relative">
            <div className="grid grid-cols-7 h-12 border-b border-border/50">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="flex items-center justify-center text-sm font-medium text-text-primary border-r border-border/30 last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {DAYS.map((day, dayIndex) => (
                <div key={day} className="relative border-r border-border/30 last:border-r-0">
                  {HOURS.map((hour) => (
                    <div
                      key={`${day}-${hour}`}
                      className="h-16 border-b border-border/10 hover:bg-surface-alt/30 transition-colors"
                    />
                  ))}

                  {schedules
                    .filter((s: any) => {
                      if (!s.start_time || !s.end_time) return false
                      const days = s.days_of_week || [0, 1, 2, 3, 4, 5, 6]
                      return days.includes(dayIndex)
                    })
                    .map((schedule: any, idx: number) => {
                      const startHour = parseInt(schedule.start_time.split(':')[0])
                      const endHour = parseInt(schedule.end_time.split(':')[0])
                      const duration = endHour - startHour
                      const top = startHour * 64

                      return (
                        <motion.div
                          key={`${schedule.schedule_id}-${dayIndex}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className="absolute left-1 right-1 rounded-lg bg-gradient-to-br from-primary/80 to-primary/60 p-2 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                          style={{
                            top: `${top}px`,
                            height: `${duration * 64 - 8}px`,
                            zIndex: idx,
                          }}
                        >
                          <div className="text-white">
                            <p className="font-semibold text-xs line-clamp-1">{schedule.name}</p>
                            <p className="text-[10px] opacity-90 mt-0.5">
                              {schedule.start_time} - {schedule.end_time}
                            </p>
                          </div>
                          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-lg transition-colors" />
                        </motion.div>
                      )
                    })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const ScheduleCard = ({ schedule, onDelete, onEdit }: { schedule: any; onDelete: () => void; onEdit: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      <GlassCard variant="light" className="group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">{schedule.name}</h3>
              <p className="text-xs text-text-muted mt-0.5">
                {schedule.channel_count || 0} channels
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${
            schedule.is_active 
              ? 'bg-success/10 text-success border border-success/20' 
              : 'bg-surface-alt text-text-muted border border-border'
          }`}>
            <StatusDot status={schedule.is_active ? 'online' : 'offline'} size="sm" />
            <span className="text-xs font-medium">
              {schedule.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {schedule.start_time && schedule.end_time && (
          <div className="flex items-center gap-2 text-sm text-text-secondary mb-3">
            <Clock className="h-4 w-4" />
            <span>{schedule.start_time} - {schedule.end_time}</span>
          </div>
        )}

        {schedule.days_of_week && (
          <div className="flex gap-1 mb-4">
            {DAYS.map((day, idx) => {
              const isActive = schedule.days_of_week.includes(idx)
              return (
                <div
                  key={day}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-surface-alt text-text-muted border border-border/50'
                  }`}
                >
                  {day[0]}
                </div>
              )
            })}
          </div>
        )}

        <div className="flex gap-2 pt-3 border-t border-border/50">
          <Button size="sm" variant="outline" onClick={onEdit} className="flex-1 gap-2 rounded-lg">
            <Edit className="h-3 w-3" /> Edit
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onDelete}
            className="text-error hover:text-error hover:bg-error/10 border-error/30 rounded-lg"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </GlassCard>
    </motion.div>
  )
}

export default function SchedulesPage() {
  const workspace = useAuthStore((state) => state.workspace)
  const workspaceId = workspace?.workspace_id || ''
  const { data: schedules = [], isLoading } = useSchedules(workspaceId)
  const deleteScheduleMutation = useDeleteSchedule()
  const [viewMode, setViewMode] = useState<'timeline' | 'cards'>('timeline')
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<any>(null)

  const filteredSchedules = useMemo(() => {
    const schedulesList = Array.isArray(schedules) ? schedules : []
    return schedulesList.filter((s: any) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [schedules, searchQuery])

  const handleDelete = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return
    try {
      await deleteScheduleMutation.mutateAsync({ workspaceId, scheduleId })
    } catch (error) {
      console.error('Failed to delete schedule:', error)
    }
  }

  const handleEdit = (schedule: any) => {
    setEditingSchedule(schedule)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingSchedule(null)
  }

  return (
    <motion.div
      variants={staggerChildrenVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-background"
    >
      <div className="glass-light sticky top-0 z-20 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <motion.div variants={fadeInUpVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Schedule Timeline</h1>
              <p className="text-sm text-text-secondary mt-1">
                Visualize and manage your content schedules
              </p>
            </div>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-primary-hover text-white shadow-lg border-0 gap-2 rounded-xl"
            >
              <Plus className="h-4 w-4" /> New Schedule
            </Button>
          </motion.div>

          <motion.div variants={fadeInUpVariants} className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input
                placeholder="Search schedules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-surface/50 border-border/50 focus:border-primary/30 rounded-xl"
              />
            </div>

            <div className="flex gap-1 p-1 rounded-xl bg-surface/50 border border-border/50">
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'timeline'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Timeline
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'cards'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Cards
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-surface/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredSchedules.length === 0 ? (
          <EmptyState
            title="No schedules yet"
            description="Create your first schedule to automate content playback"
            action={{
              label: "Create Your First Schedule",
              onClick: () => setIsModalOpen(true),
              icon: <Plus className="h-4 w-4" />
            }}
          />
        ) : viewMode === 'timeline' ? (
          <GlassCard variant="light" className="overflow-hidden">
            <TimelineGrid schedules={filteredSchedules} />
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchedules.map((schedule: any) => (
              <ScheduleCard
                key={schedule.schedule_id}
                schedule={schedule}
                onDelete={() => handleDelete(schedule.schedule_id)}
                onEdit={() => handleEdit(schedule)}
              />
            ))}
          </div>
        )}
      </div>

      <ScheduleModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        schedule={editingSchedule}
        workspaceId={workspaceId}
      />
    </motion.div>
  )
}
