export interface Schedule {
  schedule_id: string
  workspace_id: string
  channel_id: string
  name: string
  type: 'always' | 'date_range' | 'recurring' | 'onetime'
  start_date?: string
  end_date?: string
  start_time?: string
  end_time?: string
  days_of_week?: string[]
  timezone: string
  priority: number
  is_active: boolean
  created_at: string
}

export interface ScheduleOverride {
  override_id: string
  workspace_id: string
  channel_id: string
  name: string
  type: 'emergency' | 'special' | 'maintenance'
  start_datetime: string
  end_datetime: string
  priority: number
  created_by: string
}

export interface ScheduleCreateRequest {
  name: string
  channel_id: string
  type: 'always' | 'date_range' | 'recurring' | 'onetime'
  start_date?: string
  end_date?: string
  start_time?: string
  end_time?: string
  days_of_week?: string[]
  timezone?: string
  priority?: number
}

export interface ScheduleUpdateRequest {
  name?: string
  channel_id?: string
  type?: 'always' | 'date_range' | 'recurring' | 'onetime'
  start_date?: string
  end_date?: string
  start_time?: string
  end_time?: string
  days_of_week?: string[]
  timezone?: string
  priority?: number
  is_active?: boolean
}