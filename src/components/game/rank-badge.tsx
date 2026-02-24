'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface Props {
  diff: number        // positief = omhoog, negatief = omlaag
  visibleMs?: number  // hoe lang zichtbaar (default 3000)
}

/**
 * Toont een rank-change indicator (+2 / -1) die na `visibleMs` ms verdwijnt.
 */
export function RankBadge({ diff, visibleMs = 3000 }: Props) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), visibleMs)
    return () => clearTimeout(t)
  }, [visibleMs])

  if (diff === 0) return null

  const isUp = diff > 0
  return (
    <AnimatePresence>
      {visible && (
        <motion.span
          initial={{ opacity: 0, scale: 0.6, x: 8 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className={`inline-flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${
            isUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
          }`}
        >
          {isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
          {isUp ? '+' : ''}{diff}
        </motion.span>
      )}
    </AnimatePresence>
  )
}
