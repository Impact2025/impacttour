'use client'

import dynamic from 'next/dynamic'

const LiveMonitor = dynamic(() => import('./live-monitor'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b">
        <h2 className="font-semibold text-gray-900 text-sm">Live Team Posities</h2>
      </div>
      <div className="h-[380px] flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-400">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm">Kaart laden...</p>
        </div>
      </div>
    </div>
  ),
})

interface Props {
  sessionId: string
  centerLat: number
  centerLng: number
}

export function LiveMonitorWrapper({ sessionId, centerLat, centerLng }: Props) {
  return <LiveMonitor sessionId={sessionId} centerLat={centerLat} centerLng={centerLng} />
}
