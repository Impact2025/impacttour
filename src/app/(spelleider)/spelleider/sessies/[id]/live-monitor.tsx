'use client'

import { useEffect, useRef, useState } from 'react'
import { useSpelleiderChannel } from '@/hooks/use-pusher-channel'
import type { GameEvents } from '@/hooks/use-pusher-channel'
import { AlertTriangle } from 'lucide-react'

/* eslint-disable @typescript-eslint/no-require-imports */

interface TeamPosition {
  teamId: string
  teamName: string
  lat: number
  lng: number
  isOutsideGeofence?: boolean
  updatedAt: number
}

interface Props {
  sessionId: string
  centerLat: number
  centerLng: number
}

export default function LiveMonitor({ sessionId, centerLat, centerLng }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<ReturnType<typeof import('leaflet').map> | null>(null)
  const markersRef = useRef<Map<string, unknown>>(new Map())
  const [teamPositions, setTeamPositions] = useState<Map<string, TeamPosition>>(new Map())
  const [geofenceAlerts, setGeofenceAlerts] = useState<string[]>([])

  // Initialiseer Leaflet kaart
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return

    const L = require('leaflet')
    require('leaflet/dist/leaflet.css')

    const map = L.map(containerRef.current, {
      center: [centerLat, centerLng],
      zoom: 15,
      zoomControl: true,
      attributionControl: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update markers bij positiewijzigingen
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const L = require('leaflet')

    teamPositions.forEach((pos) => {
      const existingMarker = markersRef.current.get(pos.teamId) as {
        setLatLng: (latlng: [number, number]) => void
        setIcon: (icon: unknown) => void
      } | undefined

      const color = pos.isOutsideGeofence ? '#ef4444' : '#16a34a'
      const markerIcon = L.divIcon({
        html: `<div style="
          background: ${color};
          color: white;
          border: 2px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          font-size: 10px; font-weight: 800;
        ">
          <span style="transform: rotate(45deg)">${pos.teamName.charAt(0)}</span>
        </div>`,
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        tooltipAnchor: [0, -28],
      })

      if (existingMarker) {
        existingMarker.setLatLng([pos.lat, pos.lng])
        existingMarker.setIcon(markerIcon)
      } else {
        const marker = L.marker([pos.lat, pos.lng], { icon: markerIcon })
          .bindTooltip(pos.teamName, { permanent: false, direction: 'top' })
          .addTo(map)
        markersRef.current.set(pos.teamId, marker)
      }
    })
  }, [teamPositions])

  // Pusher: ontvang team posities
  useSpelleiderChannel(sessionId, {
    'team-position': (data: GameEvents['team-position']) => {
      setTeamPositions((prev) => {
        const next = new Map(prev)
        next.set(data.teamId, {
          teamId: data.teamId,
          teamName: data.teamName,
          lat: data.lat,
          lng: data.lng,
          isOutsideGeofence: data.isOutsideGeofence,
          updatedAt: Date.now(),
        })
        return next
      })
    },
    'geofence-alert': (data: GameEvents['geofence-alert']) => {
      setGeofenceAlerts((prev) => {
        const msg = `${data.teamName} is buiten de speelzone!`
        if (prev.includes(msg)) return prev
        return [...prev.slice(-4), msg] // max 5 alerts
      })
    },
  })

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 text-sm">Live Team Posities</h2>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          {teamPositions.size} teams zichtbaar
        </div>
      </div>

      {/* Geofence alerts */}
      {geofenceAlerts.length > 0 && (
        <div className="px-4 py-2 space-y-1">
          {geofenceAlerts.map((alert, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {alert}
            </div>
          ))}
        </div>
      )}

      {/* Kaart */}
      <div ref={containerRef} style={{ height: 380 }} />

      {/* Team legenda */}
      {teamPositions.size > 0 && (
        <div className="px-4 py-3 border-t">
          <div className="flex flex-wrap gap-2">
            {Array.from(teamPositions.values()).map((pos) => (
              <div
                key={pos.teamId}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                  pos.isOutsideGeofence
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-50 text-green-700'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    pos.isOutsideGeofence ? 'bg-red-500' : 'bg-green-500'
                  }`}
                />
                {pos.teamName}
                {pos.isOutsideGeofence && <AlertTriangle className="w-3 h-3 ml-1" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
