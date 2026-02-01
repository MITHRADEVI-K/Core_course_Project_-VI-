'use client';

import React, { useEffect, useState } from 'react';
import { Heatmap } from '@/components/heatmap';
import { ZoneDetails } from '@/components/zone-details';
import { StrategyComparison } from '@/components/strategy-comparison';
import { ForecastingAnalytics } from '@/components/forecasting-analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Zone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  co2_level?: number;
}

interface City {
  id: string;
  name: string;
  country: string;
}

export default function Dashboard() {
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('/api/cities');
        const data = await response.json();
        setCities(data);
        if (data.length > 0) {
          setSelectedCity(data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch cities:', error);
      }
    };

    fetchCities();
  }, []);

  useEffect(() => {
    const fetchZones = async () => {
      if (!selectedCity) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/zones?cityId=${selectedCity.id}`);
        const data = await response.json();
        setZones(data);
        if (data.length > 0 && !selectedZone) {
          setSelectedZone(data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch zones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchZones();
  }, [selectedCity]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">CO₂ Digital Twin</h1>
              <p className="text-slate-400 text-sm mt-1">Smart City Emission Management System</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Last Updated: {new Date().toLocaleTimeString()}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* City Selection */}
        <Card className="mb-8 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Select City</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {cities.map((city) => (
                <Button
                  key={city.id}
                  onClick={() => setSelectedCity(city)}
                  variant={selectedCity?.id === city.id ? 'default' : 'outline'}
                  className={selectedCity?.id === city.id ? 'bg-blue-600 text-white' : 'border-slate-600 text-slate-300'}
                >
                  {city.name}, {city.country}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedCity && (
          <>
            {/* Heatmap */}
            <div className="mb-8">
              <Heatmap zones={zones} />
            </div>

            {/* Zone Selection and Details */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Zone Selector */}
              <Card className="lg:col-span-1 bg-slate-800 border-slate-700 h-fit">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Zones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {zones.map((zone) => (
                      <button
                        key={zone.id}
                        onClick={() => setSelectedZone(zone)}
                        className={`w-full text-left p-3 rounded-md transition-colors ${
                          selectedZone?.id === zone.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        <div className="font-semibold">{zone.name}</div>
                        <div className="text-xs mt-1">
                          CO₂: {zone.co2_level ? `${zone.co2_level} ppm` : 'N/A'}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Zone Details */}
              <div className="lg:col-span-3 space-y-6">
                {selectedZone ? (
                  <>
                    <ZoneDetails zoneId={selectedZone.id} zoneName={selectedZone.name} />
                    <ForecastingAnalytics zoneId={selectedZone.id} zoneName={selectedZone.name} />
                  </>
                ) : (
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="py-12 text-center text-slate-400">
                      Select a zone to view details
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Strategy Comparison */}
            <div className="mt-8">
              <StrategyComparison cityId={selectedCity.id} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
