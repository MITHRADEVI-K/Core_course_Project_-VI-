'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HeatmapProps {
  zones: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    co2_level?: number;
  }>;
}

export function Heatmap({ zones }: HeatmapProps) {
  const getColorForLevel = (level?: number) => {
    if (!level) return 'bg-emerald-500 shadow-lg shadow-emerald-500/50';
    if (level < 300) return 'bg-emerald-500 shadow-lg shadow-emerald-500/50';
    if (level < 500) return 'bg-yellow-500 shadow-lg shadow-yellow-500/50';
    if (level < 800) return 'bg-orange-500 shadow-lg shadow-orange-500/50';
    return 'bg-red-600 shadow-lg shadow-red-600/50';
  };

  const getLabelForLevel = (level?: number) => {
    if (!level) return 'N/A';
    if (level < 300) return 'Good';
    if (level < 500) return 'Moderate';
    if (level < 800) return 'High';
    return 'Critical';
  };

  const normalizeCoordinates = (lat: number, lng: number) => {
    // Normalize to 0-100 grid
    const x = ((lng + 180) / 360) * 100;
    const y = ((90 - lat) / 180) * 100;
    return { x, y };
  };

  const zonePositions = useMemo(() => {
    return zones.map((zone) => ({
      ...zone,
      ...normalizeCoordinates(zone.latitude, zone.longitude),
    }));
  }, [zones]);

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Real-time CO₂ Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full aspect-video bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-lg border border-slate-600 overflow-hidden">
          {/* Grid overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-5">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#475569" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Zones */}
          {zonePositions.map((zone) => (
            <div
              key={zone.id}
              className={`absolute w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-125 ${getColorForLevel(zone.co2_level)}`}
              style={{
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              title={`${zone.name}: ${zone.co2_level || 'N/A'} ppm`}
            >
              <div className="text-center">
                <div className="text-xs font-bold text-white">{zone.name.charAt(0)}</div>
                <div className="text-[10px] text-slate-200">{getLabelForLevel(zone.co2_level)}</div>
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-slate-800 border border-slate-600 rounded-lg shadow-lg p-3 text-xs">
            <div className="font-semibold mb-2 text-slate-200">CO₂ Levels (ppm)</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-300">&lt; 300: Good</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-slate-300">300-500: Moderate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-slate-300">500-800: High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-600" />
                <span className="text-slate-300">&gt; 800: Critical</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
