'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Copy, RefreshCw, ThumbsUp, ThumbsDown, Volume2, Check, Loader2, Square } from 'lucide-react'
import { MarkdownRenderer } from './markdown-renderer'
import { cn } from '@/lib/utils'

interface Msg {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
  isStreaming?: boolean
  isError?: boolean
}

interface ChatMessageProps {
  message: Msg
  onCopy?: () => void
  onRegenerate?: () => void
}

export function ChatMessage({ message, onCopy, onRegenerate }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)
  
  // TTS State
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSpeakingLoading, setIsSpeakingLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [])

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(message.content).catch(() => {})
    setCopied(true)
    onCopy?.()
    setTimeout(() => setCopied(false), 2000)
  }, [message.content, onCopy])

  const handleSpeak = async () => {
    if (isSpeaking && audioRef.current) {
      audioRef.current.pause()
      setIsSpeaking(false)
      return
    }

    // Check if we already have the audio loaded in the ref
    if (audioRef.current && audioRef.current.src) {
      audioRef.current.play()
      setIsSpeaking(true)
      return
    }

    try {
      setIsSpeakingLoading(true)
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messageId: message.id,
          text: message.content 
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'TTS failed')
      }

      const { url } = await res.json()
      
      const audio = new Audio(url)
      audioRef.current = audio
      
      audio.onended = () => setIsSpeaking(false)
      audio.onerror = () => {
        setIsSpeaking(false)
        console.error('Audio playback error')
      }
      
      await audio.play()
      setIsSpeaking(true)
    } catch (err) {
      console.error(err)
      // Fallback to browser synthesis if API fails or no credits
      if ('speechSynthesis' in window) {
        const cleanText = message.content
          .replace(/<[^>]+>/g, '')
          .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
          .replace(/[*_~`#]/g, '')
          .replace(/\n+/g, ' ')
          .trim()

        if (cleanText) {
          const utt = new SpeechSynthesisUtterance(cleanText)
          utt.onend = () => setIsSpeaking(false)
          setIsSpeaking(true)
          window.speechSynthesis.speak(utt)
        } else {
          setIsSpeaking(false)
        }
      }
    } finally {
      setIsSpeakingLoading(false)
    }
  }

  if (isUser) {
    return (
      <div className="flex justify-end w-full">
        <div className="max-w-[80%] sm:max-w-[70%] px-4 py-3 rounded-2xl rounded-br-md bg-[#1C2433] border border-white/8 text-white/90 text-[15px] leading-relaxed shadow-sm">
          {message.content}
        </div>
      </div>
    )
  }

  // AI message
  return (
    <div className="flex gap-3 w-full group">
      {/* Akayam avatar */}
      <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center mt-0.5 relative">
        {/* Subtle glow behind the avatar matching the golden theme */}
        <div className="absolute inset-0 bg-yellow-500/10 rounded-full blur-[6px]" />
        <img 
          src="/ai-avatar.png" 
          alt="Akayam" 
          className="w-10 h-10 object-contain relative z-10 mix-blend-screen scale-125 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]"
        />
      </div>

      <div className="flex-1 min-w-0">
        {/* Content */}
        <div className={cn(
          'text-[15px] leading-relaxed',
          message.isError ? 'text-red-400' : 'text-white/90'
        )}>
          {message.isStreaming && message.content === '' ? (
            // Blinking cursor while waiting for first token
            <span className="inline-flex items-center gap-1 text-white/40 text-sm">
              <span className="animate-pulse">●</span>
              <span className="animate-pulse delay-150">●</span>
              <span className="animate-pulse delay-300">●</span>
            </span>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
          {/* Streaming cursor at end of text */}
          {message.isStreaming && message.content !== '' && (
            <span className="inline-block w-0.5 h-4 bg-cyan-400 animate-blink ml-0.5 align-middle" />
          )}
        </div>

        {/* Actions — visible on hover (always on mobile) */}
        {!message.isStreaming && !message.isError && message.content && (
          <div className="flex items-center gap-0.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <ActionBtn
              icon={copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              label={copied ? 'Copied!' : 'Copy'}
              onClick={handleCopy}
            />
            {onRegenerate && (
              <ActionBtn icon={<RefreshCw size={13} />} label="Regenerate" onClick={onRegenerate} />
            )}
            <div className="w-px h-3 bg-white/10 mx-0.5" />
            <ActionBtn
              icon={<ThumbsUp size={13} className={feedback === 'up' ? 'text-cyan-400' : ''} />}
              label="Helpful"
              onClick={() => setFeedback(f => f === 'up' ? null : 'up')}
              active={feedback === 'up'}
            />
            <ActionBtn
              icon={<ThumbsDown size={13} className={feedback === 'down' ? 'text-red-400' : ''} />}
              label="Not helpful"
              onClick={() => setFeedback(f => f === 'down' ? null : 'down')}
              active={feedback === 'down'}
            />
            <div className="w-px h-3 bg-white/10 mx-0.5" />
            <ActionBtn 
              icon={
                isSpeakingLoading ? <Loader2 size={13} className="animate-spin text-cyan-400" /> :
                isSpeaking ? <Square size={13} className="text-cyan-400 fill-cyan-400/20" /> : 
                <Volume2 size={13} />
              } 
              label={isSpeaking ? "Stop reading" : "Read aloud"} 
              onClick={handleSpeak}
              active={isSpeaking}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function ActionBtn({ icon, label, onClick, active }: {
  icon: React.ReactNode
  label: string
  onClick?: () => void
  active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        'p-1.5 rounded-md transition-colors text-white/35 hover:text-white/80 hover:bg-white/6',
        active && 'text-white/70 bg-white/8'
      )}
    >
      {icon}
    </button>
  )
}
