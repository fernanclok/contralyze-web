"use client"

import { useEffect, useState } from "react"
import { emmiter } from "@/lib/emmiter"
import { CheckCircle, XCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type ToastType = "success" | "error"

interface ToastProps {
  message: string
  type: ToastType
  id: string
  onClose: (id: string) => void
}

function Toast({ message, type, id, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onClose(id), 300) // Wait for animation to complete
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose, id])

  const handleClose = () => {
    setVisible(false)
    setTimeout(() => onClose(id), 300)
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 rounded-lg shadow-lg backdrop-blur-sm border",
        "transform transition-all duration-300 ease-in-out",
        "max-w-sm w-full",
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        type === "success" ? "bg-green-500/95 border-green-600 text-white" : "bg-red-500/95 border-red-600 text-white",
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="shrink-0">
        {type === "success" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
      </div>
      <div className="text-sm font-medium flex-1">{message}</div>
      <button
        onClick={handleClose}
        className="shrink-0 rounded-full p-1 hover:bg-white/20 transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<
    Array<{
      id: string
      message: string
      type: ToastType
    }>
  >([])

  useEffect(() => {
    const handler = (event: { message: string; type: "error" | "success" | "warning" | "info"; duration?: number }) => {
      if (event.type === "error" || event.type === "success") {
        const newToast = {
          id: Date.now().toString(),
          message: event.message,
          type: event.type,
        }

        setToasts((prev) => [...prev, newToast])
      }
    }

    emmiter.on("showToast", handler)
    return () => emmiter.off("showToast", handler)
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-0 right-0 p-4 z-50 flex flex-col gap-3 max-h-screen overflow-hidden">
      {toasts.map((toast) => (
        <Toast key={toast.id} id={toast.id} message={toast.message} type={toast.type} onClose={removeToast} />
      ))}
    </div>
  )
}

