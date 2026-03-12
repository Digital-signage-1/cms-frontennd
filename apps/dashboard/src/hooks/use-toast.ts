import { useState, useCallback } from 'react'

export type ToastVariant = 'default' | 'error' | 'success'

export interface Toast {
  id: string
  title?: string
  description: string
  variant: ToastVariant
}

let toastListeners: Array<(toast: Toast) => void> = []
let toastCount = 0

function dispatch(toast: Toast) {
  toastListeners.forEach((listener) => listener(toast))
}

export function toast(description: string, variant: ToastVariant = 'default') {
  dispatch({ id: String(++toastCount), description, variant })
}

toast.error = (description: string) => toast(description, 'error')
toast.success = (description: string) => toast(description, 'success')

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((t: Toast) => {
    setToasts((prev) => [...prev, t])
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== t.id))
    }, 5000)
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const subscribe = useCallback(() => {
    toastListeners.push(addToast)
    return () => {
      toastListeners = toastListeners.filter((l) => l !== addToast)
    }
  }, [addToast])

  return { toasts, dismiss, subscribe }
}
