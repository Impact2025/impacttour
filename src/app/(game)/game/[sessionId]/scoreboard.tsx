'use client'

import { CheckCircle, Trophy } from 'lucide-react'
import type { ScoreboardEntry, CheckpointInfo } from './page'

interface Props {
  entries: ScoreboardEntry[]
  checkpoints: CheckpointInfo[]
}

const rankMedal = ['🥇', '🥈', '🥉']
const rankColors = [
  'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]',
  'bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]',
  'bg-[#FEF2E7] text-[#C2410C] border border-[#FDBA74]',
  'bg-white text-[#94A3B8] border border-[#E2E8F0]',
]

export function Scoreboard({ entries, checkpoints }: Props) {
  const totalCheckpoints = checkpoints.length
  const completedCount = checkpoints.filter((c) => c.isCompleted).length
  const progress = totalCheckpoints > 0 ? (completedCount / totalCheckpoints) * 100 : 0
  const myEntry = entries.find((e) => e.isCurrentTeam)

  return (
    <div className="h-full overflow-y-auto bg-[#F0FDF4]">
      <div className="px-4 py-4 space-y-3">

        {/* Header */}
        <div className="flex items-center justify-between pt-1 pb-0.5">
          <div>
            <h2 className="text-lg font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-display)' }}>
              Klassement
            </h2>
            {myEntry && (
              <p className="text-xs text-[#64748B]">Jij staat {myEntry.rank}e met {myEntry.totalGmsScore} punten</p>
            )}
          </div>
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 bg-red-50 px-2.5 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
            LIVE
          </span>
        </div>

        {/* Voortgangskaart */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Jullie voortgang</p>
            <span className="text-sm font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-display)' }}>
              {completedCount}/{totalCheckpoints}
            </span>
          </div>
          <div className="bg-[#E2E8F0] rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-[#00E676] h-full rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] text-[#94A3B8] mt-1.5">checkpoints voltooid</p>
        </div>

        {/* Scorebord */}
        {entries.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <Trophy className="w-10 h-10 text-[#CBD5E1] mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#64748B]">Teams zijn nog onderweg</p>
            <p className="text-xs text-[#94A3B8] mt-1">Scores verschijnen zodra checkpoints voltooid zijn</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => {
              const colorClass = rankColors[Math.min(entry.rank - 1, 3)]
              const isMe = entry.isCurrentTeam
              return (
                <div
                  key={entry.teamName}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all ${
                    isMe
                      ? 'bg-[#0F172A] shadow-lg shadow-[#0F172A]/20'
                      : 'bg-white border border-[#E2E8F0]'
                  }`}
                >
                  {/* Rang */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
                    isMe ? 'bg-[#00E676] text-[#0F172A]' : colorClass
                  }`}>
                    {entry.rank <= 3 ? rankMedal[entry.rank - 1] : entry.rank}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm truncate ${isMe ? 'text-white' : 'text-[#0F172A]'}`}>
                      {entry.teamName}
                      {isMe && <span className="ml-1.5 text-[10px] font-semibold text-[#00E676]">← jullie</span>}
                    </p>
                    <p className={`text-[10px] font-semibold ${isMe ? 'text-[#94A3B8]' : 'text-[#94A3B8]'}`}>
                      {entry.checkpointsDone} checkpoint{entry.checkpointsDone !== 1 ? 's' : ''} voltooid
                    </p>
                  </div>

                  {/* Score */}
                  <div className="text-right shrink-0">
                    <p className={`text-xl font-black leading-none ${isMe ? 'text-[#00E676]' : 'text-[#0F172A]'}`}
                      style={{ fontFamily: 'var(--font-display)' }}>
                      {entry.totalGmsScore}
                    </p>
                    <p className={`text-[9px] font-bold uppercase ${isMe ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>GMS</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Checkpoint lijst */}
        <div>
          <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest px-0.5 mb-2">Route</p>
          <div className="space-y-2">
            {checkpoints.map((cp, idx) => (
              <div key={cp.id} className={`flex items-center gap-3 p-3 rounded-xl ${
                cp.isCompleted ? 'bg-white opacity-60' : cp.isCurrent ? 'bg-white border border-[#00E676]' : 'bg-white opacity-40'
              }`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                  cp.isCompleted ? 'bg-[#00E676] text-[#0F172A]' :
                  cp.isCurrent  ? 'bg-[#0F172A] text-white' :
                                  'bg-[#E2E8F0] text-[#94A3B8]'
                }`}>
                  {cp.isCompleted ? '✓' : idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${cp.isCompleted ? 'text-[#94A3B8] line-through' : 'text-[#0F172A]'}`}>
                    {cp.name}
                  </p>
                  {cp.isCurrent && !cp.isCompleted && (
                    <p className="text-[10px] font-bold text-[#00C853]">Huidig checkpoint</p>
                  )}
                </div>
                {cp.isCompleted && <CheckCircle className="w-4 h-4 text-[#00C853] shrink-0" />}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
