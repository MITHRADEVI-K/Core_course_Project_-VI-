'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, Wind } from 'lucide-react';

interface ZoneDetailsProps {
  zoneId: string;
  zoneName: string;
}

export function ZoneDetails({ zoneId, zoneName }: ZoneDetailsProps) {
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeasurements = async () => {
      try {
        const response = await fetch(`/api/measurements?zoneId=${zoneId}&limit=50`);
        const data = await response.json();
        setMeasurements(data.reverse());
      } catch (error) {
        console.error('Failed to fetch measurements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeasurements();
  }, [zoneId]);

  const stats = {
    average: measurements.length > 0 ? (measurements.reduce((sum, m) => sum + (m.co2_level || 0), 0) / measurements.length).toFixed(1) : 0,
    max: measurements.length > 0 ? Math.max(...measurements.map(m => m.co2_level || 0)).toFixed(1) : 0,
    min: measurements.length > 0 ? Math.min(...measurements.map(m => m.co2_level || 0)).toFixed(1) : 0,
    avgTemp: measurements.length > 0 ? (measurements.reduce((sum, m) => sum + (m.temperature || 0), 0) / measurements.length).toFixed(1) : 0,
    avgHumidity: measurements.length > 0 ? (measurements.reduce((sum, m) => sum + (m.humidity || 0), 0) / measurements.length).toFixed(0) : 0,
    avgAqi: measurements.length > 0 ? (measurements.reduce((sum, m) => sum + (m.air_quality_index || 0), 0) / measurements.length).toFixed(0) : 0,
  };

  const getRiskLevel = (value: number) => {
    if (value < 400) return { label: 'Good', color: 'text-green-400', bg: 'bg-green-900/30' };
    if (value < 600) return { label: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-900/30' };
    if (value < 800) return { label: 'High', color: 'text-orange-400', bg: 'bg-orange-900/30' };
    return { label: 'Critical', color: 'text-red-400', bg: 'bg-red-900/30' };
  };

  const currentLevel = measurements.length > 0 ? measurements[measurements.length - 1].co2_level : 0;
  const riskLevel = getRiskLevel(currentLevel);

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">{zoneName} - Current Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border border-slate-600 ${riskLevel.bg}`}>
              <div className="text-sm text-slate-400">Current CO₂</div>
              <div className={`text-2xl font-bold ${riskLevel.color} mt-1`}>{currentLevel.toFixed(0)} ppm</div>
              <div className={`text-xs ${riskLevel.color} mt-1`}>{riskLevel.label}</div>
            </div>
            <div className="p-4 rounded-lg border border-slate-600 bg-cyan-900/30">
              <div className="text-sm text-slate-400">Average CO₂</div>
              <div className="text-2xl font-bold text-cyan-400 mt-1">{stats.average} ppm</div>
            </div>
            <div className="p-4 rounded-lg border border-slate-600 bg-orange-900/30">
              <div className="text-sm text-slate-400">Peak CO₂</div>
              <div className="text-2xl font-bold text-orange-400 mt-1">{stats.max} ppm</div>
            </div>
            <div className="p-4 rounded-lg border border-slate-600 bg-blue-900/30">
              <div className="text-sm text-slate-400">Temperature</div>
              <div className="text-2xl font-bold text-blue-400 mt-1">{stats.avgTemp}°C</div>
            </div>
            <div className="p-4 rounded-lg border border-slate-600 bg-purple-900/30">
              <div className="text-sm text-slate-400">Humidity</div>
              <div className="text-2xl font-bold text-purple-400 mt-1">{stats.avgHumidity}%</div>
            </div>
            <div className="p-4 rounded-lg border border-slate-600 bg-red-900/30">
              <div className="text-sm text-slate-400">Air Quality Index</div>
              <div className="text-2xl font-bold text-red-400 mt-1">{stats.avgAqi}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">CO₂ Level Trend (Last 24 Hours)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-slate-400">Loading measurements...</div>
          ) : measurements.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={measurements}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis
                  dataKey="measurement_timestamp"
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                <YAxis stroke="#94a3b8" label={{ value: 'CO₂ (ppm)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '4px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                  formatter={(value: any) => `${value.toFixed(1)} ppm`}
                  labelFormatter={(label) => new Date(label).toLocaleString()}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="co2_level"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                  name="CO₂ Level"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">No data available</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
