'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FolderPlus, Folder, MessageSquare, Clock, Plus } from 'lucide-react'

type Project = { id: string, name: string, description: string | null, _count: { conversations: number }, updatedAt: string }

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/projects')
      if (res.ok) {
        const data = await res.json()
        setProjects(data.projects || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line
    void fetchProjects()
  }, [])

  const handleCreate = async () => {
    setCreating(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Project', description: 'A new workspace.' })
      })
      if (res.ok) {
        fetchProjects()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-100 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500">Projects</h1>
          <p className="text-neutral-400 mt-2">Organize your AI workflows and conversations.</p>
        </div>
        <button 
          onClick={handleCreate}
          disabled={creating}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-[0_0_15px_rgba(56,189,248,0.2)] disabled:opacity-50"
        >
          <FolderPlus className="w-4 h-4" />
          {creating ? 'Creating...' : 'New Project'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-neutral-500">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-neutral-800 rounded-xl p-8">
            <Folder className="w-16 h-16 text-neutral-700 mb-4" />
            <h3 className="text-lg font-medium text-neutral-300">No projects yet</h3>
            <p className="text-neutral-500 mt-2 mb-6 max-w-sm">Create your first project to start organizing your workspaces and conversations.</p>
            <button onClick={handleCreate} className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-neutral-200 transition-colors">
              <Plus className="w-4 h-4" /> Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl p-6 transition-all cursor-pointer h-full flex flex-col"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-neutral-800 rounded-lg text-cyan-400">
                      <Folder className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-neutral-200 truncate">{project.name}</h3>
                      <p className="text-sm text-neutral-500 line-clamp-2 mt-1">{project.description || 'No description'}</p>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{project._count?.conversations || 0} chats</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
