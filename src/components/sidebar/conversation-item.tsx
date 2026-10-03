'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MoreHorizontal, Edit2, Trash2, Pin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConversationItemProps {
  conversation: {
    id: string;
    title: string | null;
  }
  active?: boolean
}

export function ConversationItem({ conversation, active }: ConversationItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const title = conversation.title || 'New conversation'

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={`/chat/${conversation.id}`}
        className={cn(
          "flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-all duration-200",
          active 
            ? "bg-white/8 text-white" 
            : "text-white/60 hover:bg-white/4 hover:text-white/90"
        )}
      >
        <div className="flex-1 truncate pr-6">{title}</div>
      </Link>
      
      {(isHovered || active) && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center bg-gradient-to-l from-[#0A0D14] via-[#0A0D14] to-transparent pl-4 pr-1 py-1 rounded-r-lg">
          <button className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white transition-colors">
            <MoreHorizontal size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
