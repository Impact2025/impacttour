'use client'

/* eslint-disable @typescript-eslint/no-require-imports */
import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

export interface MapCheckpoint {
  id: string
  name: string
  orderIndex: number
  latitude: number
  longitude: number
  unlockRadiusMeters: number
}

interface Props {
  checkpoints: MapCheckpoint[]
  selectedId: string | null
  onMapClick: (lat: number, lng: number) => void
  onMarkerClick: (id: string) => void
  onMarkerDrag: (id: string, lat: number, lng: number) => void
}

export default function AdminCheckpointMap({ checkpoints, selectedId, onMapClick, onMarkerClick, onMarkerDrag }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<Map<string, any>>(new Map())
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const circlesRef = useRef<Map<string, any>>(new Map())

  const onMapClickRef = useRef(onMapClick)
  const onMarkerClickRef = useRef(onMarkerClick)
  const onMarkerDragRef = useRef(onMarkerDrag)
  useEffect(() => { onMapClickRef.current = onMapClick }, [onMapClick])
  useEffect(() => { onMarkerClickRef.current = onMarkerClick }, [onMarkerClick])
  useEffect(() => { onMarkerDragRef.current = onMarkerDrag }, [onMarkerDrag])

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return
    const L = require('leaflet')

    delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })

    const center = checkpoints.length > 0
      ? [checkpoints[0].latitude, checkpoints[0].longitude]
      : [52.3676, 4.9041]

    const map = L.map(containerRef.current, { center, zoom: 15 })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    map.on('click', (e: { latlng: { lat: number; lng: number } }) => {
      onMapClickRef.current(e.latlng.lat, e.latlng.lng)
    })

    mapRef.current = map

    if (checkpoints.length > 0) {
      const bounds = L.latLngBounds(checkpoints.map((c) => [c.latitude, c.longitude]))
      map.fitBounds(bounds, { padding: [60, 60] })
    }

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const L = require('leaflet')

    const currentIds = new Set(checkpoints.map((c) => c.id))

    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove()
        markersRef.current.delete(id)
        circlesRef.current.get(id)?.remove()
        circlesRef.current.delete(id)
      }
    })

    checkpoints.forEach((cp) => {
      const isSelected = cp.id === selectedId
      const color = isSelected ? '#00E676' : '#0F172A'
      const borderColor = isSelected ? '#0F172A' : '#fff'

      const icon = L.divIcon({
        html: `<div style="
          width:30px;height:30px;border-radius:50%;
          background:${color};border:2.5px solid ${borderColor};
          display:flex;align-items:center;justify-content:center;
          color:${isSelected ? '#0F172A' : '#fff'};font-weight:700;font-size:12px;
          box-shadow:0 2px 8px rgba(0,0,0,0.25);
          transform:${isSelected ? 'scale(1.25)' : 'scale(1)'};
          transition:transform 0.15s;
        ">${cp.orderIndex + 1}</div>`,
        className: '',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      })

      if (markersRef.current.has(cp.id)) {
        const marker = markersRef.current.get(cp.id)
        marker.setLatLng([cp.latitude, cp.longitude])
        marker.setIcon(icon)
        const circle = circlesRef.current.get(cp.id)
        if (circle) {
          circle.setLatLng([cp.latitude, cp.longitude])
          circle.setRadius(cp.unlockRadiusMeters)
          circle.setStyle({ color, fillColor: color, fillOpacity: isSelected ? 0.15 : 0.07 })
        }
      } else {
        const marker = L.marker([cp.latitude, cp.longitude], { icon, draggable: true }).addTo(map)
        marker.on('click', () => onMarkerClickRef.current(cp.id))
        marker.on('dragend', (e: { target: { getLatLng: () => { lat: number; lng: number } } }) => {
          const { lat, lng } = e.target.getLatLng()
          onMarkerDragRef.current(cp.id, lat, lng)
        })
        markersRef.current.set(cp.id, marker)

        const circle = L.circle([cp.latitude, cp.longitude], {
          radius: cp.unlockRadiusMeters,
          color,
          fillColor: color,
          fillOpacity: 0.07,
          weight: 1.5,
        }).addTo(map)
        circlesRef.current.set(cp.id, circle)
      }
    })
  }, [checkpoints, selectedId])

  return <div ref={containerRef} className="w-full h-full" style={{ cursor: 'crosshair' }} />
}
