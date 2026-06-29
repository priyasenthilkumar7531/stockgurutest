import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Custom Hook to trigger flashing effects when prices shift
function useFlashEffect(value) {
  const [flashClass, setFlashClass] = useState('');
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (prevValueRef.current === undefined) {
      prevValueRef.current = value;
      return;
    }

    if (value > prevValueRef.current) {
      setFlashClass('bg-emerald-100 text-emerald-900 transition-none dark:bg-emerald-900/30 dark:text-emerald-400');
      const timer = setTimeout(() => setFlashClass('transition duration-1000 ease-out'), 50);
      return () => clearTimeout(timer);
    } else if (value < prevValueRef.current) {
      setFlashClass('bg-rose-100 text-rose-900 transition-none dark:bg-rose-900/30 dark:text-rose-400');
      const timer = setTimeout(() => setFlashClass('transition duration-1000 ease-out'), 50);
      return () => clearTimeout(timer);
    }

    prevValueRef.current = value;
  }, [value]);

  return flashClass;
}

// A reusable Table Row component to handle isolated flash states and avoid rebuilding the whole list
function StockTableRow({ item }) {
  const companyInfo = item?.company || {};
  const statsInfo = item?.stats || {};
  
  const currentLtp = statsInfo?.ltp || 0;
  const dayChange = statsInfo?.dayChange || 0;
  const pctChange = statsInfo?.dayChangePerc || 0;
  const isPositive = dayChange >= 0;

  // Track price movement flashes exclusively inside this row
  const priceFlashClass = useFlashEffect(currentLtp);

  return (
    <tr key={companyInfo?.searchId || companyInfo?.isin} className="hover:bg-slate-50/80 transition duration-150">
      <td className="px-6 py-4 flex items-center gap-3">
        {companyInfo?.imageUrl && (
          <img src={companyInfo.imageUrl} alt="" className="w-8 h-8 rounded-full object-contain bg-white border border-gray-200 p-0.5 shrink-0" />
        )}
        <div>
          <div className="text-gray-800 font-bold">{companyInfo?.companyName}</div>
          <div className="mt-1">
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-blue-900 border border-slate-200">
              {companyInfo?.nseScriptCode || companyInfo?.bseScriptCode}
            </span>
          </div>
        </div>
      </td>

      {/* Flashing Price Target Cell */}
      <td className={`px-6 py-4 text-right font-bold font-mono text-gray-900 rounded-lg ${priceFlashClass}`}>
        ₹{currentLtp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </td>

      <td className={`px-6 py-4 text-right font-bold font-mono ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
        <div>{isPositive ? '+' : ''}{dayChange.toFixed(2)}</div>
        <div className={`text-[11px] font-semibold inline-block px-1.5 py-0.2 rounded mt-0.5 ${isPositive ? 'bg-emerald-50' : 'bg-rose-50'}`}>
          {isPositive ? '+' : ''}{pctChange.toFixed(2)}%
        </div>
      </td>

      <td className="px-6 py-4 text-right font-mono text-xs text-gray-600">
        <div className="flex justify-end items-center gap-2">
          <span className="text-rose-500 font-medium">₹{(statsInfo?.low || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          <span className="text-gray-300">|</span>
          <span className="text-emerald-600 font-medium">₹{(statsInfo?.high || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
      </td>
    </tr>
  );
}

export default function FullMostBoughtPage({ data }) {
  const navigate = useNavigate();
  const [localData, setLocalData] = useState(data || null);
  const [loading, setLoading] = useState(!data);

  // Reusable fetching mechanism
  const fetchMostBought = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const res = await fetch('/api/market/most-bought');
      if (!res.ok) throw new Error('Network failure');
      const json = await res.json();
      setLocalData(json);
    } catch (err) {
      console.error('Failed to sync most-bought data:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    // Initial Fetch execution if parent context didn't broadcast payload
    if (!data) {
      fetchMostBought(true);
    }

    // Set up real background data revalidation cycle every 5 minutes
    const revalidateInterval = setInterval(() => {
      fetchMostBought(false);
    }, 5 * 60 * 1000);

    return () => clearInterval(revalidateInterval);
  }, [data]);

  const dataToUse = data || localData;
  const companies = dataToUse?.exploreCompanies?.POPULAR_STOCKS_MOST_BOUGHT || [];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 select-none">
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation Action Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/maindashboard")}
              className="px-4 py-2 text-xs font-bold text-blue-900 bg-white hover:bg-slate-50 border border-gray-200 rounded-xl shadow-xs cursor-pointer transition"
            >
              ← Back to Dashboard
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-blue-900 m-0">All Most Bought Stocks</h1>
              <p className="text-xs text-gray-400 font-medium m-0 mt-0.5">Comprehensive review on Stockguru</p>
            </div>
          </div>
          {/* Subtle real-time indicator tracking */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Tracking Live
          </div>
        </div>

        {/* Complete Unrestricted Array Data Matrix Table */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  <th className="px-6 py-4">Asset / Symbol</th>
                  <th className="px-6 py-4 text-right">LTP (₹)</th>
                  <th className="px-6 py-4 text-right">Day Change</th>
                  <th className="px-6 py-4 text-right">Today's Trading Range (Low / High)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {companies.map((item) => (
                  <StockTableRow 
                    key={item?.company?.searchId || item?.company?.isin} 
                    item={item} 
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
