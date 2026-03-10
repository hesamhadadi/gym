'use client';

import { useEffect, useRef } from 'react';
import { IGym } from '@/models/Gym';
import { Locale } from '@/i18n/translations';

interface MapProps {
  gyms: (IGym & { _id: string })[];
  locale: Locale;
  center?: [number, number];
  zoom?: number;
  onGymClick?: (gymId: string) => void;
}

export default function Map({ gyms, locale, center = [35.6892, 51.389], zoom = 12, onGymClick }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    // Dynamically import leaflet
    import('leaflet').then((L) => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current!, {
        center,
        zoom,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      // Custom icon
      const customIcon = (rating: number) => L.divIcon({
        html: `
          <div style="
            background: linear-gradient(135deg, #f97316, #ea580c);
            width: 38px;
            height: 38px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(249,115,22,0.6);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="transform: rotate(45deg); font-weight: bold; font-size: 11px; color: white;">
              ${rating > 0 ? rating.toFixed(1) : '★'}
            </span>
          </div>
        `,
        className: '',
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -42],
      });

      gyms.forEach((gym) => {
        const { lat, lng } = gym.location.coordinates;
        const name = gym.name[locale] || gym.name.fa;
        const city = gym.location.city[locale] || gym.location.city.fa;
        const minPrice = gym.packages.length > 0
          ? Math.min(...gym.packages.map((p) => p.price))
          : null;

        const marker = L.marker([lat, lng], { icon: customIcon(gym.averageRating) })
          .addTo(map);

        marker.bindPopup(`
          <div dir="${locale === 'fa' ? 'rtl' : 'ltr'}" style="min-width: 180px; font-family: Vazirmatn, sans-serif;">
            <div style="font-weight: bold; font-size: 14px; margin-bottom: 6px; color: #f97316;">${name}</div>
            <div style="font-size: 12px; color: #9ca3af; margin-bottom: 4px;">📍 ${city}</div>
            <div style="font-size: 12px; margin-bottom: 8px;">
              ${'★'.repeat(Math.round(gym.averageRating))}${'☆'.repeat(5 - Math.round(gym.averageRating))}
              <span style="color: #6b7280">(${gym.totalReviews})</span>
            </div>
            ${minPrice ? `<div style="font-size: 12px; color: #fb923c; margin-bottom: 8px;">از ${minPrice.toLocaleString('fa-IR')} تومان</div>` : ''}
            <a href="/gyms/${gym._id}" style="
              display: block;
              text-align: center;
              background: linear-gradient(135deg, #f97316, #ea580c);
              color: white;
              padding: 6px 12px;
              border-radius: 8px;
              text-decoration: none;
              font-size: 12px;
              font-weight: 600;
            ">مشاهده باشگاه</a>
          </div>
        `);

        if (onGymClick) {
          marker.on('click', () => onGymClick(gym._id.toString()));
        }
      });

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gyms, locale]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-2xl overflow-hidden"
      style={{ minHeight: '400px' }}
    />
  );
}
