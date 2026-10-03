'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, Plus, Search, MessageSquare, FolderOpen, BookOpen,
  Settings, ChevronRight, Pin, Trash2, MoreHorizontal, X, Volume2
} from 'lucide-react'
import Link from 'next/link'
import { AkayamLogo } from '@/components/brand/logo'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { AuthUser } from '@/lib/auth/auth.types'

interface Conversation {
  id: string
  title: string | null
  updatedAt: string
  isPinned: boolean
  _count: { messages: number }
}

interface SidebarProps {
  user: AuthUser
}

function groupConversations(conversations: Conversation[]) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const week = new Date(today.getTime() - 7 * 86400000)

  const pinned: Conversation[] = []
  const todayGroup: Conversation[] = []
  const yesterdayGroup: Conversation[] = []
  const weekGroup: Conversation[] = []
  const olderGroup: Conversation[] = []

  for (const conv of conversations) {
    if (conv.isPinned) { pinned.push(conv); continue }
    const date = new Date(conv.updatedAt)
    if (date >= today) todayGroup.push(conv)
    else if (date >= yesterday) yesterdayGroup.push(conv)
    else if (date >= week) weekGroup.push(conv)
    else olderGroup.push(conv)
  }

  const groups: { label: string; items: Conversation[] }[] = [
    { label: 'Pinned', items: pinned },
    { label: 'Today', items: todayGroup },
    { label: 'Yesterday', items: yesterdayGroup },
    { label: 'Previous 7 days', items: weekGroup },
    { label: 'Older', items: olderGroup },
  ]

  return groups.filter(g => g.items.length > 0)
}

export function AppSidebar({ user }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [search, setSearch] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [activeConvMenu, setActiveConvMenu] = useState<string | null>(null)

  const fetchConversations = useCallback(async () => {
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : ''
      const res = await fetch(`/api/conversations${params}`)
      if (res.ok) {
        const data = await res.json() as { conversations: Conversation[] }
        setConversations(data.conversations ?? [])
      }
    } catch {
      // Silently fail
    }
  }, [search])

  useEffect(() => {
    // eslint-disable-next-line
    void fetchConversations()
  }, [fetchConversations, pathname])

  async function createNewChat() {
    setIsCreating(true)
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (res.ok) {
        const data = await res.json() as { conversation: { id: string } }
        router.push(`/chat/${data.conversation.id}`)
      }
    } catch { /* ignore */ }
    finally { setIsCreating(false) }
  }

  async function deleteConversation(id: string) {
    try {
      await fetch(`/api/conversations/${id}`, { method: 'DELETE' })
      setConversations(prev => prev.filter(c => c.id !== id))
      if (pathname.includes(id)) router.push('/')
    } catch { /* ignore */ }
    setActiveConvMenu(null)
  }

  async function pinConversation(id: string, isPinned: boolean) {
    try {
      await fetch(`/api/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !isPinned }),
      })
      setConversations(prev =>
        prev.map(c => c.id === id ? { ...c, isPinned: !isPinned } : c)
      )
    } catch { /* ignore */ }
    setActiveConvMenu(null)
  }

  const groups = groupConversations(conversations)
  const navItems = [
    { href: '/voice', icon: Volume2, label: 'Voice Generator' },
    { href: '/library', icon: BookOpen, label: 'Library' },
    { href: '/projects', icon: FolderOpen, label: 'Projects' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <> <button onClick={() => setIsOpen(!isOpen)} className="fixed top-4 left-4 z-40 p-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 text-white shadow-lg hover:bg-black/60 transition-all"> <Menu size={20} /> </button> {isOpen && ( <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} /> )} <aside className={cn("fixed inset-y-0 left-0 flex flex-col h-full border-r border-white/10 bg-[#0A0D14]/90 backdrop-blur-xl w-[260px] flex-shrink-0 z-50 transform transition-transform duration-300 ease-in-out", isOpen ? "translate-x-0" : "-translate-x-full")} >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <AkayamLogo size="sm" />
        </Link>
        <button
          onClick={createNewChat}
          disabled={isCreating}
          title="New chat (Ctrl+K)"
          aria-label="New chat"
          className="p-2 rounded-lg text-[#8B91A1] hover:text-[#F0F2F5] hover:bg-white/5 transition-all duration-200 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 bg-white/4 border border-white/8 rounded-lg px-3 py-2">
          <Search className="h-3.5 w-3.5 text-[#4A5060] flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="bg-transparent text-sm text-[#F0F2F5] placeholder-[#4A5060] outline-none w-full"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-[#4A5060] hover:text-[#8B91A1]">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-4">
        {groups.length === 0 && !search && (
          <div className="px-2 py-10 text-center">
            <MessageSquare className="h-8 w-8 mx-auto mb-3 text-[#2A3040]" />
            <p className="text-xs text-[#4A5060]">No conversations yet</p>
            <button
              onClick={createNewChat}
              className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Start a new chat
            </button>
          </div>
        )}

        {search && groups.length === 0 && (
          <p className="text-center text-xs text-[#4A5060] py-6">No conversations found</p>
        )}

        {groups.map(group => (
          <div key={group.label}>
            <p className="px-2 mb-1 text-[10px] font-semibold text-[#4A5060] uppercase tracking-wider">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(conv => {
                const isActive = pathname.includes(conv.id)
                return (
                  <div key={conv.id} className="relative group">
                    <Link
                      href={`/chat/${conv.id}`}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150',
                        isActive
                          ? 'bg-white/8 border border-white/10 text-[#F0F2F5]'
                          : 'text-[#8B91A1] hover:text-[#F0F2F5] hover:bg-white/4'
                      )}
                    >
                      <MessageSquare className="h-3.5 w-3.5 flex-shrink-0 opacity-50" />
                      <span className="flex-1 truncate text-sm leading-tight">
                        {conv.title ?? 'New conversation'}
                      </span>
                      {conv.isPinned && <Pin className="h-3 w-3 opacity-40 flex-shrink-0" />}
                    </Link>

                    {/* Actions */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={e => { e.preventDefault(); setActiveConvMenu(activeConvMenu === conv.id ? null : conv.id) }}
                        className="p-1.5 rounded text-[#4A5060] hover:text-[#8B91A1] hover:bg-white/5"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Context menu */}
                    <AnimatePresence>
                      {activeConvMenu === conv.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -4 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-1 z-50 bg-[#1A2030] border border-white/10 rounded-xl p-1 shadow-xl min-w-[140px]"
                        >
                          <button
                            onClick={() => pinConversation(conv.id, conv.isPinned)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#8B91A1] hover:text-[#F0F2F5] hover:bg-white/5 rounded-lg transition-colors"
                          >
                            <Pin className="h-3.5 w-3.5" />
                            {conv.isPinned ? 'Unpin' : 'Pin'}
                          </button>
                          <button
                            onClick={() => deleteConversation(conv.id)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom nav */}
      <div className="border-t border-white/5 px-2 py-2">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
              pathname.startsWith(item.href)
                ? 'bg-white/8 text-[#F0F2F5]'
                : 'text-[#8B91A1] hover:text-[#F0F2F5] hover:bg-white/4'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}

        {/* User profile */}
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-3 mt-1 rounded-lg hover:bg-white/4 cursor-pointer transition-all"
        >
          <Avatar fallback={user.name ?? user.email} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#F0F2F5] truncate">{user.name ?? 'User'}</p>
            <p className="text-xs text-[#4A5060] truncate">{user.email}</p>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-[#4A5060]" />
        </Link>
      </div>
    </aside>
    </>
  )
}






