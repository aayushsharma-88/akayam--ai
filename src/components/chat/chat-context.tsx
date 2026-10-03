'use client'

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'

export interface Message {
  id: string
  conversationId: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  isStreaming?: boolean
  isError?: boolean
}

interface ChatContextValue {
  messages: Message[]
  isLoading: boolean
  isStreaming: boolean
  sendMessage: (message: string, imageUrls?: string[]) => Promise<void>
  regenerate: () => Promise<void>
  stopStreaming: () => void
  conversationId: string | null
  setConversationId: (id: string | null) => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

export function ChatProvider({
  children,
  initialMessages = [],
  initialConversationId = null,
}: {
  children: ReactNode
  initialMessages?: Message[]
  initialConversationId?: string | null
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId)
  const abortRef = useRef<AbortController | null>(null)
  const lastUserMessageRef = useRef<{ message: string; imageUrls?: string[] } | null>(null)

  const sendMessage = useCallback(
    async (message: string, imageUrls?: string[]) => {
      if (!conversationId || isLoading) return

      lastUserMessageRef.current = { message, imageUrls }

      // Add user message optimistically
      const userMsg: Message = {
        id: `temp-user-${Date.now()}`,
        conversationId,
        role: 'user',
        content: message,
        createdAt: new Date().toISOString(),
      }

      // Add streaming AI placeholder
      const aiMsgId = `temp-ai-${Date.now()}`
      const aiMsg: Message = {
        id: aiMsgId,
        conversationId,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
        isStreaming: true,
      }

      setMessages(prev => [...prev, userMsg, aiMsg])
      setIsLoading(true)
      setIsStreaming(true)

      abortRef.current = new AbortController()

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId, message, imageUrls }),
          signal: abortRef.current.signal,
        })

        if (!response.ok) {
          const error = await response.json().catch(() => ({})) as { error?: string }
          throw new Error(error.error ?? 'Chat request failed')
        }

        const reader = response.body?.getReader()
        if (!reader) throw new Error('No stream reader')

        const decoder = new TextDecoder()
        let fullContent = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n').filter(l => l.startsWith('data: '))

          for (const line of lines) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') break

            try {
              const parsed = JSON.parse(data) as { content: string; error?: boolean }
              fullContent += parsed.content

              setMessages(prev =>
                prev.map(m =>
                  m.id === aiMsgId
                    ? { ...m, content: fullContent, isError: parsed.error }
                    : m
                )
              )
            } catch {
              // Skip malformed chunks
            }
          }
        }

        // Mark streaming done
        setMessages(prev =>
          prev.map(m =>
            m.id === aiMsgId ? { ...m, isStreaming: false } : m
          )
        )
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // User stopped generation
          setMessages(prev =>
            prev.map(m =>
              m.id === aiMsgId
                ? { ...m, content: m.content || '(Generation stopped)', isStreaming: false }
                : m
            )
          )
        } else {
          const errMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
          setMessages(prev =>
            prev.map(m =>
              m.id === aiMsgId
                ? { ...m, content: errMessage, isStreaming: false, isError: true }
                : m
            )
          )
        }
      } finally {
        setIsLoading(false)
        setIsStreaming(false)
        abortRef.current = null
      }
    },
    [conversationId, isLoading]
  )

  const regenerate = useCallback(async () => {
    if (!lastUserMessageRef.current) return
    // Remove last AI message and re-send last user message
    setMessages(prev => {
      const lastAiIdx = [...prev].reverse().findIndex(m => m.role === 'assistant')
      if (lastAiIdx === -1) return prev
      return prev.slice(0, prev.length - 1 - lastAiIdx)
    })
    const { message, imageUrls } = lastUserMessageRef.current
    await sendMessage(message, imageUrls)
  }, [sendMessage])

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  return (
    <ChatContext.Provider
      value={{
        messages,
        isLoading,
        isStreaming,
        sendMessage,
        regenerate,
        stopStreaming,
        conversationId,
        setConversationId,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChatContext must be used within ChatProvider')
  return ctx
}
