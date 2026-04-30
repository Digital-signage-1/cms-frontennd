import { useEffect, useRef } from 'react'

export interface AutoScrollOptions {
  autoScroll?: boolean
  scrollSpeed?: 'slow' | 'medium' | 'fast'
  pauseDuration?: number
  startDelay?: number
}

export function useAutoScroll(options: AutoScrollOptions = {}) {
  const {
    autoScroll = false,
    scrollSpeed = 'medium',
    pauseDuration = 3000,
    startDelay = 2000,
  } = options

  const scrollRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number | null>(null)

  useEffect(() => {
    if (!autoScroll) return
    
    const el = scrollRef.current
    if (!el) return

    const pxPerFrame = scrollSpeed === 'slow' ? 0.5 : scrollSpeed === 'fast' ? 2 : 1
    let scrollY = 0
    let lastTime = performance.now()
    let paused = false
    let timeout: any = null

    const step = (time: number) => {
      if (paused) {
        animRef.current = requestAnimationFrame(step)
        return
      }

      const delta = (time - lastTime) / (1000 / 60) // Normalize to 60fps
      lastTime = time

      scrollY += pxPerFrame * delta
      
      const maxScroll = el.scrollHeight - el.clientHeight
      if (maxScroll <= 0) return

      if (scrollY >= maxScroll) {
        scrollY = maxScroll
        el.scrollTop = scrollY
        paused = true
        timeout = setTimeout(() => {
          el.scrollTo({ top: 0, behavior: 'smooth' })
          timeout = setTimeout(() => {
            scrollY = 0
            paused = false
            lastTime = performance.now()
          }, 1000)
        }, pauseDuration)
      } else {
        el.scrollTop = scrollY
      }

      animRef.current = requestAnimationFrame(step)
    }

    // Initial delay
    timeout = setTimeout(() => {
      lastTime = performance.now()
      animRef.current = requestAnimationFrame(step)
    }, startDelay)

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      if (timeout) clearTimeout(timeout)
    }
  }, [autoScroll, scrollSpeed, pauseDuration, startDelay])

  return scrollRef
}
