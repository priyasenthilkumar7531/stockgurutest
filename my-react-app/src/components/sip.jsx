import React, { useState, useEffect } from 'react';

export default function SipCalculator() {
  // Calculator Form State
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [expectedReturnRate, setExpectedReturnRate] = useState(12);
  const [investmentPeriod, setInvestmentPeriod] = useState(10);

  // Calculation Results State
  const [totalInvested, setTotalInvested] = useState(0);
  const [estimatedReturns, setEstimatedReturns] = useState(0);
  const [totalValue, setTotalValue] = useState(0);

  // Run calculation logic dynamically whenever sliders move
  useEffect(() => {
    const P = monthlyInvestment; // Monthly amount
    const i = expectedReturnRate / 100 / 12; // Monthly interest rate
    const n = investmentPeriod * 12; // Total number of months

    // SIP Formula: M = P * [((1 + i)^n - 1) / i] * (1 + i)
    const calculatedTotalValue = P * (((Math.pow(1 + i, n) - 1) / i) * (1 + i));
    const calculatedInvestedAmount = P * n;
    const calculatedReturns = calculatedTotalValue - calculatedInvestedAmount;

    setTotalInvested(Math.round(calculatedInvestedAmount));
    setEstimatedReturns(Math.round(calculatedReturns));
    setTotalValue(Math.round(calculatedTotalValue));
  }, [monthlyInvestment, expectedReturnRate, investmentPeriod]);

  // Utility to format numbers cleanly to Indian Currency formatting system (INR)
  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex justify-center items-center p-6 font-sans">
      <div className="w-full max-w-4xl bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Controls & Sliders */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-100 tracking-tight">SIP Calculator</h2>
            <p className="text-xs text-gray-400 mt-1">Estimate the future value of your virtual wealth simulation assets</p>
          </div>

          {/* Monthly Investment Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Monthly Investment</label>
              <span className="text-sm font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                {formatCurrency(monthlyInvestment)}
              </span>
            </div>
            <input 
              type="range" min="500" max="100000" step="500"
              className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              value={monthlyInvestment} onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
            />
            <div className="flex justify-between text-[10px] text-gray-600 font-mono">
              <span>₹500</span>
              <span>₹1,00,000</span>
            </div>
          </div>

          {/* Expected Return Rate Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Expected Return Rate (p.a.)</label>
              <span className="text-sm font-mono font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg">
                {expectedReturnRate}%
              </span>
            </div>
            <input 
              type="range" min="1" max="30" step="0.5"
              className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              value={expectedReturnRate} onChange={(e) => setExpectedReturnRate(Number(e.target.value))}
            />
            <div className="flex justify-between text-[10px] text-gray-600 font-mono">
              <span>1%</span>
              <span>30%</span>
            </div>
          </div>

          {/* Time Period Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Investment Time Period</label>
              <span className="text-sm font-mono font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-lg">
                {investmentPeriod} Yr{investmentPeriod > 1 ? 's' : ''}
              </span>
            </div>
            <input 
              type="range" min="1" max="40" step="1"
              className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              value={investmentPeriod} onChange={(e) => setInvestmentPeriod(Number(e.target.value))}
            />
            <div className="flex justify-between text-[10px] text-gray-600 font-mono">
              <span>1 Yr</span>
              <span>40 Yrs</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Real-time Wealth Projections */}
        <div className="bg-gray-950 border border-gray-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-inner">
          <div className="space-y-5">
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest block border-b border-gray-900 pb-2">
              Simulation Forecast Overview
            </span>
            
            <div className="flex justify-between items-center border-b border-gray-900/40 pb-3">
              <span className="text-xs text-gray-400">Total Invested Capital</span>
              <span className="text-sm font-mono font-semibold text-gray-200">{formatCurrency(totalInvested)}</span>
            </div>

            <div className="flex justify-between items-center border-b border-gray-900/40 pb-3">
              <span className="text-xs text-gray-400">Estimated Returns (Wealth Gain)</span>
              <span className="text-sm font-mono font-semibold text-emerald-400">+{formatCurrency(estimatedReturns)}</span>
            </div>

            <div className="pt-2">
              <span className="text-[11px] text-gray-500 block uppercase font-medium">Estimated Future Account Value</span>
              <p className="text-3xl font-bold font-mono text-gray-100 tracking-tight mt-1">
                {formatCurrency(totalValue)}
              </p>
            </div>
          </div>

          {/* Context Interaction Button */}
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="w-full mt-6 py-3 text-xs font-bold uppercase tracking-wider text-black bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-500/10 transition-all active:scale-[0.98]"
          >
            Deploy Capital Into Stock Terminal
          </button>
        </div>

      </div>
    </div>
  );
}
