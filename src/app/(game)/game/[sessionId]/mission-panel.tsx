'use client'

import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { Camera, Timer, Lightbulb, Star, ChevronLeft, Zap, X } from 'lucide-react'
import type { CheckpointInfo } from './page'

interface SubmissionResult {
  aiScore: number
  aiFeedback: string
  gmsEarned: number
  bonusEarned?: number
  gmsBreakdown?: { connection: number; meaning: number; joy: number; growth: number }
}

interface Props {
  checkpoint: CheckpointInfo
  sessionId: string
  teamToken: string
  isKids: boolean
  variant: string
  onSubmit: (answer: string, photoUrl?: string) => Promise<SubmissionResult | null>
  onClose: () => void
}

type HintLevel = 0 | 1 | 2 | 3

const missionTypeLabel: Record<string, string> = {
  opdracht: 'Opdracht',
  foto: 'Foto missie',
  quiz: 'Quiz',
  video: 'Video',
}

const missionTypeColor: Record<string, string> = {
  opdracht: 'bg-[#DCFCE7] text-[#00C853]',
  foto: 'bg-[#FEF3C7] text-[#D97706]',
  quiz: 'bg-[#EEF2FF] text-[#6366F1]',
  video: 'bg-[#FDF2F8] text-[#DB2777]',
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function MissionPanel({ checkpoint, sessionId, teamToken, isKids, variant, onSubmit, onClose }: Props) {
  const [answer, setAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<SubmissionResult | null>(null)
  const [hintLevel, setHintLevel] = useState<HintLevel>(0)
  const [currentHint, setCurrentHint] = useState<string | null>(null)
  const [isLoadingHint, setIsLoadingHint] = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(checkpoint.timeLimitSeconds ?? null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isFootball = variant === 'voetbalmissie'
  const hasBonusPhoto = checkpoint.bonusPhotoPoints > 0
  const timerIsUrgent = timeLeft !== null && timeLeft <= 60
  const cpNumber = checkpoint.orderIndex + 1

  useEffect(() => {
    if (!checkpoint.timeLimitSeconds || result) return
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 0) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [checkpoint.timeLimitSeconds, result])

  const handleHint = async (level: 1 | 2 | 3) => {
    if (isKids) {
      const hintMap = { 1: checkpoint.hint1, 2: checkpoint.hint2, 3: checkpoint.hint3 }
      setCurrentHint(hintMap[level])
      setHintLevel(level)
      return
    }
    setIsLoadingHint(true)
    try {
      const res = await fetch('/api/game/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, teamToken, checkpointId: checkpoint.id, level: String(level) }),
      })
      const data = await res.json()
      if (res.ok) { setCurrentHint(data.hint); setHintLevel(level) }
    } finally {
      setIsLoadingHint(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingPhoto(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('sessionId', sessionId)
      formData.append('teamToken', teamToken)
      const res = await fetch('/api/game/photo', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok) { setPhotoUrl(data.url); toast.success('Foto geüpload!') }
      else toast.error('Foto upload mislukt')
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handleSubmit = async () => {
    if (!answer && !photoUrl) { toast.error('Vul een antwoord in of upload een foto'); return }
    setIsSubmitting(true)
    try {
      const submission = await onSubmit(answer, photoUrl ?? undefined)
      if (submission) setResult(submission)
    } finally {
      setIsSubmitting(false)
    }
  }

  /* ── RESULTAAT SCHERM ── */
  if (result) {
    const score = result.aiScore
    const isHighImpact = score >= 70
    const gmsColors = ['bg-[#DCFCE7] text-[#00C853]', 'bg-[#EEF2FF] text-[#6366F1]', 'bg-[#FEF3C7] text-[#D97706]', 'bg-[#FDF4FF] text-[#A855F7]']
    const gmsLabels = ['Verbinding', 'Betekenis', 'Plezier', 'Groei']

    return (
      <div className="h-full overflow-y-auto bg-[#F0FDF4]">
        <div className="px-4 pt-10 pb-8 flex flex-col items-center text-center">
          {/* Score cirkel */}
          <div className={`w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-lg mb-5 ${isHighImpact ? 'bg-[#00E676] shadow-[#00E676]/30' : 'bg-white border-2 border-[#E2E8F0]'}`}>
            <Star className={`w-6 h-6 mb-0.5 ${isHighImpact ? 'text-[#0F172A]' : 'text-[#94A3B8]'}`} fill={isHighImpact ? '#0F172A' : 'none'} />
            <span className={`text-2xl font-black leading-none ${isHighImpact ? 'text-[#0F172A]' : 'text-[#0F172A]'}`}
              style={{ fontFamily: 'var(--font-display)' }}>
              {score}
            </span>
          </div>

          <h2 className="text-2xl font-black text-[#0F172A] mb-1" style={{ fontFamily: 'var(--font-display)' }}>
            {isHighImpact ? '🌟 Hoge Impact!' : 'Goed gedaan!'}
          </h2>
          <p className="text-[#64748B] text-sm mb-6 max-w-xs leading-relaxed">{result.aiFeedback}</p>

          {/* GMS punten */}
          <div className="bg-white rounded-2xl shadow-sm w-full p-5 mb-3">
            <p className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-widest mb-1">Verdiend</p>
            <div className="text-5xl font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-display)' }}>
              +{result.gmsEarned}
            </div>
            <p className="text-sm text-[#94A3B8] mt-0.5">GMS punten</p>
          </div>

          {/* Bonus punten */}
          {(result.bonusEarned ?? 0) > 0 && (
            <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-2xl w-full p-4 mb-3">
              <div className="text-3xl font-black text-[#D97706]" style={{ fontFamily: 'var(--font-display)' }}>
                +{result.bonusEarned}
              </div>
              <p className="text-sm text-[#92400E] font-medium">bonus voor de teamfoto!</p>
            </div>
          )}

          {/* GMS breakdown */}
          {result.gmsBreakdown && (
            <div className="grid grid-cols-2 gap-2 w-full mb-6">
              {gmsLabels.map((label, i) => {
                const val = Object.values(result.gmsBreakdown!)[i]
                return (
                  <div key={label} className={`rounded-xl p-3 text-left ${gmsColors[i]}`}>
                    <div className="text-xl font-black leading-none" style={{ fontFamily: 'var(--font-display)' }}>{val}</div>
                    <div className="text-[10px] font-semibold opacity-80 mt-0.5">{label}</div>
                  </div>
                )
              })}
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-4 bg-[#00E676] text-[#0F172A] rounded-2xl font-black text-base shadow-lg shadow-[#00E676]/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Terug naar de kaart
          </button>
        </div>
      </div>
    )
  }

  /* ── MISSIE PANEEL ── */
  const hasHints = checkpoint.hint1 || checkpoint.hint2 || checkpoint.hint3
  const hintDefs = [
    { level: 1 as const, text: checkpoint.hint1, label: 'Hint 1' },
    { level: 2 as const, text: checkpoint.hint2, label: 'Hint 2' },
    { level: 3 as const, text: checkpoint.hint3, label: 'Hint 3' },
  ].filter((h) => h.text)

  return (
    <div className="h-full flex flex-col bg-[#F0FDF4]">

      {/* ── HEADER ── */}
      <div className="bg-white border-b border-[#E2E8F0] px-4 pt-4 pb-4 shrink-0">
        <div className="flex items-start gap-3">
          {/* Checkpoint nummer */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isFootball ? 'bg-[#0F172A]' : 'bg-[#00E676]'}`}>
            <span className="text-xl font-black leading-none" style={{ fontFamily: 'var(--font-display)', color: isFootball ? '#00E676' : '#0F172A' }}>
              {isFootball ? '⚽' : cpNumber}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            {/* Type badge + timer */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${missionTypeColor[checkpoint.missionType] ?? 'bg-[#F1F5F9] text-[#64748B]'}`}>
                {missionTypeLabel[checkpoint.missionType] ?? checkpoint.type}
              </span>
              {hasBonusPhoto && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706]">
                  +{checkpoint.bonusPhotoPoints} bonus
                </span>
              )}
              {timeLeft !== null && (
                <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${timerIsUrgent ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
                  <Timer className="w-3 h-3" />
                  {formatTime(timeLeft)}
                </span>
              )}
            </div>

            <h2 className="text-base font-bold text-[#0F172A] leading-snug pr-2">
              {checkpoint.missionTitle}
            </h2>
          </div>

          {/* Sluit knop */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center shrink-0 active:scale-90 transition-transform"
          >
            <X className="w-4 h-4 text-[#64748B]" />
          </button>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

        {/* Opdracht beschrijving */}
        <div className={`rounded-2xl p-4 ${isFootball ? 'bg-[#0F172A]' : 'bg-white border border-[#E2E8F0]'}`}>
          <p className={`text-sm leading-relaxed ${isFootball ? 'text-green-100' : 'text-[#334155]'}`}>
            {checkpoint.missionDescription}
          </p>
        </div>

        {/* Timer waarschuwing */}
        {timeLeft === 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center">
            <p className="text-red-600 text-sm font-bold">⏱ Tijd is op! Dien nu je antwoord in.</p>
          </div>
        )}

        {/* Hints */}
        {hasHints && (
          <div className="space-y-2.5">
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest px-0.5">Hulp nodig?</p>
            <div className="flex gap-2">
              {hintDefs.map(({ level, label }) => {
                const isUsed = hintLevel >= level
                const isLocked = !isKids && hintLevel < level - 1
                return (
                  <button
                    key={level}
                    onClick={() => handleHint(level)}
                    disabled={isLoadingHint || isUsed || isLocked}
                    className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                      isUsed
                        ? 'bg-[#FEF3C7] border-[#FDE68A] text-[#D97706]'
                        : isLocked
                        ? 'bg-white border-[#E2E8F0] text-[#CBD5E1] cursor-not-allowed'
                        : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#00E676] hover:text-[#00C853]'
                    }`}
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    {label}
                  </button>
                )
              })}
            </div>

            {currentHint && (
              <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-3.5">
                <p className="text-[10px] font-bold text-[#D97706] uppercase tracking-wider mb-1">Hint {hintLevel}</p>
                <p className="text-sm text-[#92400E] leading-relaxed">{currentHint}</p>
              </div>
            )}
          </div>
        )}

        {/* Antwoord textarea */}
        {checkpoint.missionType !== 'foto' && (
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest px-0.5">
              Jullie antwoord
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Beschrijf wat jullie hebben gedaan, geleerd of ontdekt..."
              rows={4}
              className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00E676] focus:border-transparent resize-none text-sm text-[#0F172A] placeholder:text-[#CBD5E1]"
            />
          </div>
        )}

        {/* Foto upload */}
        {(checkpoint.missionType === 'foto' || checkpoint.missionType === 'opdracht' || hasBonusPhoto) && (
          <div className="space-y-1.5">
            {checkpoint.missionType === 'foto' && (
              <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest px-0.5">
                Foto inzending
              </label>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            {photoUrl ? (
              <div className="relative rounded-xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoUrl} alt="Inzending" className="w-full object-cover max-h-48 rounded-xl" />
                <button
                  onClick={() => setPhotoUrl(null)}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className={`w-full py-5 border-2 border-dashed rounded-xl flex flex-col items-center gap-1.5 transition-all active:scale-98 ${
                  hasBonusPhoto
                    ? 'border-[#FDE68A] bg-[#FFFBEB] text-[#D97706]'
                    : 'border-[#DCFCE7] bg-white text-[#00C853]'
                }`}
              >
                <Camera className="w-6 h-6" />
                <span className="text-sm font-semibold">
                  {isUploadingPhoto
                    ? 'Uploaden...'
                    : hasBonusPhoto
                    ? `Teamfoto maken (+${checkpoint.bonusPhotoPoints} bonus)`
                    : 'Foto toevoegen'}
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── SUBMIT ── */}
      <div className="px-4 pb-4 pt-3 shrink-0 bg-[#F0FDF4] border-t border-[#E2E8F0]">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || (!answer && !photoUrl)}
          className="w-full py-4 bg-[#00E676] text-[#0F172A] rounded-2xl font-black text-base shadow-lg shadow-[#00E676]/20 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-[#0F172A]/30 border-t-[#0F172A] rounded-full animate-spin" />
              AI beoordeelt je inzending...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Inzending indienen
            </>
          )}
        </button>
      </div>
    </div>
  )
}
