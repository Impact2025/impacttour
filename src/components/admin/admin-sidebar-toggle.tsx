'use client'

import { Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function AdminSidebarToggle() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const sidebar = document.getElementById('admin-sidebar')
    const overlay = document.getElementById('sidebar-overlay')
    if (sidebar) {
      sidebar.classList.toggle('-translate-x-full', !open)
    }
    if (overlay) {
      overlay.classList.toggle('hidden', !open)
    }
  }, [open])

  useEffect(() => {
    const overlay = document.getElementById('sidebar-overlay')
    const handleClick = () => setOpen(false)
    overlay?.addEventListener('click', handleClick)
    return () => overlay?.removeEventListener('click', handleClick)
  }, [])

  return (
    <button
      onClick={() => setOpen(!open)}
      className="text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
      aria-label="Menu"
    >
      {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
    </button>
  )
}
