'use client'

import { useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Mic, Play, Square, Download, RefreshCw, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const VOICES = [
  { id: 'af_heart', name: 'Heart (US Female)' },
  { id: 'af_bella', name: 'Bella (US Female)' },
  { id: 'af_nicole', name: 'Nicole (US Female)' },
  { id: 'af_nova', name: 'Nova (US Female)' },
  { id: 'af_sarah', name: 'Sarah (US Female)' },
  { id: 'am_michael', name: 'Michael (US Male)' },
  { id: 'am_fenrir', name: 'Fenrir (US Male)' },
  { id: 'am_puck', name: 'Puck (US Male)' },
  { id: 'am_echo', name: 'Echo (US Male)' },
  { id: 'bf_emma', name: 'Emma (UK Female)' },
  { id: 'bf_isabella', name: 'Isabella (UK Female)' },
  { id: 'bm_george', name: 'George (UK Male)' },
  { id: 'bm_fable', name: 'Fable (UK Male)' },
]

export function VoiceGenerator() {
  const [text, setText] = useState('')
  const [voice, setVoice] = useState('af_heart')
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handleGenerate = async () => {
    if (!text.trim()) return

    setIsGenerating(true)
    setError(null)
    setAudioUrl(null)
    setIsPlaying(false)

    try {
      const res = await fetch('/api/voice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate voice')
      }

      setAudioUrl(data.url)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleDownload = () => {
    if (!audioUrl) return
    const a = document.createElement('a')
    a.href = audioUrl
    a.download = `voice-${voice}-${Date.now()}.wav`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleClear = () => {
    setText('')
    setAudioUrl(null)
    setError(null)
    setIsPlaying(false)
  }

  return (
    <Card className="p-6 bg-[#0E1525] border-white/10">
      <div className="space-y-6">
        
        {/* Input Area */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80">Text to Speak</label>
          <Textarea 
            placeholder="Type or paste something here..."
            className="min-h-[150px] resize-none bg-[#161E2E] border-white/10 text-white placeholder:text-white/30 focus-visible:ring-cyan-500/50"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={2000}
            disabled={isGenerating}
          />
          <div className="flex justify-between items-center text-xs text-white/40">
            <span>Max 2000 characters for local generation</span>
            <span>{text.length} / 2000</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-2 flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-white/80">Voice Model</label>
            <select
              className="w-full h-10 px-3 rounded-md bg-[#161E2E] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-colors"
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              disabled={isGenerating}
            >
              {VOICES.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={!text.trim() || isGenerating}
            className="bg-cyan-600 hover:bg-cyan-500 text-white min-w-[140px]"
          >
            {isGenerating ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
            ) : (
              <><Mic className="w-4 h-4 mr-2" /> Generate Voice</>
            )}
          </Button>

          <Button 
            variant="ghost" 
            onClick={handleClear}
            disabled={isGenerating || (!text && !audioUrl)}
            className="text-white/60 hover:text-white hover:bg-white/5"
            title="Clear all"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Output Player */}
        {audioUrl && (
          <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
            <h3 className="text-sm font-medium text-white/80">Generated Audio</h3>
            
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#161E2E] border border-white/5">
              <Button
                size="icon"
                onClick={handlePlayPause}
                className="w-12 h-12 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white shrink-0 shadow-lg shadow-cyan-900/20"
              >
                {isPlaying ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-1 fill-current" />}
              </Button>
              
              <div className="flex-1">
                {/* Hidden native audio element to handle exact native events */}
                <audio 
                  ref={audioRef}
                  src={audioUrl} 
                  onEnded={() => setIsPlaying(false)}
                  onPause={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  className="hidden" 
                />
                
                {/* Visualizer mock or simple text */}
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className={cn(
                    "h-full bg-cyan-500 rounded-full transition-all duration-300 w-0",
                    isPlaying ? "w-full opacity-100 animate-pulse" : "w-full opacity-30"
                  )} />
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button variant="ghost" size="icon" onClick={handleDownload} className="text-white/60 hover:text-white" title="Download WAV">
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleGenerate} className="text-white/60 hover:text-white" title="Generate Again">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
