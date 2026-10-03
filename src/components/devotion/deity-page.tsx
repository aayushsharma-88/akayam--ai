'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Copy, Play, Check } from 'lucide-react'
import type { Deity, Mantra } from '@/lib/data/deities'
import { cn } from '@/lib/utils'

interface Props {
  deity: Deity;
  allDeities: Deity[];
}

export function DeityPageContent({ deity, allDeities }: Props) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  
  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="flex h-full flex-col lg:flex-row bg-[#0A0D14] overflow-hidden text-white/90 relative z-50">
      
      {/* Sidebar Navigation */}
      <aside className="lg:w-64 border-r border-white/10 bg-[#0E1525]/50 flex-shrink-0 flex flex-col p-4 overflow-y-auto hidden lg:flex">
        <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={18} />
          <span>Back to Akayam</span>
        </Link>
        <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">Divine Energies</h3>
        <nav className="flex flex-col gap-2">
          {allDeities.map(d => (
            <Link 
              key={d.id} 
              href={`/devotion/${d.id}`}
              className={cn(
                "px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-between",
                deity.id === d.id 
                  ? "bg-white/10 text-white shadow-lg" 
                  : "hover:bg-white/5 text-white/60 hover:text-white"
              )}
            >
              <span className="font-medium">{d.name}</span>
              <span className="text-xs opacity-70 font-serif">{d.titleHindi}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 scroll-smooth bg-[#0A0D14]">
        
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar max-w-full pb-2">
             {allDeities.map(d => (
              <Link 
                key={d.id} 
                href={`/devotion/${d.id}`}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors",
                  deity.id === d.id ? "bg-white/20 text-white" : "bg-white/5 text-white/60"
                )}
              >
                {d.titleHindi}
              </Link>
             ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col items-center text-center mb-16">
            <div className="relative mb-8 group animate-float">
              {/* Dynamic Aura */}
              <div className={cn("absolute inset-0 blur-[60px] rounded-full opacity-60 bg-gradient-to-tr animate-pulse-glow transition-all duration-700", deity.themeGlow)} />
              
              <img 
                src={deity.image} 
                alt={deity.name}
                className="w-48 h-48 sm:w-64 sm:h-64 object-contain relative z-10 mix-blend-screen drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            
            <h1 className="text-5xl sm:text-6xl font-serif font-bold mb-4 tracking-tight drop-shadow-md bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
              {deity.titleHindi}
            </h1>
            <p className="text-xl sm:text-2xl text-white/80 font-light max-w-2xl">
              {deity.intro}
            </p>
          </div>

          {/* Katha Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
              <span className="w-8 h-[1px] bg-white/20 block"></span>
              {deity.name} Katha
              <span className="w-8 h-[1px] bg-white/20 block"></span>
            </h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm leading-relaxed text-white/80 text-lg">
              {deity.katha}
            </div>
          </section>

          {/* Mantras Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
              <span className="w-8 h-[1px] bg-white/20 block"></span>
              Sacred Mantras
              <span className="w-8 h-[1px] bg-white/20 block"></span>
            </h2>
            <div className="grid gap-6">
              {deity.mantras.map((mantra, idx) => (
                <div key={idx} className="bg-black/40 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-md group hover:border-white/20 transition-colors">
                  
                  <div className="flex justify-between items-start gap-4 mb-6">
                    <p className="text-2xl sm:text-3xl font-serif text-amber-100/90 leading-normal drop-shadow-sm whitespace-pre-line">
                      {mantra.sanskrit}
                    </p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleCopy(mantra.sanskrit, idx)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-all"
                        title="Copy Mantra"
                      >
                        {copiedIndex === idx ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs uppercase tracking-widest text-white/40 font-semibold block mb-1">Pronunciation</span>
                      <p className="text-white/70 italic whitespace-pre-line">{mantra.roman}</p>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-widest text-white/40 font-semibold block mb-1">Meaning</span>
                      <p className="text-white/80">{mantra.meaning}</p>
                    </div>
                  </div>
                  
                </div>
              ))}
            </div>
          </section>
          
          <div className="mt-20 text-center text-white/30 text-sm pb-8">
            <p>Traditional knowledge passed down through generations. May you find peace and wisdom.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
