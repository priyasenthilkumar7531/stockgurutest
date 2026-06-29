import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { apiClient } from '../services/auth'; // Point to your Axios interceptor instance

export default function StockChart({ symbol }) {
  const [chartData, setChartData] = useState([]);
  const [isPositive, setIsPositive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChartPayload = async () => {
      setIsLoading(true);
      try {
        // MATCHES BACKEND: GET /api/market/chart/{symbol}
        const response = await apiClient.get(`/api/market/chart/${symbol}`);
        
        if (response.data && response.data.candles) {
          // Parse the array tuple array [timestamp, price] matching your backend data structure
          const formattedCandles = response.data.candles.map(([timestamp, price]) => {
            const dateObj = new Date(timestamp * 1000);
            return {
              // Convert to localized market format e.g., "03:45 PM"
              time: dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
              price: parseFloat(price)
            };
          });

          setChartData(formattedCandles);

          // Track price trends dynamically to handle shading overrides
          if (formattedCandles.length > 1) {
            const initialPrice = formattedCandles[0].price;
            const currentPrice = formattedCandles[formattedCandles.length - 1].price;
            setIsPositive(currentPrice >= initialPrice);
          }
        }
      } catch (err) {
        console.error("Failed to load timeline vector feeds:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (symbol) fetchChartPayload();
  }, [symbol]);

  // Loading Placeholder Layout - Light Blue Adaptive State
  if (isLoading) {
    return (
      <div className="h-64 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-xs font-mono text-slate-400 font-bold tracking-widest">
        LOADING LIVE ASSET TIMELINE GRAPH...
      </div>
    );
  }

  // Dynamic style parameters setup based on light theme trend standards
  const strokeColor = isPositive ? '#10B981' : '#EF4444'; // Emerald Green vs Crimson Red
  const fillColor = isPositive ? 'url(#colorGain)' : 'url(#colorLoss)';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2 hover:border-blue-200 transition-colors">
      <div className="flex justify-between items-center px-2">
        <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">Historical Vector Path (1m Ticks)</span>
        <span className={`text-xs font-mono font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
          {isPositive ? '▲ Bull Trend' : '▼ Bear Trend'}
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
            <defs>
              {/* Green Gradient mapping for trending gains */}
              <linearGradient id="colorGain" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
              {/* Red Gradient mapping for trending losses */}
              <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
              </linearGradient>
            </defs>

            {/* X Axis Labels Styled for Light Slate Backgrounds */}
            <XAxis 
              dataKey="time" 
              stroke="#94A3B8" 
              fontSize={9} 
              fontFamily="monospace"
              tickLine={false}
              axisLine={false}
              dy={10}
            />

            {/* Y Axis Labels Styled for Light Slate Backgrounds */}
            <YAxis 
              stroke="#94A3B8" 
              fontSize={9} 
              fontFamily="monospace"
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']} // Autoscale focus window around current values
            />

            {/* Tooltip Content Modified with High-Contrast White Background Frameworks */}
            <Tooltip 
              contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
              labelStyle={{ color: '#64748B', fontFamily: 'monospace', fontSize: '10px', fontWeight: 'bold' }}
              itemStyle={{ color: '#1E293B', fontFamily: 'monospace', fontSize: '11px', fontWeight: 'bold' }}
              formatter={(value) => [`₹${value}`, 'Price']}
            />

            <Area 
              type="monotone" 
              dataKey="price" 
              stroke={strokeColor} 
              strokeWidth={2} 
              fill={fillColor} 
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

