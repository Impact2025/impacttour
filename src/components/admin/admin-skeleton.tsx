export function AdminTableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
      <div className="border-b border-[#E2E8F0] px-4 py-3 flex gap-6">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className={`h-2.5 bg-[#F1F5F9] rounded-full animate-pulse ${i === 0 ? 'w-28' : 'w-16'}`} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-[#F8FAFC] px-4 py-4 flex items-center gap-6">
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              className={`h-3 rounded-full animate-pulse ${
                j === 0 ? 'w-40 bg-[#F1F5F9]' : j === cols - 1 ? 'w-16 bg-[#F8FAFC]' : 'w-24 bg-[#F8FAFC]'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function AdminErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-red-100 p-8 text-center">
      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-[#0F172A] mb-1">Laden mislukt</p>
      <p className="text-xs text-[#94A3B8] mb-4">{message ?? 'Probeer het opnieuw'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-[#0F172A] text-white rounded-lg text-xs font-semibold hover:bg-[#1E293B] transition-colors"
        >
          Opnieuw proberen
        </button>
      )}
    </div>
  )
}
