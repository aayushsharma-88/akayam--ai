'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { InputBar } from './input-bar'
import { ChatMessage } from './message'
import { PendingMessageSender } from './pending-message-sender'
import { ButterflyAnimation } from '@/components/animations/butterfly'
import { AkayamLogo } from '@/components/brand/logo'
import type { AuthUser } from '@/lib/auth/auth.types'

interface RawMessage {
  id: string
  role: string
  content: string
  createdAt: string | Date
  contentType?: string
}

interface RawConversation {
  id: string
  title: string | null
  messages: RawMessage[]
}

interface ChatInterfaceProps {
  conversation: RawConversation
  user: AuthUser
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
  isStreaming?: boolean
  isError?: boolean
}

function normaliseRole(role: string): 'user' | 'assistant' {
  return role.toLowerCase() === 'user' ? 'user' : 'assistant'
}

export function ChatInterface({ conversation, user }: ChatInterfaceProps) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>(() =>
    conversation.messages.map(m => ({
      id: m.id,
      role: normaliseRole(m.role),
      content: m.content,
      createdAt: new Date(m.createdAt),
    }))
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const lastUserMsgRef = useRef<string>('')

  // Scroll to bottom — but only if user hasn't scrolled up
  const scrollToBottom = useCallback((force = false) => {
    const el = scrollAreaRef.current
    if (!el) return
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120
    if (force || isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      // Fallback for some browsers to ensure it pushes all the way down
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
        }
      }, 100)
    }
  }, [])

  useEffect(() => {
    scrollToBottom(true)
  }, []) // only on mount

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const sendMessage = useCallback(async (content: string, files?: File[]) => {
    if (isLoading || !content.trim()) return
    lastUserMsgRef.current = content.trim()

    const userMsgId = `user-${Date.now()}`
    const aiMsgId = `ai-${Date.now()}`

    // Optimistic user message
    setMessages(prev => [
      ...prev,
      { id: userMsgId, role: 'user', content: content.trim(), createdAt: new Date() },
      { id: aiMsgId, role: 'assistant', content: '', createdAt: new Date(), isStreaming: true },
    ])
    setIsLoading(true)
    setIsStreaming(true)
    scrollToBottom(true)

    abortRef.current = new AbortController()

      try {
      const imageUrls: string[] = []
      
      if (files && files.length > 0) {
        for (const file of files) {
          const formData = new FormData()
          formData.append('file', file)
          const uploadRes = await fetch('/api/files/upload', {
            method: 'POST',
            body: formData,
            signal: abortRef.current.signal,
          })
          if (uploadRes.ok) {
            const data = await uploadRes.json()
            imageUrls.push(data.url)
          }
        }
      }

      const payload: { conversationId: string; message: string; imageUrls?: string[] } = {
        conversationId: conversation.id,
        message: content.trim(),
      }
      if (imageUrls.length > 0) {
        payload.imageUrls = imageUrls
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(errData.error ?? `Request failed (${res.status})`)
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response stream')

      const decoder = new TextDecoder()
      let fullText = ''
      let buffer = ''
      let streamDone = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        // Accumulate into buffer to handle chunks split across network reads
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        // Keep the last (possibly incomplete) line in the buffer
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') { streamDone = true; break }
          try {
            const parsed = JSON.parse(data) as { content: string; error?: boolean }
            fullText += parsed.content
            setMessages(prev =>
              prev.map(m => m.id === aiMsgId
                ? { ...m, content: fullText, isError: parsed.error }
                : m
              )
            )
          } catch { /* skip malformed chunk */ }
        }
        if (streamDone) break
      }

      setMessages(prev =>
        prev.map(m => m.id === aiMsgId ? { ...m, isStreaming: false } : m)
      )

      // Refresh sidebar conversation list
      router.refresh()
    } catch (err) {
      const isAbort = err instanceof Error && err.name === 'AbortError'
      const errText = isAbort
        ? '(Generation stopped)'
        : err instanceof Error ? err.message : 'Something went wrong. Please try again.'

      setMessages(prev =>
        prev.map(m => m.id === aiMsgId
          ? { ...m, content: errText, isStreaming: false, isError: !isAbort }
          : m
        )
      )
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
      abortRef.current = null
    }
  }, [conversation.id, isLoading, router, scrollToBottom])

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const regenerate = useCallback(async () => {
    if (isLoading || !lastUserMsgRef.current) return
    // Remove last assistant message then resend
    setMessages(prev => {
      const idx = [...prev].reverse().findIndex(m => m.role === 'assistant')
      if (idx === -1) return prev
      return prev.slice(0, prev.length - 1 - idx)
    })
    await sendMessage(lastUserMsgRef.current)
  }, [isLoading, sendMessage])

  const copyMessage = useCallback(async (content: string) => {
    await navigator.clipboard.writeText(content).catch(() => {})
  }, [])

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#080A0F] relative">
      {/* Auto-send pending message from home screen */}
      <PendingMessageSender conversationId={conversation.id} onSend={sendMessage} />

      {/* Top fade */}
      <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-[#080A0F] to-transparent z-10 pointer-events-none" />

      {/* Messages */}
      <div
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 pb-48 pt-8"
      >
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center mt-24 gap-4 text-center">
              <AkayamLogo size="md" showText={false} />
              <p className="text-sm text-white/30">Send a message to begin</p>
            </div>
          )}

          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onCopy={() => copyMessage(msg.content)}
              onRegenerate={msg.role === 'assistant' && !msg.isStreaming ? regenerate : undefined}
            />
          ))}

          {/* Butterfly thinking animation when waiting for first token */}
          {isLoading && messages[messages.length - 1]?.content === '' && (
            <div className="flex gap-3 w-full group">
              <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center mt-0.5 relative">
                <div className="absolute inset-0 bg-yellow-500/10 rounded-full blur-[6px]" />
                <img 
                  src="/ai-avatar.png" 
                  alt="Akayam" 
                  className="w-10 h-10 object-contain relative z-10 mix-blend-screen scale-125 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]"
                />
              </div>
              <div className="pt-2 pl-1">
                <ButterflyAnimation state="thinking" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-2" />
        </div>
      </div>

      {/* Input overlay */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#080A0F] via-[#080A0F]/95 to-transparent pt-12 pb-5 px-4 sm:px-6 z-20">
        <div className="max-w-3xl mx-auto w-full">
          <InputBar
            onSubmit={sendMessage}
            onStop={isStreaming ? stopStreaming : undefined}
            placeholder="Message Akayam..."
            disabled={isLoading && !isStreaming}
            isStreaming={isStreaming}
          />
          <p className="text-center mt-2 text-[11px] text-white/20">
            Akayam AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  )
}
