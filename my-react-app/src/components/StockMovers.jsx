import React from 'react';

function StockTable({ title, dataPayload, type }) {
  const isGainer = type === 'gainers';
  
  // Extract stock dataset from the flat layout array safely
  const stockList = dataPayload?.data?.stocks || [];

  if (stockList.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center text-gray-400 text-xs flex-1 shadow-sm">
        No active data stream for {title}.
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex-1">
      {/* Header Block Panel with Soft Colored Pill Accent */}
      <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <h3 className="text-base font-bold text-blue-900 m-0 flex items-center gap-2">
          <span>{isGainer ? '📈' : '📉'}</span> {title}
        </h3>
        <span className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-lg border ${
          isGainer 
            ? 'bg-green-50 text-green-700 border-green-200' 
            : 'bg-red-50 text-red-600 border-red-100'
        }`}>
          Top {Math.min(stockList.length, 5)}
        </span>
      </div>

      {/* Corporate Ledger Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
              <th className="px-5 py-3.5">Company / Script</th>
              <th className="px-5 py-3.5 text-right">LTP (₹)</th>
              <th className="px-5 py-3.5 text-right">Net Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {stockList.slice(0, 5).map((stock) => {
              const currentLtp = stock?.ltp || 0;
              const yesterdayClose = stock?.close || 0;
              const nominalChange = currentLtp - yesterdayClose;
              const percentChange = yesterdayClose !== 0 ? ((nominalChange / yesterdayClose) * 100).toFixed(2) : '0.00';

              return (
                <tr key={stock?.searchId || stock?.isin} className="hover:bg-slate-50/80 transition duration-150">
                  {/* Company Profile Column */}
                  <td className="px-5 py-3.5 flex items-center gap-3">
                    {stock?.logoUrl && (
                      <img 
                        src={stock.logoUrl} 
                        alt={stock.companyShortName}
                        className="w-8 h-8 rounded-full object-contain bg-white p-0.5 border border-gray-200 shadow-xs shrink-0"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <div className="min-w-0">
                      <div className="text-gray-800 font-bold truncate max-w-[140px] sm:max-w-[180px]">
                        {stock?.companyShortName || stock?.companyName}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 bg-slate-100 border border-slate-200 rounded text-blue-900">
                          {stock?.nseScriptCode || stock?.bseScriptCode || 'N/A'}
                        </span>
                        {stock?.tag && (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-100 rounded">
                            {stock.tag}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Price Column */}
                  <td className="px-5 py-3.5 text-right font-bold font-mono text-gray-900">
                    ₹{currentLtp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>

                  {/* Volatility Indicator Column */}
                  <td className={`px-5 py-3.5 text-right font-bold font-mono ${isGainer ? 'text-green-600' : 'text-red-600'}`}>
                    <div>{isGainer ? '+' : ''}{nominalChange.toFixed(2)}</div>
                    <div className={`text-[11px] font-semibold inline-block px-1.5 py-0.2 rounded mt-0.5 ${
                      isGainer ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      {isGainer ? '+' : ''}{percentChange}%
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function StockMovers({ gainersData, losersData }) {
  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full md:flex-row gap-4 w-full">
      {/* Explicitly passing data properties straight down to separate table structures */}
      <StockTable title="Top Gainers" dataPayload={gainersData} type="gainers" />
      <StockTable title="Top Losers" dataPayload={losersData} type="losers" />
    </div>
  );
}
