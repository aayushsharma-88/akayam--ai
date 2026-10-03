'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Image as ImageIcon, Video, Music, FileText, Download, Trash2, Grid, List } from 'lucide-react'
import { formatDate, formatFileSize, cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

type AssetType = 'ALL' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT'

interface Asset {
  id: string
  type: string
  prompt: string | null
  storageUrl: string | null
  model: string
  provider: string
  createdAt: string
  status: string
}

const FILTERS: { label: string; value: AssetType; icon: React.ElementType }[] = [
  { label: 'All', value: 'ALL', icon: Grid },
  { label: 'Images', value: 'IMAGE', icon: ImageIcon },
  { label: 'Videos', value: 'VIDEO', icon: Video },
  { label: 'Audio', value: 'AUDIO', icon: Music },
  { label: 'Documents', value: 'DOCUMENT', icon: FileText },
]

export default function LibraryPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [filter, setFilter] = useState<AssetType>('ALL')
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const q = filter !== 'ALL' ? `?type=${filter}` : ''
        const res = await fetch(`/api/library${q}`)
        if (res.ok) {
          const data = await res.json() as { assets: Asset[] }
          setAssets(data.assets ?? [])
        }
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    load()
  }, [filter])

  async function deleteAsset(id: string) {
    if (!confirm('Delete this asset?')) return
    setAssets(prev => prev.filter(a => a.id !== id))
    await fetch(`/api/library/${id}`, { method: 'DELETE' }).catch(() => {})
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#080A0F]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#080A0F]/95 backdrop-blur border-b border-white/6 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">Library</h1>
            <p className="text-xs text-white/40 mt-0.5">Your generated images, audio, and documents</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLayout('grid')} className={cn('p-2 rounded-lg transition-colors', layout === 'grid' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white')}>
              <Grid size={16} />
            </button>
            <button onClick={() => setLayout('list')} className={cn('p-2 rounded-lg transition-colors', layout === 'list' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white')}>
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-6 py-6 flex flex-col gap-6">
        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(({ label, value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                filter === value
                  ? 'bg-white/10 text-white border border-white/15'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent'
              )}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && assets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center">
              <ImageIcon size={28} className="text-white/20" />
            </div>
            <div>
              <p className="text-white/50 font-medium">No assets yet</p>
              <p className="text-white/25 text-sm mt-1">Generated images, audio, and files will appear here</p>
            </div>
          </div>
        )}

        {/* Asset grid */}
        {!loading && assets.length > 0 && layout === 'grid' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {assets.map((asset, i) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="group relative bg-[#141820] border border-white/6 rounded-xl overflow-hidden hover:border-white/15 transition-all"
              >
                {asset.type === 'IMAGE' && asset.storageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={asset.storageUrl} alt={asset.prompt ?? 'Generated image'} className="aspect-square object-cover w-full" />
                ) : (
                  <div className="aspect-square flex items-center justify-center bg-white/3">
                    <ImageIcon size={32} className="text-white/20" />
                  </div>
                )}
                <div className="p-3">
                  <p className="text-xs text-white/60 truncate">{asset.prompt ?? asset.type}</p>
                  <p className="text-[10px] text-white/25 mt-1">{formatDate(asset.createdAt)}</p>
                </div>
                {/* Actions overlay */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {asset.storageUrl && (
                    <a
                      href={asset.storageUrl}
                      download
                      className="p-1.5 bg-black/60 rounded-lg text-white/80 hover:text-white"
                    >
                      <Download size={13} />
                    </a>
                  )}
                  <button
                    onClick={() => deleteAsset(asset.id)}
                    className="p-1.5 bg-black/60 rounded-lg text-red-400/80 hover:text-red-400"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* List view */}
        {!loading && assets.length > 0 && layout === 'list' && (
          <div className="flex flex-col gap-2">
            {assets.map((asset) => (
              <div key={asset.id} className="flex items-center gap-4 bg-[#141820] border border-white/6 rounded-xl px-4 py-3 hover:border-white/12 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <ImageIcon size={18} className="text-white/30" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 truncate">{asset.prompt ?? asset.type}</p>
                  <p className="text-xs text-white/30">{asset.provider} · {formatDate(asset.createdAt)}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {asset.storageUrl && (
                    <a href={asset.storageUrl} download className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/5">
                      <Download size={14} />
                    </a>
                  )}
                  <button onClick={() => deleteAsset(asset.id)} className="p-1.5 text-red-400/40 hover:text-red-400 rounded-lg hover:bg-red-500/10">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
