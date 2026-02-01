'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StrategyComparisonProps {
  cityId: string;
}

interface Strategy {
  id: string;
  name: string;
  description: string;
  strategy_type: string;
  estimated_co2_reduction_pct: number;
  implementation_cost_millions: number;
  implementation_timeline_months: number;
  priority: number;
}

export function StrategyComparison({ cityId }: StrategyComparisonProps) {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [newStrategy, setNewStrategy] = useState({ 
    name: '', 
    description: '',
    strategy_type: 'public_transport',
    estimated_co2_reduction_pct: 0, 
    implementation_cost_millions: 0,
    implementation_timeline_months: 0,
    priority: 1
  });

  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const response = await fetch(`/api/strategies?cityId=${cityId}`);
        const data = await response.json();
        setStrategies(data);
      } catch (error) {
        console.error('Failed to fetch strategies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStrategies();
  }, [cityId]);

  const handleAddStrategy = async () => {
    if (!newStrategy.name) return;

    try {
      const response = await fetch('/api/strategies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newStrategy,
          city_id: cityId,
          created_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to add strategy');
      const data = await response.json();
      setStrategies([data, ...strategies]);
      setNewStrategy({ 
        name: '', 
        description: '',
        strategy_type: 'public_transport',
        estimated_co2_reduction_pct: 0, 
        implementation_cost_millions: 0,
        implementation_timeline_months: 0,
        priority: 1
      });
    } catch (error) {
      console.error('Failed to add strategy:', error);
    }
  };

  const chartData = strategies.map((s) => ({
    name: s.name.substring(0, 15),
    reduction: s.estimated_co2_reduction_pct,
    cost: s.implementation_cost_millions,
  }));

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">CO₂ Reduction Strategies Comparison</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="text-center text-slate-400">Loading strategies...</div>
        ) : (
          <>
            {strategies.length > 0 && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis yAxisId="left" stroke="#94a3b8" label={{ value: 'CO₂ Reduction (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" label={{ value: 'Cost ($M)', angle: 90, position: 'insideRight', fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '4px' }} labelStyle={{ color: '#e2e8f0' }} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="reduction" fill="#10b981" name="CO₂ Reduction %" />
                  <Bar yAxisId="right" dataKey="cost" fill="#f59e0b" name="Cost ($M)" />
                </BarChart>
              </ResponsiveContainer>
            )}

            <div className="bg-slate-700 p-4 rounded-lg space-y-3 border border-slate-600">
              <h3 className="font-semibold text-slate-100">Add New Strategy</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Strategy name"
                  value={newStrategy.name}
                  onChange={(e) => setNewStrategy({ ...newStrategy, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newStrategy.description}
                  onChange={(e) => setNewStrategy({ ...newStrategy, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="CO₂ reduction %"
                    value={newStrategy.estimated_co2_reduction_pct}
                    onChange={(e) => setNewStrategy({ ...newStrategy, estimated_co2_reduction_pct: parseFloat(e.target.value) })}
                    className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                  <input
                    type="number"
                    placeholder="Cost ($M)"
                    value={newStrategy.implementation_cost_millions}
                    onChange={(e) => setNewStrategy({ ...newStrategy, implementation_cost_millions: parseFloat(e.target.value) })}
                    className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Timeline (months)"
                    value={newStrategy.implementation_timeline_months}
                    onChange={(e) => setNewStrategy({ ...newStrategy, implementation_timeline_months: parseInt(e.target.value) })}
                    className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                  <select
                    value={newStrategy.priority}
                    onChange={(e) => setNewStrategy({ ...newStrategy, priority: parseInt(e.target.value) })}
                    className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  >
                    <option value="1">Priority 1 (High)</option>
                    <option value="2">Priority 2</option>
                    <option value="3">Priority 3</option>
                    <option value="4">Priority 4</option>
                    <option value="5">Priority 5 (Low)</option>
                  </select>
                </div>
              </div>
              <Button onClick={handleAddStrategy} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
                Add Strategy
              </Button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {strategies.map((strategy) => (
                <div key={strategy.id} className="border border-slate-600 bg-slate-700 p-3 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-100">{strategy.name}</h4>
                        <span className="text-xs px-2 py-1 bg-slate-600 text-slate-200 rounded">{strategy.strategy_type}</span>
                      </div>
                      <p className="text-sm text-slate-400 mt-1">{strategy.description}</p>
                      <div className="text-xs text-slate-500 mt-2">
                        Timeline: {strategy.implementation_timeline_months} months | Priority: {strategy.priority}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-green-400 font-semibold">{strategy.estimated_co2_reduction_pct}%</div>
                      <div className="text-sm text-slate-400">${strategy.implementation_cost_millions}M</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
