import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../../services/auth';

export default function TradeSlip({ tradeForm, setTradeForm, onSubmit, actionLoading }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef(null);
  const [typedInput, setTypedInput] = useState('');


  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 1. REPLACE your search API useEffect block with this:
  useEffect(() => {
    if (!typedInput.trim() || tradeForm.orderType === 'SELL') {
      setRecommendations([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await apiClient.get(`/api/market/search?q=${typedInput.trim()}`);

        // Target the Groww schema mapping layer: data -> content
        if (response.data && response.data.data && Array.isArray(response.data.data.content)) {
          const resultsArray = response.data.data.content;

          // Filter out derivatives/futures if you only want to allow trading raw stocks
          const equitiesOnly = resultsArray.filter(item => item.entity_type === "Stocks");

          if (equitiesOnly.length > 0) {
            setRecommendations(equitiesOnly);
            setShowDropdown(true);
          } else {
            setRecommendations([]);
            setShowDropdown(false);
          }
        } else {
          setRecommendations([]);
          setShowDropdown(false);
        }
      } catch (err) {
        console.error("Stock recommendations fetch failed:", err);
        setRecommendations([]);
        setShowDropdown(false);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [typedInput, tradeForm.orderType]);


  useEffect(() => {
    if (!tradeForm.searchId) return;

    async function fetchLiveMarketValue() {
      try {
        const detailsRes = await apiClient.get(`/api/market/stock/${tradeForm.searchId.toLowerCase()}`);
        let targetTickerCode = tradeForm.symbol;

        if (detailsRes.data) {
          const profile = detailsRes.data.stock || detailsRes.data;
          targetTickerCode = profile.header?.nseScriptCode || profile.header?.bseScriptCode || tradeForm.symbol;
        }

        const chartRes = await apiClient.get(`/api/market/chart/${targetTickerCode.toUpperCase()}`);

        if (chartRes.data && Array.isArray(chartRes.data.candles) && chartRes.data.candles.length > 0) {
          const candleGrid = chartRes.data.candles;
          const absoluteLatestNode = candleGrid[candleGrid.length - 1];
          const dynamicLivePrice = Array.isArray(absoluteLatestNode) ? absoluteLatestNode[1] : absoluteLatestNode;

          if (dynamicLivePrice) {
            setTradeForm(prev => ({
              ...prev,
              symbol: targetTickerCode.toUpperCase(),
              price: Number(dynamicLivePrice)
            }));
          }
        }
      } catch (err) {
        console.error("Price synchronization engine interrupted:", err);
      }
    }

    fetchLiveMarketValue();
    const pollerTimer = setInterval(fetchLiveMarketValue, 5000);
    return () => clearInterval(pollerTimer);
  }, [tradeForm.searchId, setTradeForm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTradeForm(prev => ({ ...prev, [name]: value }));
  };

  // 2. REPLACE your handleSelectStock function with this:
  const handleSelectStock = (stock) => {
    // Map snake_case properties from your search API payload profile
    const officialSlug = stock.search_id || stock.id || "";
    const officialSymbol = (stock.nse_scrip_code || stock.bse_scrip_code || "UNKNOWN").toUpperCase();
    const displayName = stock.title || stock.company_short_name || officialSymbol;

    setTradeForm(prev => ({
      ...prev,
      searchId: officialSlug, // "infosys-ltd" - sent directly to POST /buy
      symbol: officialSymbol,  // "INFY" - sent directly to POST /sell
      price: 0 // Reset to 0 while the chart poller fetches the live valuation point
    }));

    setTypedInput(displayName); // Puts clean text like "Infosys Ltd." into the visible field
    setShowDropdown(false);
  };



  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);
  };

  const estimatedTotal = Number(tradeForm.quantity || 0) * Number(tradeForm.price || 0);

  return (
    <div ref={dropdownRef} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md space-y-4">
      <h3 className="text-sm font-bold text-slate-700 tracking-wider uppercase font-mono">Order Terminal</h3>

      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
        <button
          type="button"
          onClick={() => setTradeForm(prev => ({ ...prev, orderType: 'BUY' }))}
          className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg cursor-pointer transition-all ${tradeForm.orderType === 'BUY' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          BUY
        </button>
        <button
          type="button"
          onClick={() => setTradeForm(prev => ({ ...prev, orderType: 'SELL' }))}
          className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg cursor-pointer transition-all ${tradeForm.orderType === 'SELL' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          SELL
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* REPLACE the BUY input container inside the return statement with this: */}
        {tradeForm.orderType === 'BUY' ? (
          <div className="space-y-1 relative">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
              Search Stock Company / Ticker
            </label>
            <input
              type="text"
              value={typedInput} // Binds to the isolated input state
              onChange={(e) => setTypedInput(e.target.value)} // Smooth typing, zero lag
              placeholder="Search (e.g., Tata, Reliance)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-mono text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              required={tradeForm.orderType === 'BUY'}
            />

            {/* 3. REPLACE the recommendations.map block inside your overlay container with this: */}
            {showDropdown && recommendations.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl max-h-48 overflow-y-auto z-50 shadow-lg divide-y divide-slate-100">
                {recommendations.map((stock, i) => {
                  // Extract properties using backend snake_case keys
                  const itemSymbol = (stock.nse_scrip_code || stock.bse_scrip_code || "STK").toUpperCase();
                  const itemTitle = stock.title || stock.company_short_name || itemSymbol;
                  const itemSlug = stock.search_id || stock.id || "";

                  return (
                    <div
                      key={itemSlug + i}
                      onClick={() => handleSelectStock(stock)}
                      className="p-3 text-xs font-mono flex justify-between items-center hover:bg-blue-50 cursor-pointer transition-colors text-slate-700"
                    >
                      <div>
                        <span className="text-slate-800 font-bold block">{itemTitle}</span>
                        <span className="text-[10px] text-slate-400">{itemSlug}</span>
                      </div>
                      <span className="bg-blue-50 px-2 py-0.5 rounded text-blue-600 font-bold">
                        {itemSymbol}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}


            {isSearching && (
              <span className="absolute right-3 top-9 text-[10px] text-slate-400 font-mono animate-pulse">Searching...</span>
            )}
          </div>
        ) : (

          /* Locked Static Ticker View - for SELL orders generated from clicking asset buttons */
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Asset Selected for Liquidations</label>
            <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-mono text-slate-600 flex justify-between items-center">
              <span className="font-bold text-slate-700">{(tradeForm.symbol || "SELECT AN ASSET").toUpperCase()}</span>
              <span className="text-[10px] bg-rose-50 border border-rose-200 text-rose-600 font-bold px-1.5 py-0.5 rounded">SELL MODE</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
            <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider mb-1">Live Asset Value</span>
            <span className={`text-sm font-mono font-bold block ${tradeForm.orderType === 'BUY' ? 'text-blue-600' : 'text-rose-600'}`}>
              {formatINR(tradeForm.price)}
            </span>
          </div>

          <div className="space-y-1">
            <input
              type="number"
              name="quantity"
              value={tradeForm.quantity}
              onChange={handleInputChange}
              min="1"
              placeholder="Qty"
              className="w-full h-full bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm font-mono text-center text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white"
              required
            />
          </div>
        </div>

        <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl flex justify-between items-center text-xs font-mono">
          <span className="text-slate-500">Estimated Valuation:</span>
          <span className="font-bold text-slate-700">{formatINR(estimatedTotal)}</span>
        </div>

        <button
          type="submit"
          disabled={actionLoading}
          className={`w-full py-3 rounded-xl font-mono text-xs font-bold tracking-wider transition-all cursor-pointer ${tradeForm.orderType === 'BUY' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'
            } disabled:opacity-50`}
        >
          {actionLoading ? '⚡ TRANSMITTING ORDER...' : `EXECUTE ${tradeForm.orderType} ORDER`}
        </button>
      </form>
    </div>
  );
}


