import { requireAuth } from '@/lib/auth/auth-utils'
import { VoiceGenerator } from '@/components/voice/voice-generator'

export default async function VoicePage() {
  await requireAuth()
  
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white/90">Text-to-Voice Generator</h1>
        <p className="mt-2 text-white/60">
          Generate high-quality speech from text using local Kokoro AI. 
          Generations run privately on your device and cost no API credits.
        </p>
      </div>
      
      <VoiceGenerator />
    </div>
  )
}
