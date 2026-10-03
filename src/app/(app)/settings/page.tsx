'use client'

import { useState, useEffect, FormEvent } from 'react'
import { User, Palette, Cpu, Mic, Brain, Shield, ChevronRight, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Tab = 'account' | 'appearance' | 'ai' | 'voice' | 'memory' | 'privacy'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'account',    label: 'Account',     icon: User    },
  { id: 'appearance', label: 'Appearance',  icon: Palette },
  { id: 'ai',         label: 'AI Settings', icon: Cpu     },
  { id: 'voice',      label: 'Voice',       icon: Mic     },
  { id: 'memory',     label: 'Memory',      icon: Brain   },
  { id: 'privacy',    label: 'Privacy',     icon: Shield  },
]

interface Prefs {
  theme?: string
  defaultModel?: string
  voiceEnabled?: boolean
  voiceId?: string
  voiceSpeed?: number
  memoryEnabled?: boolean
  animationLevel?: string
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('account')
  const [prefs, setPrefs] = useState<Prefs>({})
  const [profile, setProfile] = useState({ name: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/user/settings').then(r => r.ok ? r.json() as Promise<{ preferences?: Prefs }> : Promise.resolve({ preferences: undefined })),
      fetch('/api/user/profile').then(r => r.ok ? r.json() as Promise<{ user?: { name: string; email: string } }> : Promise.resolve({ user: undefined })),
    ]).then(([settingsData, profileData]) => {
      if (settingsData?.preferences) setPrefs(settingsData.preferences)
      if (profileData?.user) setProfile({ name: profileData.user.name ?? '', email: profileData.user.email ?? '' })
    }).catch(() => {})
  }, [])

  async function save(updates: Partial<Prefs> = {}) {
    setLoading(true)
    setSaved(false)
    try {
      await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...prefs, ...updates }),
      })
      setPrefs(p => ({ ...p, ...updates }))
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  async function saveProfile(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profile.name }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  return (
    <div className="flex h-full overflow-hidden bg-[#080A0F]">
      {/* Left tabs */}
      <aside className="w-56 flex-shrink-0 border-r border-white/6 p-4 flex flex-col gap-1">
        <p className="text-xs font-semibold text-white/30 uppercase tracking-wider px-3 mb-3">Settings</p>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all w-full text-left',
              tab === id
                ? 'bg-white/8 text-white border border-white/10'
                : 'text-white/50 hover:text-white hover:bg-white/4'
            )}
          >
            <Icon size={15} />
            {label}
            {tab === id && <ChevronRight size={13} className="ml-auto opacity-40" />}
          </button>
        ))}
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-2xl">

          {/* ACCOUNT */}
          {tab === 'account' && (
            <Section title="Account" desc="Manage your name and email address">
              <form onSubmit={saveProfile} className="space-y-4">
                <Field label="Full name">
                  <Input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} placeholder="Your name" />
                </Field>
                <Field label="Email address">
                  <Input value={profile.email} disabled className="opacity-50 cursor-not-allowed" />
                  <p className="text-xs text-white/30 mt-1">Email cannot be changed here.</p>
                </Field>
                <SaveBtn loading={loading} saved={saved} />
              </form>
            </Section>
          )}

          {/* APPEARANCE */}
          {tab === 'appearance' && (
            <Section title="Appearance" desc="Customize how Akayam looks">
              <Field label="Theme">
                <div className="flex gap-3">
                  {['dark', 'system'].map(t => (
                    <button
                      key={t}
                      onClick={() => save({ theme: t })}
                      className={cn(
                        'flex-1 py-3 rounded-xl border text-sm font-medium transition-all capitalize',
                        prefs.theme === t || (!prefs.theme && t === 'dark')
                          ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                          : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white/70'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Animation level">
                <div className="flex gap-3">
                  {['full', 'reduced', 'none'].map(level => (
                    <button
                      key={level}
                      onClick={() => save({ animationLevel: level })}
                      className={cn(
                        'flex-1 py-2.5 rounded-xl border text-sm transition-all capitalize',
                        prefs.animationLevel === level || (!prefs.animationLevel && level === 'full')
                          ? 'border-violet-500/50 bg-violet-500/10 text-violet-300'
                          : 'border-white/10 text-white/50 hover:text-white/70'
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </Field>
            </Section>
          )}

          {/* AI */}
          {tab === 'ai' && (
            <Section title="AI Settings" desc="Configure your default AI model and behaviour">
              <Field label="Default model">
                <div className="flex flex-col gap-2">
                  {['gemini-3.8-flash', 'gemini-3.8-pro'].map(model => (
                    <button
                      key={model}
                      onClick={() => save({ defaultModel: model })}
                      className={cn(
                        'flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all text-left',
                        prefs.defaultModel === model || (!prefs.defaultModel && model === 'gemini-3.8-flash')
                          ? 'border-cyan-500/40 bg-cyan-500/8 text-white'
                          : 'border-white/8 text-white/60 hover:border-white/15 hover:text-white/80'
                      )}
                    >
                      <span>{model}</span>
                      {(prefs.defaultModel === model || (!prefs.defaultModel && model === 'gemini-3.8-flash')) && (
                        <Check size={14} className="text-cyan-400" />
                      )}
                    </button>
                  ))}
                </div>
              </Field>
            </Section>
          )}

          {/* VOICE */}
          {tab === 'voice' && (
            <Section title="Voice" desc="Configure voice input and text-to-speech">
              <Toggle
                label="Enable voice"
                desc="Allow Akayam to speak responses aloud"
                checked={prefs.voiceEnabled ?? false}
                onChange={v => save({ voiceEnabled: v })}
              />
              <Field label="Voice speed">
                <input
                  type="range" min={0.5} max={2} step={0.1}
                  value={prefs.voiceSpeed ?? 1}
                  onChange={e => setPrefs(p => ({ ...p, voiceSpeed: parseFloat(e.target.value) }))}
                  onMouseUp={() => save({ voiceSpeed: prefs.voiceSpeed })}
                  className="w-full accent-cyan-400"
                />
                <p className="text-xs text-white/30 mt-1">{prefs.voiceSpeed ?? 1}x</p>
              </Field>
            </Section>
          )}

          {/* MEMORY */}
          {tab === 'memory' && (
            <Section title="Memory" desc="Control what Akayam remembers about you">
              <Toggle
                label="Enable memory"
                desc="Akayam will remember information across conversations"
                checked={prefs.memoryEnabled ?? true}
                onChange={v => save({ memoryEnabled: v })}
              />
              <div className="mt-6">
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (!confirm('Clear all memories? This cannot be undone.')) return
                    await fetch('/api/memory', { method: 'DELETE' })
                  }}
                >
                  Clear all memories
                </Button>
              </div>
            </Section>
          )}

          {/* PRIVACY */}
          {tab === 'privacy' && (
            <Section title="Privacy" desc="Manage your data and privacy preferences">
              <div className="space-y-4 text-sm text-white/50">
                <p>Your conversations are private and stored securely. We do not use your data to train AI models.</p>
                <div className="bg-white/4 border border-white/8 rounded-xl p-4 space-y-3">
                  <p className="text-white/70 font-medium">Data export</p>
                  <p>You can request a full export of your conversations and generated content.</p>
                  <Button variant="secondary" size="sm" disabled>Request export (coming soon)</Button>
                </div>
                <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4 space-y-3">
                  <p className="text-red-400 font-medium">Danger zone</p>
                  <p>Permanently delete your account and all associated data.</p>
                  <Button variant="destructive" size="sm" onClick={async () => {
                    if (!confirm('Are you absolutely sure you want to delete your account? This action is irreversible.')) return;
                    setLoading(true);
                    try {
                      const res = await fetch('/api/user/account', { method: 'DELETE' });
                      if (res.ok) window.location.assign('/login');
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setLoading(false);
                    }
                  }} disabled={loading}>
                    {loading ? <Loader2 size={15} className="animate-spin" /> : 'Delete account'}
                  </Button>
                </div>
              </div>
            </Section>
          )}

        </div>
      </div>
    </div>
  )
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-white/6 pb-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="text-sm text-white/40 mt-1">{desc}</p>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white/70">{label}</label>
      {children}
    </div>
  )
}

function Toggle({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-white/5">
      <div>
        <p className="text-sm font-medium text-white/80">{label}</p>
        <p className="text-xs text-white/35 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          'relative flex-shrink-0 w-11 h-6 rounded-full transition-colors',
          checked ? 'bg-cyan-500' : 'bg-white/15'
        )}
      >
        <span className={cn(
          'absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0'
        )} />
      </button>
    </div>
  )
}

function SaveBtn({ loading, saved }: { loading: boolean; saved: boolean }) {
  return (
    <Button type="submit" disabled={loading} className="w-32">
      {loading ? <Loader2 size={15} className="animate-spin" /> : saved ? <><Check size={15} /> Saved</> : 'Save changes'}
    </Button>
  )
}
