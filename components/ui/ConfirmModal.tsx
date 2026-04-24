import React from 'react'

export interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  isDanger?: boolean
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDanger = false,
}: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-[32px] p-6 sm:p-8 max-w-md w-full">
        <h3 className="text-xl font-bold text-charcoal mb-2">{title}</h3>
        <p className="text-charcoal/70 mb-8 leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-3 rounded-2xl glass border-charcoal/5 text-charcoal hover:bg-black/5 font-semibold transition-all hover:-translate-y-0.5"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-3 rounded-2xl font-semibold text-white transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
              isDanger 
                ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' 
                : 'bg-orange hover:bg-orange/90 shadow-orange/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
