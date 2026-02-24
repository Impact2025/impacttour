'use client'

import { useRef, useState } from 'react'
import { Share2, Download, Check } from 'lucide-react'

interface ScoreCardData {
  teamName: string
  tourName: string
  gmsScore: number
  gmsMax: number
  dimensions: {
    connection: number
    meaning: number
    joy: number
    growth: number
  }
  date?: string
}

interface Props {
  data: ScoreCardData
}

const dimColors = {
  connection: '#EC4899',
  meaning: '#8B5CF6',
  joy: '#F59E0B',
  growth: '#00E676',
}
const dimLabels = { connection: 'V', meaning: 'B', joy: 'P', growth: 'G' }
const dimFull   = { connection: 'Verbinding', meaning: 'Betekenis', joy: 'Plezier', growth: 'Groei' }

export function ScoreCard({ data }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied]   = useState(false)
  const [loading, setLoading] = useState(false)

  const gmsPct = data.gmsMax > 0 ? Math.round((data.gmsScore / data.gmsMax) * 100) : 0
  const barWidth = `${gmsPct}%`
  const dateStr  = data.date ?? new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })

  const getBlob = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null
    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        style: { borderRadius: '0' },
      })
      const res = await fetch(dataUrl)
      return await res.blob()
    } catch {
      return null
    }
  }

  const handleShare = async () => {
    setLoading(true)
    try {
      const blob = await getBlob()
      if (!blob) throw new Error('render failed')

      const file = new File([blob], 'ictusgo-score.png', { type: 'image/png' })

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `${data.teamName} · IctusGo`, text: `Wij scoorden ${data.gmsScore} GMS punten!` })
      } else {
        // Fallback: download
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'ictusgo-score.png'
        a.click()
        URL.revokeObjectURL(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      }
    } catch {
      // noop
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Off-screen renderable card */}
      <div
        ref={cardRef}
        className="w-[270px] rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #0d2018 0%, #0F172A 60%)',
          padding: 20,
          fontFamily: 'sans-serif',
        }}
      >
        {/* Logo row */}
        <div className="flex items-center gap-1.5 mb-5">
          <div className="w-5 h-5 rounded bg-[#00E676] flex items-center justify-center">
            <span style={{ fontSize: 10, fontWeight: 900, color: '#0F172A' }}>I</span>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#00E676', letterSpacing: 2, textTransform: 'uppercase' }}>IctusGo</span>
        </div>

        {/* Team naam */}
        <div style={{ fontSize: 18, fontWeight: 900, color: 'white', marginBottom: 4, lineHeight: 1.1 }}>
          {data.teamName}
        </div>
        <div style={{ fontSize: 10, color: '#64748B', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
          {data.tourName}
        </div>

        {/* Big score */}
        <div style={{ fontSize: 64, fontWeight: 900, color: '#00E676', lineHeight: 1, marginBottom: 4 }}>
          {data.gmsScore}
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>
          GMS Score
        </div>

        {/* Progress bar */}
        <div style={{ background: '#1E293B', borderRadius: 6, height: 6, marginBottom: 14, overflow: 'hidden' }}>
          <div style={{ width: barWidth, height: '100%', background: '#00E676', borderRadius: 6 }} />
        </div>

        {/* Dimensions 2x2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          {(Object.keys(dimColors) as (keyof typeof dimColors)[]).map((key) => {
            const max25 = data.gmsMax > 0 ? Math.round((data.dimensions[key] / (data.gmsMax / 4)) * 100) : 0
            return (
              <div key={key} style={{ background: `${dimColors[key]}15`, borderRadius: 8, padding: '6px 8px' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: dimColors[key], letterSpacing: 1 }}>
                  {dimLabels[key]} · {dimFull[key]}
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: 'white', lineHeight: 1.1 }}>
                  {max25}%
                </div>
              </div>
            )
          })}
        </div>

        {/* Date */}
        <div style={{ fontSize: 9, color: '#475569', borderTop: '1px solid #1E293B', paddingTop: 10, marginTop: 4 }}>
          {dateStr} · teambuildingmetimpact.nl
        </div>
      </div>

      {/* Share button */}
      <button
        onClick={handleShare}
        disabled={loading}
        className="w-full py-3.5 rounded-2xl bg-[#00E676] text-[#0F172A] font-black italic text-base flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-60 uppercase tracking-wide"
        style={{
          fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)',
          boxShadow: '0 4px 20px rgba(0,230,118,0.30)',
        }}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-[#0F172A]/30 border-t-[#0F172A] rounded-full animate-spin" />
        ) : copied ? (
          <><Check className="w-4 h-4" /> Gedownload!</>
        ) : (
          <><Share2 className="w-4 h-4" /> Deel Score Card</>
        )}
      </button>

      <button
        onClick={async () => {
          setLoading(true)
          const blob = await getBlob()
          if (blob) {
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url; a.download = 'ictusgo-score.png'; a.click()
            URL.revokeObjectURL(url)
          }
          setLoading(false)
        }}
        className="w-full py-2.5 rounded-xl border border-[#E2E8F0] text-[#64748B] font-semibold text-sm flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all"
      >
        <Download className="w-3.5 h-3.5" />
        Downloaden als PNG
      </button>
    </div>
  )
}
