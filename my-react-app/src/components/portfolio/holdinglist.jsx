import React from 'react';

export default function HoldingsList({ holdings, history, activeTab, setActiveTab, setTradeForm }) {
  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val || 0);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md">
      <div className="flex space-x-4 border-b border-slate-200 pb-3 mb-4">
        <button 
          type="button"
          onClick={() => setActiveTab('holdings')} 
          className={`pb-1 text-xs uppercase font-bold tracking-wider bg-transparent cursor-pointer border-none outline-none ${
            activeTab === 'holdings' ? 'text-blue-600 border-b-2 border-solid border-blue-600' : 'text-slate-400'
          }`}
        >
          Active Holdings
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab('history')} 
          className={`pb-1 text-xs uppercase font-bold tracking-wider bg-transparent cursor-pointer border-none outline-none ${
            activeTab === 'history' ? 'text-blue-600 border-b-2 border-solid border-blue-600' : 'text-slate-400'
          }`}
        >
          Transaction History
        </button>
      </div>

      {activeTab === 'holdings' && (
        <div className="space-y-3">
          {!holdings || holdings.length === 0 ? (
            <p className="text-xs text-slate-400 font-mono italic text-center py-6">Your simulated asset locker is empty.</p>
          ) : (
            holdings.map((stock, index) => {
              const currentSymbol = (stock.symbol || "UNKNOWN").toUpperCase();
              const displayName = stock.companyName || stock.name || currentSymbol;
              const currentQty = stock.quantity || 0;
              const buyPrice = stock.avgPrice || stock.price || 0;
              const currentVal = stock.currentValue || (currentQty * buyPrice);
              const calculatedPnL = stock.pnl !== undefined ? stock.pnl : 0;
              const calculatedReturn = stock.returnPercent || 0;

              return (
                <div key={stock._id || currentSymbol || index} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex justify-between items-center group transition hover:border-blue-200 hover:bg-blue-50/30">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">{displayName}</span>
                      <span className="text-[10px] font-mono bg-blue-100 px-1.5 py-0.5 rounded text-blue-700 font-bold">{currentSymbol}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-1">
                      Vol: <span className="text-slate-700 font-bold">{currentQty}</span> · Avg: <span className="text-slate-600">{formatINR(buyPrice)}</span>
                    </p>
                  </div>
                  
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <span className="text-sm font-mono font-bold text-slate-800 block">{formatINR(currentVal)}</span>
                      <span className={`text-xs font-mono font-bold ${calculatedPnL >= 0 ? 'text-emerald-600' : 'text-rose-650'}`}>
                        {calculatedPnL >= 0 ? '▲ +' : '▼ '}{formatINR(calculatedPnL)} ({calculatedReturn}%)
                      </span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setTradeForm({
                        searchId: stock.searchId || currentSymbol.toLowerCase(),
                        symbol: currentSymbol,
                        quantity: currentQty,
                        price: stock.currentPrice || buyPrice,
                        orderType: 'SELL'
                      })}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold px-2 py-1 rounded text-[10px] font-mono cursor-pointer"
                    >
                      SELL ALL
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {!history || history.length === 0 ? (
            <p className="text-xs text-slate-400 font-mono italic text-center py-6">No historical records logged yet.</p>
          ) : (
            history.map((log) => (
              <div key={log._id} className="bg-slate-50 p-3 border border-slate-200 rounded-xl flex justify-between items-center text-xs font-mono">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      log.type === 'BUY' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>{log.type}</span>
                    <span className="font-bold text-slate-700">{log.symbol.toUpperCase()}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-700 block">{log.quantity} Share(s) @ {formatINR(log.price)}</span>
                  <span className="text-[10px] text-slate-500 font-medium">Total: {formatINR(log.amount || (log.quantity * log.price))}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

