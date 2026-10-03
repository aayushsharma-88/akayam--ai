'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, MessageSquare, FileText, ImageIcon, Plus, Edit2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type ProjectDetail = {
  id: string;
  name: string;
  description: string | null;
  conversations: Array<{ id: string; title: string | null; updatedAt: string }>;
  files: Array<{ id: string; originalName: string; size: number }>;
  generatedAssets: Array<{ id: string; storageUrl: string | null; prompt: string | null }>;
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [activeTab, setActiveTab] = useState<'chats' | 'files' | 'assets'>('chats')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setProject(data.project)
        } else {
          router.push('/projects')
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (params.id) fetchProject()
  }, [params.id, router])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return
    try {
      const res = await fetch(`/api/projects/${params.id}`, { method: 'DELETE' })
      if (res.ok) router.push('/projects')
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div className="p-8 text-neutral-400">Loading project...</div>
  if (!project) return null

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-100">
      <div className="p-8 border-b border-neutral-900 bg-neutral-950/50 backdrop-blur-md sticky top-0 z-10">
        <Link href="/projects" className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-300 transition-colors w-fit mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white flex items-center gap-3">
              {project.name}
              <button className="text-neutral-600 hover:text-neutral-400"><Edit2 className="w-4 h-4" /></button>
            </h1>
            <p className="text-neutral-400 mt-2 max-w-2xl">{project.description || 'No description provided.'}</p>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={handleDelete} className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
               <Trash2 className="w-5 h-5" />
             </button>
             <button onClick={() => {
                 const input = document.createElement('input');
                 input.type = 'file';
                 input.onchange = async (e) => {
                   const file = (e.target as HTMLInputElement).files?.[0];
                   if (!file) return;
                   const formData = new FormData();
                   formData.append('file', file);
                   formData.append('projectId', project.id);
                   try {
                     const res = await fetch('/api/files/upload', { method: 'POST', body: formData });
                     if (res.ok) {
                       const fetchProject = async () => {
                         const res = await fetch(`/api/projects/${params.id}`);
                         if (res.ok) setProject((await res.json()).project);
                       };
                       await fetchProject();
                     }
                   } catch (err) { console.error(err); }
                 };
                 input.click();
               }} className="flex items-center gap-2 bg-neutral-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-neutral-700 transition-colors">
               <FileText className="w-4 h-4" /> Upload
             </button>
             <button 
               onClick={async () => {
                 try {
                   const res = await fetch('/api/conversations', {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({ projectId: project.id })
                   })
                   if (res.ok) {
                     const data = await res.json()
                     router.push(`/chat/${data.conversation.id}`)
                   }
                 } catch (err) { console.error(err) }
               }}
               className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
             >
               <Plus className="w-4 h-4" /> New Chat
             </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6 px-8 border-b border-neutral-900">
        {[
          { id: 'chats', label: 'Conversations', icon: <MessageSquare className="w-4 h-4" /> },
          { id: 'files', label: 'Files', icon: <FileText className="w-4 h-4" /> },
          { id: 'assets', label: 'Generated Assets', icon: <ImageIcon className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'chats' | 'files' | 'assets')}
            className={cn(
              "flex items-center gap-2 py-4 px-2 border-b-2 transition-colors text-sm font-medium",
              activeTab === tab.id
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-neutral-500 hover:text-neutral-300 hover:border-neutral-700"
            )}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="p-8 flex-1 overflow-y-auto">
        {activeTab === 'chats' && (
          <div className="grid gap-4">
            {project.conversations.length === 0 ? (
              <p className="text-neutral-500">No conversations in this project.</p>
            ) : (
              project.conversations.map((chat) => (
                <Link key={chat.id} href={`/chat/${chat.id}`} className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl hover:border-neutral-700 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-white">{chat.title || 'New conversation'}</h3>
                    <p className="text-xs text-neutral-500 mt-1">{new Date(chat.updatedAt).toLocaleDateString()}</p>
                  </div>
                  <MessageSquare className="text-neutral-600 w-5 h-5" />
                </Link>
              ))
            )}
          </div>
        )}
        {activeTab === 'files' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {project.files.length === 0 ? (
              <p className="text-neutral-500 col-span-full">No files in this project.</p>
            ) : (
              project.files.map((file) => (
                <div key={file.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex items-start gap-3">
                  <FileText className="text-cyan-500 w-6 h-6 flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-medium text-sm text-white truncate">{file.originalName}</h3>
                    <p className="text-xs text-neutral-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        {activeTab === 'assets' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {project.generatedAssets.length === 0 ? (
              <p className="text-neutral-500 col-span-full">No generated assets in this project.</p>
            ) : (
              project.generatedAssets.map((asset) => (
                <div key={asset.id} className="group relative aspect-square bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800">
                  {asset.storageUrl ? (
                    <img src={asset.storageUrl} alt={asset.prompt || 'Generated asset'} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-700">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
