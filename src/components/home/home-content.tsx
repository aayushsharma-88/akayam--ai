'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Camera, Image as ImageIcon, Film, Mic, BarChart2, PenTool, Code2, FileText } from 'lucide-react'
import { InputBar } from '@/components/chat/input-bar'
import { cn } from '@/lib/utils'
import type { AuthUser } from '@/lib/auth/auth.types'

interface HomeContentProps {
  user: AuthUser
}

const QUICK_ACTIONS = [
  { icon: Camera,   label: 'Create Image',     gradient: 'from-violet-500/20 to-cyan-500/20',   color: 'text-violet-400', prompt: 'create a image of ' },
  { icon: ImageIcon,label: 'Analyze Image',    gradient: 'from-blue-500/20 to-cyan-500/20',     color: 'text-blue-400',   prompt: 'analyze this image: ' },
  { icon: Film,     label: 'Generate Video',   gradient: 'from-fuchsia-500/20 to-violet-500/20',color: 'text-fuchsia-400',prompt: 'create a video of ' },
  { icon: Mic,      label: 'Talk to Akayam',   gradient: 'from-cyan-500/20 to-emerald-500/20',  color: 'text-cyan-400',   prompt: 'create a sound for ' },
  { icon: BarChart2,label: 'Analyze Data',     gradient: 'from-yellow-500/20 to-orange-500/20', color: 'text-yellow-400', prompt: 'analyze this data and give me insights: ' },
  { icon: PenTool,  label: 'Write Something',  gradient: 'from-emerald-500/20 to-teal-500/20',  color: 'text-emerald-400',prompt: 'write a ' },
  { icon: Code2,    label: 'Code',             gradient: 'from-indigo-500/20 to-violet-500/20', color: 'text-indigo-400', prompt: 'write code to ' },
  { icon: FileText, label: 'Upload Document',  gradient: 'from-cyan-500/20 to-blue-500/20',     color: 'text-cyan-400',   prompt: 'draft a message like ' },
]

export function HomeContent({ user }: HomeContentProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const firstName = user?.name?.split(' ')[0] ?? ''

  async function handleSubmit(message: string, files?: File[]) {
    if (!message.trim() && !files?.length) return
    setIsSubmitting(true)

    try {
      // Create a new conversation then redirect to it
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: null }),
      })

      if (!res.ok) throw new Error('Failed to create conversation')
      const data = await res.json() as { conversation: { id: string } }
      const convId = data.conversation.id

      // Store the initial message to auto-send after redirect
      sessionStorage.setItem(`pending_msg_${convId}`, message)
      router.push(`/chat/${convId}`)
    } catch {
      setIsSubmitting(false)
    }
  }

  function handleQuickAction(prompt: string) {
    const textarea = document.querySelector('textarea')
    if (textarea) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
      nativeInputValueSetter?.call(textarea, prompt);
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.focus()
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full items-center justify-center p-4 sm:p-8 overflow-y-auto">
      <div className="w-full max-w-3xl flex flex-col items-center gap-8 -mt-12">

        {/* Saraswati Mata + Greeting */}
        <div className="flex flex-col items-center text-center gap-4">
                    <Link href="/devotion/saraswati" className="relative animate-float mt-2 mb-2 group block cursor-pointer transition-transform duration-500 hover:scale-110">
            {/* Soft glowing aura matching Akayam colors */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/40 via-blue-500/30 to-violet-500/40 blur-[50px] rounded-full animate-pulse-glow group-hover:from-amber-400/50 group-hover:via-yellow-500/40 group-hover:to-orange-500/50 transition-colors duration-500" />
            
            {/* mix-blend-screen removes the black background and brightens the white lines */}
            <img 
              src="/saraswati.png" 
              alt="Saraswati Mata" 
              className="w-40 h-40 sm:w-48 sm:h-48 object-contain relative z-10 mix-blend-screen opacity-90 drop-shadow-[0_0_15px_rgba(96,212,245,0.6)] group-hover:drop-shadow-[0_0_25px_rgba(255,215,0,0.8)] transition-all duration-500"
            />
          </Link>

          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mt-1">
            स्वागतम्{firstName ? (
              <>, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">{firstName}</span></>
            ) : null}
          </h1>
          <p className="text-sm text-white/40 max-w-sm mt-1">
            How can Akayam help you today?
          </p>
        </div>

        {/* Input */}
        <div className="w-full">
          <InputBar
            onSubmit={handleSubmit}
            placeholder="Ask Akayam anything..."
            autoFocus
            disabled={isSubmitting}
          />
        </div>

        {/* Quick Actions */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(({ icon: Icon, label, gradient, color, prompt }) => (
            <button
              key={label}
              onClick={() => handleQuickAction(prompt)}
              disabled={isSubmitting}
              className={cn(
                'group relative bg-[#141820] hover:bg-[#1A2030]',
                'border border-white/6 hover:border-white/14',
                'rounded-xl p-4 text-left cursor-pointer transition-all duration-200',
                'flex flex-col gap-2.5 overflow-hidden',
                'disabled:opacity-50 disabled:pointer-events-none'
              )}
            >
              {/* Gradient hover overlay */}
              <div className={cn(
                'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                gradient
              )} />
              <Icon className={cn('w-5 h-5 relative z-10 flex-shrink-0', color)} />
              <span className="text-xs font-medium text-white/60 group-hover:text-white/90 relative z-10 leading-snug">
                {label}
              </span>
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}


