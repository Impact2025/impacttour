'use client'

import { useEffect, useRef, useState } from 'react'
import { CheckCircle, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedNumber } from '@/components/game/animated-number'
import { RankBadge } from '@/components/game/rank-badge'
import { LeaderboardPodium } from '@/components/ui/leaderboard-podium'
import type { ScoreboardEntry, CheckpointInfo } from './page'

interface Props {
  entries: ScoreboardEntry[]
  checkpoints: CheckpointInfo[]
}

interface EntryState extends ScoreboardEntry {
  previousScore: number
  previousRank: number
  scoreFlash: boolean
}

export function Scoreboard({ entries, checkpoints }: Props) {
  const [state, setState] = useState<EntryState[]>([])
  const [newLeader, setNewLeader] = useState<string | null>(null)
  const shownNewLeaderRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    setState((prev) => {
      const prevMap = new Map(prev.map((e) => [e.teamName, e]))
      return entries.map((e) => {
        const old = prevMap.get(e.teamName)
        return {
          ...e,
          previousScore: old?.totalGmsScore ?? e.totalGmsScore,
          previousRank: old?.rank ?? e.rank,
          scoreFlash: old ? old.totalGmsScore !== e.totalGmsScore : false,
        }
      })
    })

    const leader = entries[0]
    if (leader && leader.isCurrentTeam && !shownNewLeaderRef.current.has(leader.teamName)) {
      shownNewLeaderRef.current.add(leader.teamName)
      setNewLeader(leader.teamName)
      setTimeout(() => setNewLeader(null), 3500)
    }
  }, [entries])

  const myEntry = state.find((e) => e.isCurrentTeam)
  const top3 = state.filter((e) => e.rank <= 3)
  const rest = state.filter((e) => e.rank > 3)
  const totalImpactMomenten = state.reduce((sum, e) => sum + e.checkpointsDone, 0)
  const myScore = myEntry?.totalGmsScore ?? 0

  const podiumTeams = top3.map((e) => ({
    name: e.teamName,
    score: e.totalGmsScore,
    rank: e.rank as 1 | 2 | 3,
  }))

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="px-4 py-4 space-y-3">

        {/* Header */}
        <div className="flex items-center justify-between pt-1 pb-0.5">
          <h2 className="text-lg font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-display)' }}>
            Klassement
          </h2>
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 bg-red-50 px-2.5 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
            LIVE
          </span>
        </div>

        {/* New Leader Banner */}
        <AnimatePresence>
          {newLeader && (
            <motion.div
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="bg-[#F59E0B] text-[#0F172A] rounded-2xl px-4 py-3 flex items-center gap-3"
            >
              <span className="text-xl">🏆</span>
              <div>
                <p className="text-xs font-black uppercase tracking-widest">Nieuwe leider!</p>
                <p className="text-sm font-bold">{newLeader} pakt de eerste plek</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Podium */}
        {state.length === 0 ? (
          <div className="bg-[#F8FAFC] rounded-2xl p-8 text-center">
            <p className="text-sm font-semibold text-[#64748B]">Teams zijn nog onderweg</p>
            <p className="text-xs text-[#94A3B8] mt-1">Scores verschijnen zodra checkpoints voltooid zijn</p>
          </div>
        ) : (
          <div className="bg-[#F8FAFC] rounded-2xl p-4">
            <LeaderboardPodium teams={podiumTeams} />
          </div>
        )}

        {/* GMS Score Card */}
        <div className="bg-[#0F172A] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Geluksmomenten Score</p>
            <span className="flex items-center gap-1 text-[9px] font-bold text-[#00E676] bg-[#00E676]/10 px-2 py-1 rounded-full">
              <span className="w-1 h-1 rounded-full bg-[#00E676] animate-pulse inline-block" />
              LIVE DATA
            </span>
          </div>
          <div className="text-center mb-3">
            <p
              className="font-black text-[#00E676] leading-none"
              style={{ fontFamily: 'var(--font-display)', fontSize: '64px' }}
            >
              <AnimatedNumber value={myScore} duration={600} />
            </p>
            <p className="text-xs text-[#64748B] mt-1">jouw GMS punten</p>
          </div>
          <div className="bg-white/10 rounded-full h-2 overflow-hidden mb-3">
            <div
              className="bg-[#00E676] h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, myScore)}%` }}
            />
          </div>
          <div className="flex items-center gap-1.5 justify-center">
            <Zap className="w-3.5 h-3.5 text-[#00E676]" fill="#00E676" />
            <p className="text-xs text-[#64748B]">
              <span className="text-white font-bold">{totalImpactMomenten}</span> impact momenten geregistreerd
            </p>
          </div>
        </div>

        {/* Overige teams (rank > 3) */}
        {rest.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest px-0.5">Overige teams</p>
            <AnimatePresence initial={false}>
              {rest.map((entry) => {
                const isMe = entry.isCurrentTeam
                const rankDiff = entry.previousRank - entry.rank
                return (
                  <motion.div
                    key={entry.teamName}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl ${
                      isMe ? 'bg-[#0F172A] shadow-lg shadow-[#0F172A]/20' : 'bg-[#F8FAFC]'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
                      isMe ? 'bg-[#00E676] text-[#0F172A]' : 'bg-white text-[#64748B] border border-[#E2E8F0]'
                    }`}>
                      {entry.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className={`font-bold text-sm truncate ${isMe ? 'text-white' : 'text-[#0F172A]'}`}>
                          {entry.teamName}
                          {isMe && <span className="ml-1.5 text-[10px] font-semibold text-[#00E676]">← jullie</span>}
                        </p>
                        {rankDiff !== 0 && <RankBadge diff={rankDiff} />}
                      </div>
                      <p className="text-[10px] font-semibold text-[#94A3B8]">
                        {entry.checkpointsDone} checkpoint{entry.checkpointsDone !== 1 ? 's' : ''} voltooid
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <motion.div
                        key={entry.totalGmsScore}
                        animate={entry.scoreFlash ? { scale: [1, 1.25, 1] } : {}}
                        transition={{ duration: 0.5 }}
                      >
                        <p className={`text-xl font-black leading-none ${isMe ? 'text-[#00E676]' : 'text-[#0F172A]'}`}
                          style={{ fontFamily: 'var(--font-display)' }}>
                          <AnimatedNumber value={entry.totalGmsScore} duration={500} />
                        </p>
                      </motion.div>
                      {entry.bonusPoints > 0 ? (
                        <p className="text-[9px] font-bold text-[#F59E0B]">+{entry.bonusPoints} bonus</p>
                      ) : (
                        <p className="text-[9px] font-bold uppercase text-[#94A3B8]">GMS</p>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Checkpoint lijst */}
        <div>
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest px-0.5 mb-2">Route</p>
          <div className="space-y-1.5">
            {checkpoints.map((cp, idx) => (
              <div key={cp.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${
                cp.isCompleted ? 'opacity-50' : cp.isCurrent ? 'bg-[#F0FDF4] border border-[#00E676]/40' : 'opacity-30'
              }`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                  cp.isCompleted ? 'bg-[#00E676] text-[#0F172A]' :
                  cp.isCurrent  ? 'bg-[#0F172A] text-white' :
                                  'bg-[#E2E8F0] text-[#94A3B8]'
                }`}>
                  {cp.isCompleted ? '✓' : idx + 1}
                </span>
                <p className={`text-sm flex-1 min-w-0 truncate font-semibold ${cp.isCompleted ? 'text-[#94A3B8] line-through' : 'text-[#0F172A]'}`}>
                  {cp.name}
                </p>
                {cp.isCurrent && !cp.isCompleted && (
                  <span className="text-[9px] font-bold text-[#00C853] bg-[#DCFCE7] px-2 py-0.5 rounded-full shrink-0">NU</span>
                )}
                {cp.isCompleted && <CheckCircle className="w-3.5 h-3.5 text-[#00C853] shrink-0" />}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
