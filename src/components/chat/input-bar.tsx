'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Paperclip, Mic, Send, Image as ImageIcon, X, Square } from 'lucide-react'
import { cn, formatFileSize } from '@/lib/utils'

interface InputBarProps {
  onSubmit: (message: string, files?: File[]) => void
  onStop?: () => void
  placeholder?: string
  disabled?: boolean
  autoFocus?: boolean
  isStreaming?: boolean
}

export function InputBar({
  onSubmit,
  onStop,
  placeholder = 'Ask Akayam anything...',
  disabled = false,
  autoFocus = false,
  isStreaming = false,
}: InputBarProps) {
  const [input, setInput] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autoFocus])

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [])

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    resizeTextarea()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    const text = input.trim()
    if ((!text && files.length === 0) || disabled) return
    onSubmit(text, files.length > 0 ? files : undefined)
    setInput('')
    setFiles([])
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const newFiles = Array.from(e.target.files)
    setFiles(prev => [...prev, ...newFiles].slice(0, 5)) // max 5 files
    e.target.value = ''
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleMic = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser.')
      return
    }
    // @ts-expect-error — browser STT API
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new Recognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false

    recognition.onstart = () => setIsRecording(true)
    recognition.onend = () => setIsRecording(false)
    recognition.onerror = () => setIsRecording(false)
    recognition.onresult = (e: { results: { transcript: string }[][] }) => {
      const transcript: string = e.results[0][0].transcript
      setInput(prev => (prev ? prev + ' ' + transcript : transcript))
      setTimeout(resizeTextarea, 0)
    }
    recognition.start()
  }

  const canSend = (input.trim().length > 0 || files.length > 0) && !disabled

  return (
    <div className="relative w-full">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,.csv,.json,.xlsx"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Rainbow glow */}
      <div className={cn(
        'absolute -inset-[1.5px] rounded-2xl transition-all duration-500 pointer-events-none',
        'bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500',
        isFocused ? 'opacity-50 blur-sm' : 'opacity-15 blur-[2px] group-hover:opacity-25'
      )} />

      <div className="relative bg-[#0E1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden focus-within:border-white/20 transition-colors">
        {/* File previews */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pt-3">
            {files.map((file, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-white/6 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white/70 max-w-[180px]">
                <span className="truncate">{file.name}</span>
                <span className="text-white/30 flex-shrink-0">({formatFileSize(file.size)})</span>
                <button onClick={() => removeFile(i)} className="text-white/40 hover:text-white ml-1 flex-shrink-0">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          className="w-full bg-transparent text-white placeholder:text-white/25 resize-none px-4 pt-4 pb-2 outline-none overflow-y-auto text-[15px] leading-relaxed"
          style={{ minHeight: '56px', maxHeight: '200px' }}
        />

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between px-3 pb-3 pt-1">
          <div className="flex items-center gap-0.5">
            <ToolBtn
              icon={<Paperclip size={17} />}
              label="Attach file"
              disabled={disabled}
              onClick={() => fileInputRef.current?.click()}
            />
            <ToolBtn
              icon={<ImageIcon size={17} />}
              label="Upload image"
              disabled={disabled}
              onClick={() => imageInputRef.current?.click()}
            />
            <ToolBtn
              icon={<Mic size={17} className={isRecording ? 'text-red-400' : ''} />}
              label={isRecording ? 'Listening…' : 'Voice input'}
              disabled={disabled}
              onClick={handleMic}
            />
          </div>

          {isStreaming && onStop ? (
            <button
              onClick={onStop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/8 border border-white/10 text-white/70 hover:text-white hover:bg-white/12 text-xs transition-all"
            >
              <Square size={12} className="fill-current" />
              Stop
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canSend}
              className={cn(
                'p-2.5 rounded-xl flex items-center justify-center transition-all duration-200',
                canSend
                  ? 'bg-gradient-to-br from-cyan-500 to-violet-600 text-white hover:brightness-110 shadow-lg shadow-cyan-500/20 hover:scale-105'
                  : 'bg-white/5 text-white/20 cursor-not-allowed'
              )}
            >
              <Send size={16} className={canSend ? 'translate-x-px' : ''} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ToolBtn({ icon, label, disabled, onClick }: {
  icon: React.ReactNode
  label: string
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={label}
      className="p-2 text-white/35 hover:text-white/70 hover:bg-white/5 rounded-xl transition-colors disabled:opacity-40 disabled:pointer-events-none"
    >
      {icon}
    </button>
  )
}
