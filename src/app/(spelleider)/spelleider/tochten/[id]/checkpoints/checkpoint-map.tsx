'use client'

/* eslint-disable @typescript-eslint/no-require-imports */
import { useEffect, useRef } from 'react'
import type { CheckpointData } from './checkpoint-editor'
import 'leaflet/dist/leaflet.css'

interface Props {
  checkpoints: CheckpointData[]
  selectedId: string | null
  onMapClick: (lat: number, lng: number) => void
  onMarkerClick: (id: string) => void
  onMarkerDrag: (id: string, lat: number, lng: number) => void
}

export default function CheckpointMap({
  checkpoints,
  selectedId,
  onMapClick,
  onMarkerClick,
  onMarkerDrag,
}: Props) {
  const mapRef = useRef<ReturnType<typeof import('leaflet').map> | null>(null)
  const markersRef = useRef<Map<string, ReturnType<typeof import('leaflet').marker>>>(new Map())
  const circlesRef = useRef<Map<string, ReturnType<typeof import('leaflet').circle>>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialiseer kaart
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return

    const L = require('leaflet')

    // Fix Leaflet default icon paths (broken in Next.js bundling)
    delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })

    const map = L.map(containerRef.current, {
      center: [52.3676, 4.9041], // Amsterdam als default
      zoom: 14,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    map.on('click', (e: { latlng: { lat: number; lng: number } }) => {
      onMapClick(e.latlng.lat, e.latlng.lng)
    })

    mapRef.current = map

    // Centreer op bestaande checkpoints als die er zijn
    if (checkpoints.length > 0) {
      const bounds = L.latLngBounds(checkpoints.map((c) => [c.latitude, c.longitude]))
      map.fitBounds(bounds, { padding: [50, 50] })
    }

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Synchroniseer markers met checkpoints state
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const L = require('leaflet')

    const currentIds = new Set(checkpoints.map((c) => c.id))

    // Verwijder markers voor verwijderde checkpoints
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove()
        markersRef.current.delete(id)
        circlesRef.current.get(id)?.remove()
        circlesRef.current.delete(id)
      }
    })

    // Voeg toe of update markers
    checkpoints.forEach((cp, idx) => {
      const isSelected = cp.id === selectedId
      const color = isSelected ? '#16a34a' : '#2D9B4E'

      const icon = L.divIcon({
        html: `<div style="
          width: 28px; height: 28px;
          background: ${color};
          border: 2px solid white;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: white; font-weight: 700; font-size: 12px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
          transition: transform 0.1s;
        ">${idx + 1}</div>`,
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      })

      if (markersRef.current.has(cp.id)) {
        const marker = markersRef.current.get(cp.id)!
        marker.setLatLng([cp.latitude, cp.longitude])
        marker.setIcon(icon)

        const circle = circlesRef.current.get(cp.id)
        if (circle) {
          circle.setLatLng([cp.latitude, cp.longitude])
          circle.setRadius(cp.unlockRadiusMeters)
          circle.setStyle({
            color: color,
            fillColor: color,
            fillOpacity: isSelected ? 0.15 : 0.08,
          })
        }
      } else {
        const marker = L.marker([cp.latitude, cp.longitude], {
          icon,
          draggable: true,
        }).addTo(map)

        marker.on('click', () => onMarkerClick(cp.id))
        marker.on('dragend', (e: { target: { getLatLng: () => { lat: number; lng: number } } }) => {
          const { lat, lng } = e.target.getLatLng()
          onMarkerDrag(cp.id, lat, lng)
        })

        markersRef.current.set(cp.id, marker)

        const circle = L.circle([cp.latitude, cp.longitude], {
          radius: cp.unlockRadiusMeters,
          color: color,
          fillColor: color,
          fillOpacity: 0.08,
          weight: 1.5,
        }).addTo(map)

        circlesRef.current.set(cp.id, circle)
      }
    })
  }, [checkpoints, selectedId, onMarkerClick, onMarkerDrag])

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ cursor: 'crosshair' }}
    />
  )
}
