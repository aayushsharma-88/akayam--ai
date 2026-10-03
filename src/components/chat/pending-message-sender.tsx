'use client'

import { useEffect, useRef } from 'react'

interface PendingMessageSenderProps {
  conversationId: string
  onSend: (message: string) => void
}

/**
 * Reads a pending message from sessionStorage (set by home screen
 * when creating a new conversation) and fires it immediately.
 */
export function PendingMessageSender({ conversationId, onSend }: PendingMessageSenderProps) {
  const hasFired = useRef(false)

  useEffect(() => {
    if (hasFired.current) return
    const key = `pending_msg_${conversationId}`
    const msg = sessionStorage.getItem(key)
    if (msg) {
      sessionStorage.removeItem(key)
      hasFired.current = true
      // Small delay to let the chat interface fully mount
      setTimeout(() => onSend(msg), 200)
    }
  }, [conversationId, onSend])

  return null
}
