"use client"

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  type?: "info" | "warning" | "error" | "success"
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  type = "info",
}: ConfirmModalProps) {
  if (!isOpen) return null

  const colorMap = {
    info: "border-cyan-500 shadow-cyan-500/50",
    warning: "border-yellow-500 shadow-yellow-500/50",
    error: "border-red-500 shadow-red-500/50",
    success: "border-green-500 shadow-green-500/50",
  }

  const titleColorMap = {
    info: "text-cyan-400",
    warning: "text-yellow-400",
    error: "text-red-400",
    success: "text-green-400",
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className={`bg-slate-900 border-2 rounded-lg p-8 max-w-md w-full shadow-lg ${colorMap[type]}`}>
        <h2 className={`text-xl font-bold mb-2 ${titleColorMap[type]}`}>{title}</h2>
        <p className="text-slate-300 mb-4">{message}</p>
        {description && <p className="text-sm text-slate-400 mb-6">{description}</p>}

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-slate-950 font-bold rounded hover:shadow-lg hover:shadow-cyan-500/50 transition"
          >
            {confirmText}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 font-bold rounded hover:bg-slate-700 transition"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  )
}
