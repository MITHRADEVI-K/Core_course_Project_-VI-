'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';

interface ForecastData {
  date: string;
  predicted_co2: number;
  confidence: number;
  risk_level: string;
}

interface AnalyticsProps {
  zoneId: string;
  zoneName: string;
}

export function ForecastingAnalytics({ zoneId, zoneName }: AnalyticsProps) {
  const [forecasts, setForecasts] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);
  const [riskTrend, setRiskTrend] = useState<'improving' | 'stable' | 'worsening'>('stable');

  useEffect(() => {
    const fetchForecasts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/forecasts?zoneId=${zoneId}`);
        if (!res.ok) throw new Error('Failed to fetch forecasts');
        const data = await res.json();
        setForecasts(data);

        // Determine trend
        if (data.length > 1) {
          const latest = data[data.length - 1].predicted_co2;
          const oldest = data[0].predicted_co2;
          if (latest < oldest * 0.95) setRiskTrend('improving');
          else if (latest > oldest * 1.05) setRiskTrend('worsening');
          else setRiskTrend('stable');
        }
      } catch (error) {
        console.error('Error fetching forecasts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchForecasts();
    const interval = setInterval(fetchForecasts, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, [zoneId]);

  const highRiskDays = forecasts.filter((f) => f.risk_level === 'high' || f.risk_level === 'critical').length;
  const avgConfidence = forecasts.length > 0 ? (forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length * 100).toFixed(1) : '0';

  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Forecasting Analytics - {zoneName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-slate-400">Loading forecast data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {highRiskDays > 0 && (
        <Alert className="border-red-900 bg-red-950">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-200">
            <strong>{highRiskDays} high-risk days</strong> predicted in the next 30 days. Consider implementing mitigation strategies.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300">Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {riskTrend === 'improving' ? (
                <>
                  <TrendingDown className="h-5 w-5 text-green-400" />
                  <span className="text-lg font-semibold text-green-400">Improving</span>
                </>
              ) : riskTrend === 'worsening' ? (
                <>
                  <TrendingUp className="h-5 w-5 text-red-400" />
                  <span className="text-lg font-semibold text-red-400">Worsening</span>
                </>
              ) : (
                <>
                  <div className="h-5 w-5 rounded-full bg-yellow-400" />
                  <span className="text-lg font-semibold text-yellow-400">Stable</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300">Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-400">{avgConfidence}%</div>
            <p className="text-xs text-slate-400">Average prediction accuracy</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300">High Risk Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">{highRiskDays}</div>
            <p className="text-xs text-slate-400">Next 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-sm">CO₂ Level Forecast</CardTitle>
          <CardDescription>30-day prediction trend</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={forecasts}>
              <defs>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '4px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Area type="monotone" dataKey="predicted_co2" stroke="#06b6d4" fill="url(#colorPredicted)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-sm">Risk Level Distribution</CardTitle>
          <CardDescription>Days by risk category</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={[
                {
                  name: 'Risk',
                  low: forecasts.filter((f) => f.risk_level === 'low').length,
                  medium: forecasts.filter((f) => f.risk_level === 'medium').length,
                  high: forecasts.filter((f) => f.risk_level === 'high').length,
                  critical: forecasts.filter((f) => f.risk_level === 'critical').length,
                },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '4px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="low" fill="#10b981" />
              <Bar dataKey="medium" fill="#f59e0b" />
              <Bar dataKey="high" fill="#ef4444" />
              <Bar dataKey="critical" fill="#7c2d12" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
