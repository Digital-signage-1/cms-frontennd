import { useState, useEffect, useRef, useMemo } from 'react'
import type { Slide } from '@signage/types'

interface SlideSchedulerResult {
  currentSlideIndex: number
  currentSlide: Slide | null
}

export function useSlideScheduler(
  slides: Slide[] | null,
  isPreview: boolean
): SlideSchedulerResult {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Stable identity for the slides list — only changes when actual slide IDs change
  const slidesKey = useMemo(
    () => slides?.map((s) => s.slide_id).join(',') ?? '',
    [slides]
  )

  // Reset index when the actual slides change (not just array reference)
  useEffect(() => {
    setCurrentSlideIndex(0)
  }, [slidesKey])

  // Store slides in a ref so the timer effect doesn't depend on the array reference
  const slidesRef = useRef(slides)
  slidesRef.current = slides

  // Slide cycling timer — only depends on currentSlideIndex, slidesKey, and isPreview
  useEffect(() => {
    const currentSlides = slidesRef.current
    if (!currentSlides || currentSlides.length <= 1 || isPreview) return

    const slide = currentSlides[currentSlideIndex]
    if (!slide) return

    const durationMs = slide.duration_seconds * 1000
    if (durationMs <= 0) return

    console.log(
      `[SlideScheduler] Slide ${currentSlideIndex}/${currentSlides.length - 1} — ${slide.zones.length} zones, next in ${slide.duration_seconds}s`
    )

    timerRef.current = setTimeout(() => {
      setCurrentSlideIndex((prev) => {
        const len = slidesRef.current?.length ?? 1
        return (prev + 1) % len
      })
    }, durationMs)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [currentSlideIndex, slidesKey, isPreview])

  const currentSlide = slides?.[currentSlideIndex] ?? null

  return { currentSlideIndex, currentSlide }
}
