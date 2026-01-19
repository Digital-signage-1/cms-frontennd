import type { ZoneApp } from '@signage/types'

export interface PlaylistState {
  currentIndex: number
  currentApp: ZoneApp | null
  isPlaying: boolean
  progress: number
}

export interface PlaylistCallbacks {
  onAppChange?: (app: ZoneApp, index: number) => void
  onComplete?: () => void
  onError?: (error: Error) => void
}

export class PlaylistManager {
  private apps: ZoneApp[] = []
  private currentIndex = 0
  private isPlaying = false
  private timer: ReturnType<typeof setTimeout> | null = null
  private startTime = 0
  private callbacks: PlaylistCallbacks = {}

  constructor(apps: ZoneApp[], callbacks?: PlaylistCallbacks) {
    this.apps = this.sortApps(apps)
    this.callbacks = callbacks || {}
  }

  private sortApps(apps: ZoneApp[]): ZoneApp[] {
    return [...apps].sort((a, b) => a.order - b.order)
  }

  getState(): PlaylistState {
    return {
      currentIndex: this.currentIndex,
      currentApp: this.apps[this.currentIndex] || null,
      isPlaying: this.isPlaying,
      progress: this.getProgress(),
    }
  }

  private getProgress(): number {
    if (!this.isPlaying || this.apps.length === 0) return 0
    const currentApp = this.apps[this.currentIndex]
    if (!currentApp || currentApp.duration_seconds <= 0) return 0
    
    const elapsed = (Date.now() - this.startTime) / 1000
    return Math.min(elapsed / currentApp.duration_seconds, 1)
  }

  play(): void {
    if (this.isPlaying || this.apps.length === 0) return
    
    this.isPlaying = true
    this.startTime = Date.now()
    this.scheduleNext()
    this.notifyAppChange()
  }

  pause(): void {
    this.isPlaying = false
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  stop(): void {
    this.pause()
    this.currentIndex = 0
  }

  next(): void {
    if (this.apps.length === 0) return
    
    this.currentIndex = (this.currentIndex + 1) % this.apps.length
    this.startTime = Date.now()
    
    if (this.currentIndex === 0) {
      this.callbacks.onComplete?.()
    }
    
    this.notifyAppChange()
    
    if (this.isPlaying) {
      this.scheduleNext()
    }
  }

  previous(): void {
    if (this.apps.length === 0) return
    
    this.currentIndex = this.currentIndex === 0 
      ? this.apps.length - 1 
      : this.currentIndex - 1
    this.startTime = Date.now()
    this.notifyAppChange()
    
    if (this.isPlaying) {
      this.scheduleNext()
    }
  }

  goTo(index: number): void {
    if (index < 0 || index >= this.apps.length) return
    
    this.currentIndex = index
    this.startTime = Date.now()
    this.notifyAppChange()
    
    if (this.isPlaying) {
      this.scheduleNext()
    }
  }

  updateApps(apps: ZoneApp[]): void {
    this.apps = this.sortApps(apps)
    if (this.currentIndex >= this.apps.length) {
      this.currentIndex = 0
    }
    this.notifyAppChange()
  }

  private scheduleNext(): void {
    if (this.timer) {
      clearTimeout(this.timer)
    }
    
    const currentApp = this.apps[this.currentIndex]
    if (!currentApp || currentApp.duration_seconds <= 0) return
    
    this.timer = setTimeout(() => {
      this.next()
    }, currentApp.duration_seconds * 1000)
  }

  private notifyAppChange(): void {
    const currentApp = this.apps[this.currentIndex]
    if (currentApp) {
      this.callbacks.onAppChange?.(currentApp, this.currentIndex)
    }
  }

  destroy(): void {
    this.stop()
    this.apps = []
    this.callbacks = {}
  }
}
