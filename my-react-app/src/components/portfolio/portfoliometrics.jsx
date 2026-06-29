import React from 'react';

export default function PortfolioMetrics({ analytics }) {
  if (!analytics) return null;

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val || 0);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Total Valuation Card */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-blue-200 transition-colors">
        <span className="text-[10px] text-slate-400 font-mono tracking-wider block uppercase font-bold">Total Valuation</span>
        <p className="text-xl font-mono font-bold text-slate-800 mt-1">{formatINR(analytics.totalAccountValue)}</p>
      </div>

      {/* Invested Capital Card */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-blue-200 transition-colors">
        <span className="text-[10px] text-slate-400 font-mono tracking-wider block uppercase font-bold">Invested Capital</span>
        <p className="text-xl font-mono font-bold text-slate-600 mt-1">{formatINR(analytics.investedValue)}</p>
      </div>

      {/* Unrealized P&L Card */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-blue-200 transition-colors">
        <span className="text-[10px] text-slate-400 font-mono tracking-wider block uppercase font-bold">Unrealized P&L</span>
        <p className={`text-xl font-mono font-bold mt-1 ${analytics.unrealizedPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {analytics.unrealizedPnL >= 0 ? '+' : ''}{formatINR(analytics.unrealizedPnL)} 
          <span className="text-xs block font-sans font-semibold mt-0.5">
            ({analytics.returnPercentage?.toFixed(2)}%)
          </span>
        </p>
      </div>

      {/* Liquid Cash Card */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-blue-200 transition-colors">
        <span className="text-[10px] text-slate-400 font-mono tracking-wider block uppercase font-bold">Liquid Cash</span>
        <p className="text-xl font-mono font-bold text-blue-600 mt-1">{formatINR(analytics.cashBalance)}</p>
      </div>
    </div>
  );
}

