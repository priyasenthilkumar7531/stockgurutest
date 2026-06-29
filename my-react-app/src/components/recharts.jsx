import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

// --- MOCK DATA GENERATOR (Temporary API Replacement) ---
const generateMockChartData = (timeframe) => {
  const points = timeframe === '1D' ? 24 : timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : 365;
  const data = [];
  let basePrice = 150 + Math.random() * 100;
  
  const now = new Date();
  for (let i = points; i >= 0; i--) {
    const date = new Date(now);
    if (timeframe === '1D') date.setHours(now.getHours() - i);
    else date.setDate(now.getDate() - i);

    // Realistic market volatility calculation
    const change = (Math.random() - 0.48) * (basePrice * 0.02);
    basePrice += change;

    data.push({
      time: timeframe === '1D' 
        ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      price: parseFloat(basePrice.toFixed(2)),
    });
  }
  return data;
};

export default function StockChart() {
  const [chartType, setChartType] = useState("line");
  const [ticker, setTicker] = useState('AAPL');
  const [timeframe, setTimeframe] = useState('1M');
  const [chartData, setChartData] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Simulate API data loading timeline
  useEffect(() => {
    setIsGenerating(true);
    const timer = setTimeout(() => {
      setChartData(generateMockChartData(timeframe));
      setIsGenerating(false);
    }, 300); // Small delay to feel like a real network call
    return () => clearTimeout(timer);
  }, [ticker, timeframe]);

  // Calculate quick mock performance statistics
  const startPrice = chartData[0]?.price || 0;
  const endPrice = chartData[chartData.length - 1]?.price || 0;
  const priceDiff = endPrice - startPrice;
  const percentChange = startPrice ? ((priceDiff / startPrice) * 100).toFixed(2) : 0;
  const isPositive = priceDiff >= 0;

  return (
    <div className="bg-sky-50 min-h-screen p-6">
  <div className="bg-white border border-sky-100 rounded-2xl p-6 shadow-lg w-full">
      {/* Chart Configuration Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-3">
            <select 
              value={ticker} 
              onChange={(e) => setTicker(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white font-bold px-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="AAPL">AAPL (Apple)</option>
              <option value="MSFT">MSFT (Microsoft)</option>
              <option value="TSLA">TSLA (Tesla)</option>
              <option value="NVDA">NVDA (NVIDIA)</option>
            </select>
            {isGenerating && <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />}
          </div>
          
          {/* Main Price Numbers */}
          <div className="flex items-baseline gap-3 mt-2">
            <span className="text-3xl font-mono font-bold text-white">${endPrice.toFixed(2)}</span>
            <span className={`flex items-center gap-1 text-sm font-semibold font-mono ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {isPositive ? '+' : ''}{priceDiff.toFixed(2)} ({isPositive ? '+' : ''}{percentChange}%)
            </span>
          </div>
        </div>

        {/* Timeframe Selectors */}
        <div className="flex bg-gray-800 p-1 rounded-lg border border-gray-700 font-mono">
          {['1D', '1W', '1M', '1Y'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-150 ${
                timeframe === tf 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Recharts Component Context */}
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#6b7280" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              stroke="#6b7280" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dx={-5}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px' }}
              labelStyle={{ color: '#9ca3af', fontFamily: 'monospace' }}
              itemStyle={{ color: '#fff', fontFamily: 'monospace', fontWeight: 'bold' }}
              formatter={(value) => [`$${value}`, 'Price']}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke={isPositive ? '#10b981' : '#f43f5e'} 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorPrice)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
    </div>
  );
}
