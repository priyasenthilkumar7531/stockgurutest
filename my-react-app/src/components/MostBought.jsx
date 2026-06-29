import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function useFlashEffect(value) {
  const [flashClass, setFlashClass] = useState('');
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (prevValueRef.current === undefined) { prevValueRef.current = value; return; }
    if (value > prevValueRef.current) {
      setFlashClass('bg-emerald-50 text-emerald-700 transition-none');
      const timer = setTimeout(() => setFlashClass('transition duration-700 ease-out'), 50);
      return () => clearTimeout(timer);
    } else if (value < prevValueRef.current) {
      setFlashClass('bg-rose-50 text-rose-700 transition-none');
      const timer = setTimeout(() => setFlashClass('transition duration-700 ease-out'), 50);
      return () => clearTimeout(timer);
    }
    prevValueRef.current = value;
  }, [value]);

  return flashClass;
}

function MostBoughtRow({ item }) {
  const companyInfo = item?.company || {};
  const statsInfo = item?.stats || {};
  const currentLtp = statsInfo?.ltp || 0;
  const dayChange = statsInfo?.dayChange || 0;
  const pctChange = statsInfo?.dayChangePerc || 0;
  const isPositive = dayChange >= 0;

  const priceFlashClass = useFlashEffect(currentLtp);

  return (
    <tr className="hover:bg-slate-50/60 transition-colors">
      <td className="px-6 py-4 flex items-center gap-3">
        {companyInfo?.imageUrl && <img src={companyInfo.imageUrl} alt="" className="w-8 h-8 rounded-full object-contain shrink-0 bg-white border border-slate-100 p-0.5" />}
        <div className="min-w-0">
          <div className="text-slate-800 font-semibold truncate max-w-[180px]">{companyInfo?.companyName}</div>
          <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-blue-50 text-blue-600 border border-blue-100/50">{companyInfo?.nseScriptCode}</span>
        </div>
      </td>
      <td className={`px-6 py-4 text-right font-mono font-bold text-slate-900 ${priceFlashClass}`}>
        ₹{currentLtp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </td>
      <td className={`px-6 py-4 text-right font-mono font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
        <div>{isPositive ? '+' : ''}{dayChange.toFixed(2)}</div>
        <div className={`text-[10px] font-semibold px-1 rounded inline-block mt-0.5 ${isPositive ? 'bg-emerald-50' : 'bg-rose-50'}`}>{isPositive ? '+' : ''}{pctChange.toFixed(2)}%</div>
      </td>
      <td className="px-6 py-4 text-right font-mono text-xs text-slate-500">
        <span className="text-rose-500">₹{(statsInfo?.low || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        <span className="mx-1 text-slate-300">|</span>
        <span className="text-emerald-500">₹{(statsInfo?.high || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      </td>
    </tr>
  );
}

export default function MostBought({ data }) {
  const navigate = useNavigate();
  const companies = data?.exploreCompanies?.POPULAR_STOCKS_MOST_BOUGHT || [];

  if (companies.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 shadow-xs">
        <p className="font-semibold text-slate-500 m-0">No live stock data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs w-full">
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <h2 className="text-base font-bold text-blue-900 flex items-center gap-2 m-0">Most Bought on StockGuru</h2>
        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-md">Top 3</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/30 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <th className="px-6 py-3.5">Asset / Symbol</th>
              <th className="px-6 py-3.5 text-right">LTP (₹)</th>
              <th className="px-6 py-3.5 text-right">Day Change</th>
              <th className="px-6 py-3.5 text-right">Today's Range (Low / High)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {companies.slice(0, 3).map((item) => (
              <MostBoughtRow key={item?.company?.searchId || item?.company?.isin} item={item} />
            ))}
          </tbody>
        </table>
      </div>
      {companies.length > 3 && (
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
          <button onClick={() => navigate('/mostbought')} className="text-xs font-bold text-blue-500 hover:text-blue-600 bg-transparent border-none cursor-pointer transition-colors">
            See More Most Bought Stocks →
          </button>
        </div>
      )}
    </div>
  );
}

