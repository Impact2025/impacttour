'use client'

/* eslint-disable @typescript-eslint/no-require-imports */
import { useEffect, useRef } from 'react'
import type { CheckpointInfo } from './page'
import type { GPSPosition } from '@/hooks/use-gps'
import 'leaflet/dist/leaflet.css'

interface Props {
  checkpoints: CheckpointInfo[]
  teamPosition: GPSPosition | null
  nearbyCheckpoint: CheckpointInfo | null
  variant?: string
}

export default function GameMap({ checkpoints, teamPosition, nearbyCheckpoint, variant }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<ReturnType<typeof import('leaflet').map> | null>(null)
  const teamMarkerRef = useRef<ReturnType<typeof import('leaflet').circleMarker> | null>(null)
  const accuracyCircleRef = useRef<ReturnType<typeof import('leaflet').circle> | null>(null)
  const checkpointMarkersRef = useRef<Map<string, unknown>>(new Map())
  const isVoetbal = variant === 'voetbalmissie' || variant === 'jeugdtocht'

  // Initialiseer kaart
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return

    const L = require('leaflet')

    const map = L.map(containerRef.current, {
      center: [52.3676, 4.9041],
      zoom: 15,
      zoomControl: true,
      attributionControl: false,
    })

    // Lichtere tile stijl past beter bij het design
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map)

    // Verplaats zoom controls rechtsonder
    map.zoomControl.setPosition('bottomright')

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Update checkpoint markers + route polyline
  useEffect(() => {
    const map = mapRef.current
    if (!map || checkpoints.length === 0) return

    const L = require('leaflet')

    // Verwijder oude markers
    checkpointMarkersRef.current.forEach((marker: unknown) => {
      (marker as { remove: () => void }).remove()
    })
    checkpointMarkersRef.current.clear()

    // Route polyline — verbindt alle checkpoints op volgorde
    const routeCoords = [...checkpoints]
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((cp) => [cp.latitude, cp.longitude])

    if (routeCoords.length > 1) {
      const polyline = L.polyline(routeCoords, {
        color: '#00E676',
        weight: 3,
        opacity: 0.85,
      }).addTo(map)
      checkpointMarkersRef.current.set('__polyline', polyline)
    }

    checkpoints.forEach((cp, idx) => {
      const isNearby = nearbyCheckpoint?.id === cp.id
      const isCompleted = cp.isCompleted
      const isCurrent = cp.isCurrent
      const isActive = isCurrent || isNearby

      // Label bubble boven actief checkpoint
      if (isActive) {
        const icon = isVoetbal ? '⚽' : '📍'
        const bgColor = isNearby ? '#F59E0B' : '#00E676'
        const arrowColor = isNearby ? '#F59E0B' : '#00E676'

        const labelIcon = L.divIcon({
          html: `
            <div style="display:flex;flex-direction:column;align-items:center;">
              <div style="
                background:${bgColor};
                color:#0F172A;
                font-weight:800;
                font-size:11px;
                padding:5px 12px;
                border-radius:20px;
                display:flex;align-items:center;gap:5px;
                white-space:nowrap;
                box-shadow:0 2px 8px rgba(0,0,0,0.2);
                letter-spacing:0.04em;
                text-transform:uppercase;
                font-family:'Barlow Condensed',sans-serif;
              ">${icon} ${cp.name}</div>
              <div style="
                width:0;height:0;
                border-left:5px solid transparent;
                border-right:5px solid transparent;
                border-top:6px solid ${arrowColor};
              "></div>
            </div>
          `,
          className: '',
          iconSize: [0, 0],
          iconAnchor: [0, 46],
        })
        const labelMarker = L.marker([cp.latitude, cp.longitude], { icon: labelIcon, interactive: false }).addTo(map)
        checkpointMarkersRef.current.set(`label-${cp.id}`, labelMarker)
      }

      // Dot marker
      const dotSize = isActive ? 18 : 13
      const bgColor = isCompleted
        ? '#00E676'
        : isNearby
        ? '#F59E0B'
        : isCurrent
        ? '#0F172A'
        : '#CBD5E1'
      const textColor = isCurrent && !isCompleted ? '#FFFFFF' : '#0F172A'
      const borderColor = isCompleted ? '#00C853' : isNearby ? '#D97706' : isCurrent ? '#00E676' : '#94A3B8'
      const label = isCompleted ? '✓' : String(idx + 1)

      const markerIcon = L.divIcon({
        html: `<div style="
          width:${dotSize * 2}px;height:${dotSize * 2}px;
          background:${bgColor};
          border:2.5px solid ${borderColor};
          border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          color:${textColor};font-weight:800;font-size:${isActive ? '13px' : '11px'};
          box-shadow:0 2px 8px rgba(0,0,0,0.25);
          ${isNearby ? 'animation:mapPulse 1s infinite;' : ''}
        ">${label}</div>`,
        className: '',
        iconSize: [dotSize * 2, dotSize * 2],
        iconAnchor: [dotSize, dotSize],
      })

      const marker = L.marker([cp.latitude, cp.longitude], { icon: markerIcon, interactive: false }).addTo(map)
      checkpointMarkersRef.current.set(cp.id, marker)

      // Unlock radius circle voor actief checkpoint
      if (isActive) {
        const circle = L.circle([cp.latitude, cp.longitude], {
          radius: cp.unlockRadiusMeters,
          color: isNearby ? '#F59E0B' : '#00E676',
          fillColor: isNearby ? '#F59E0B' : '#00E676',
          fillOpacity: 0.1,
          weight: 1.5,
        }).addTo(map)
        checkpointMarkersRef.current.set(`circle-${cp.id}`, circle)
      }
    })

    // Center op huidig checkpoint
    const current = checkpoints.find((c) => c.isCurrent)
    if (current && !teamPosition) {
      map.setView([current.latitude, current.longitude], 16)
    }
  }, [checkpoints, nearbyCheckpoint, teamPosition, isVoetbal])

  // Update team positie (blauwe stip)
  useEffect(() => {
    const map = mapRef.current
    if (!map || !teamPosition) return

    const L = require('leaflet')
    const { latitude, longitude, accuracy } = teamPosition

    if (teamMarkerRef.current) {
      teamMarkerRef.current.setLatLng([latitude, longitude])
      accuracyCircleRef.current?.setLatLng([latitude, longitude])
      accuracyCircleRef.current?.setRadius(accuracy)
    } else {
      const marker = L.circleMarker([latitude, longitude], {
        radius: 8,
        color: '#1d4ed8',
        fillColor: '#3b82f6',
        fillOpacity: 1,
        weight: 3,
      }).addTo(map)
      teamMarkerRef.current = marker

      const circle = L.circle([latitude, longitude], {
        radius: accuracy,
        color: '#93c5fd',
        fillColor: '#bfdbfe',
        fillOpacity: 0.25,
        weight: 1,
      }).addTo(map)
      accuracyCircleRef.current = circle
    }

    map.setView([latitude, longitude], map.getZoom())
  }, [teamPosition])

  return (
    <>
      <style>{`
        @keyframes mapPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.5); }
          50% { box-shadow: 0 0 0 10px rgba(245,158,11,0); }
        }
      `}</style>
      <div ref={containerRef} className="w-full h-full" />
    </>
  )
}
