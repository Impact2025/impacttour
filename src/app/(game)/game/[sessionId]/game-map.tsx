'use client'

/* eslint-disable @typescript-eslint/no-require-imports */
import { useEffect, useRef } from 'react'
import type { CheckpointInfo } from './page'
import type { GPSPosition } from '@/hooks/use-gps'
import 'leaflet/dist/leaflet.css'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildGpsIcon(L: any, heading: number | null) {
  const hdg = heading !== null && !isNaN(heading) ? heading : null

  if (hdg !== null) {
    return L.divIcon({
      html: `
        <div style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">
          <div style="
            position:absolute;top:50%;left:50%;
            width:52px;height:52px;
            margin:-26px 0 0 -26px;
            border-radius:50%;
            background:#3b82f6;
            animation:gpsRing 2s ease-out infinite;
          "></div>
          <svg width="32" height="32" viewBox="0 0 32 32"
            style="transform:rotate(${hdg}deg);transition:transform 0.4s ease-out;filter:drop-shadow(0 2px 6px rgba(37,99,235,0.55));">
            <polygon points="16,3 25,27 16,22 7,27" fill="#2563EB" stroke="white" stroke-width="2.5" stroke-linejoin="round"/>
          </svg>
        </div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    })
  }

  return L.divIcon({
    html: `
      <div style="position:relative;width:22px;height:22px;">
        <div style="
          position:absolute;top:50%;left:50%;
          width:44px;height:44px;
          margin:-22px 0 0 -22px;
          border-radius:50%;
          background:#3b82f6;
          animation:gpsRing 2s ease-out infinite;
        "></div>
        <div style="
          width:22px;height:22px;
          border-radius:50%;
          background:#2563EB;
          border:3px solid white;
          box-shadow:0 2px 10px rgba(37,99,235,0.6);
        "></div>
      </div>`,
    className: '',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  })
}

interface Props {
  checkpoints: CheckpointInfo[]
  teamPosition: GPSPosition | null
  nearbyCheckpoint: CheckpointInfo | null
  variant?: string
  geofencePolygon?: { lat: number; lng: number }[] | null
}

export default function GameMap({ checkpoints, teamPosition, nearbyCheckpoint, variant, geofencePolygon }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<ReturnType<typeof import('leaflet').map> | null>(null)
  const teamMarkerRef = useRef<ReturnType<typeof import('leaflet').marker> | null>(null)
  const accuracyCircleRef = useRef<ReturnType<typeof import('leaflet').circle> | null>(null)
  const checkpointMarkersRef = useRef<Map<string, unknown>>(new Map())
  const geofenceLayerRef = useRef<unknown>(null)
  const checkpointsRef = useRef<CheckpointInfo[]>(checkpoints)
  const lastHeadingRef = useRef<number | null | undefined>(undefined)
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

  // Houd checkpointsRef synchroon zodat de teamPosition effect er bij kan
  useEffect(() => { checkpointsRef.current = checkpoints }, [checkpoints])

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

    checkpoints.forEach((cp, idx) => {
      const isNearby = nearbyCheckpoint?.id === cp.id
      const isCompleted = cp.isCompleted
      const isCurrent = cp.isCurrent
      const isActive = isCurrent || isNearby

      // Label bubble boven huidig doelcheckpoint (isCurrent of isNearby)
      if (isActive) {
        const cpIcon = isVoetbal ? '⚽' : '📍'
        const bgColor = isNearby ? '#F59E0B' : '#00E676'
        const arrowColor = isNearby ? '#F59E0B' : '#00E676'
        const textOpacity = isCurrent && !isNearby ? '0.92' : '1'

        const labelIcon = L.divIcon({
          html: `
            <div style="display:flex;flex-direction:column;align-items:center;opacity:${textOpacity};">
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
              ">${cpIcon} ${cp.name}</div>
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

      // Dot marker — completed = klein + gedimd, active = groot + levendig, future = medium
      const dotSize = isActive ? 18 : isCompleted ? 8 : 12
      const bgColor = isCompleted
        ? 'rgba(148,163,184,0.25)'
        : isNearby
        ? '#F59E0B'
        : isCurrent
        ? '#0F172A'
        : '#E2E8F0'
      const textColor = isCompleted
        ? '#94A3B8'
        : isCurrent && !isCompleted
        ? '#FFFFFF'
        : '#475569'
      const borderColor = isCompleted
        ? '#CBD5E1'
        : isNearby
        ? '#D97706'
        : isCurrent
        ? '#00E676'
        : '#94A3B8'
      const label = isCompleted ? '✓' : String(idx + 1)
      const fontSize = isActive ? '13px' : isCompleted ? '9px' : '10px'
      const borderWidth = isCompleted ? '1.5px' : '2.5px'
      const shadow = isCompleted
        ? 'none'
        : isActive
        ? '0 2px 8px rgba(0,0,0,0.25)'
        : '0 1px 4px rgba(0,0,0,0.15)'

      const markerIcon = L.divIcon({
        html: `<div style="
          width:${dotSize * 2}px;height:${dotSize * 2}px;
          background:${bgColor};
          border:${borderWidth} solid ${borderColor};
          border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          color:${textColor};font-weight:800;font-size:${fontSize};
          box-shadow:${shadow};
          opacity:${isCompleted ? '0.55' : '1'};
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
  }, [checkpoints, nearbyCheckpoint, isVoetbal, teamPosition])

  // Update team positie (blauwe stip) — volgt gebruiker soepel
  useEffect(() => {
    const map = mapRef.current
    if (!map || !teamPosition) return

    const L = require('leaflet')
    const { latitude, longitude, accuracy, heading } = teamPosition

    // Accuracy-ring alleen tonen bij slechte GPS (> 20m) — anders visuele ruis
    const showAccuracy = accuracy > 20

    if (teamMarkerRef.current) {
      // Bestaande markers updaten + soepel meerijden
      teamMarkerRef.current.setLatLng([latitude, longitude])
      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.setLatLng([latitude, longitude])
        accuracyCircleRef.current.setRadius(accuracy)
        accuracyCircleRef.current.setStyle({
          opacity: showAccuracy ? 1 : 0,
          fillOpacity: showAccuracy ? 0.25 : 0,
        })
      }

      // Update pijl-icon alleen als heading veranderd is
      if (heading !== lastHeadingRef.current) {
        lastHeadingRef.current = heading
        const updatedIcon = buildGpsIcon(L, heading)
        teamMarkerRef.current.setIcon(updatedIcon)
      }

      map.panTo([latitude, longitude], { animate: true, duration: 0.5 })
    } else {
      // Eerste GPS fix: markers aanmaken
      lastHeadingRef.current = heading
      const gpsIcon = buildGpsIcon(L, heading)

      const marker = L.marker([latitude, longitude], { icon: gpsIcon, interactive: false, zIndexOffset: 1000 }).addTo(map)
      teamMarkerRef.current = marker

      const circle = L.circle([latitude, longitude], {
        radius: accuracy,
        color: '#93c5fd',
        fillColor: '#bfdbfe',
        fillOpacity: showAccuracy ? 0.25 : 0,
        opacity: showAccuracy ? 1 : 0,
        weight: 1,
      }).addTo(map)
      accuracyCircleRef.current = circle

      // Toon gebruiker én huidig checkpoint tegelijk in beeld
      const current = checkpointsRef.current.find((c) => c.isCurrent)
      if (current) {
        const bounds = L.latLngBounds(
          [latitude, longitude],
          [current.latitude, current.longitude]
        ).pad(0.3)
        map.fitBounds(bounds, { maxZoom: 17, animate: true })
      } else {
        map.setView([latitude, longitude], 16)
      }
    }
  }, [teamPosition])

  // Teken geofence grens (alleen voor kids-varianten met polygoon)
  useEffect(() => {
    const map = mapRef.current
    if (!map || !isVoetbal) return

    const L = require('leaflet')

    // Verwijder bestaande laag
    if (geofenceLayerRef.current) {
      (geofenceLayerRef.current as { remove: () => void }).remove()
      geofenceLayerRef.current = null
    }

    if (!geofencePolygon || geofencePolygon.length < 3) return

    const coords = geofencePolygon.map((p) => [p.lat, p.lng] as [number, number])
    const polygon = L.polygon(coords, {
      color: '#EF4444',
      weight: 2.5,
      dashArray: '8, 6',
      fillColor: '#EF4444',
      fillOpacity: 0.06,
    }).addTo(map)

    geofenceLayerRef.current = polygon
  }, [geofencePolygon, isVoetbal])

  return (
    <>
      <style>{`
        @keyframes mapPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.5); }
          50% { box-shadow: 0 0 0 10px rgba(245,158,11,0); }
        }
        @keyframes gpsRing {
          0%   { transform: scale(0.4); opacity: 0.5; }
          100% { transform: scale(1);   opacity: 0; }
        }
      `}</style>
      <div ref={containerRef} className="w-full h-full" />
    </>
  )
}
