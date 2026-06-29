import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/auth';
import Navbar from '../components/Navbar'; // Adjust this path if your folder layout is different

export default function WatchList() {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Inline Search & Dropdown States for Adding Assets
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef(null);

  // 1. Fetch live watchlist data from server on mount
  const fetchWatchlist = async () => {
    try {
      const response = await apiClient.get('/api/watchlist/');
      if (response.data && response.data.success) {
        setWatchlist(response.data.watchlist || []);
      }
    } catch (err) {
      console.error("Failed to sync watchlist telemetry:", err);
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to sync your tracked companies.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  // Close dropdown overlay when clicking anywhere outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Debounced search hook to find new stocks to add
  useEffect(() => {
    if (!searchQuery.trim()) {
      setRecommendations([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await apiClient.get(`/api/market/search?q=${searchQuery.trim()}`);
        if (response.data && response.data.data && Array.isArray(response.data.data.content)) {
          const equitiesOnly = response.data.data.content.filter(item => item.entity_type === "Stocks");
          setRecommendations(equitiesOnly);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Watchlist additions search breakdown:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // 3. Add stock item from dropdown select trigger
  const handleAddToWatchlist = async (stock) => {
    const itemSymbol = (stock.nse_scrip_code || stock.bse_scrip_code || "UNKNOWN").toUpperCase();
    const itemTitle = stock.title || stock.company_short_name || itemSymbol;
    const itemSlug = stock.search_id || stock.id || "";

    if (watchlist.some(item => item.symbol.toUpperCase() === itemSymbol)) {
      setFeedback({ type: 'error', message: `${itemSymbol} is already in your watchlist.` });
      setSearchQuery('');
      setShowDropdown(false);
      return;
    }

    setFeedback({ type: '', message: '' });
    try {
      const response = await apiClient.post('/api/watchlist/add', {
        symbol: itemSymbol,
        companyName: itemTitle,
        searchId: itemSlug,
        livePrice: 1000.00
      });

      if (response.data.success) {
        setFeedback({ type: 'success', message: `${itemSymbol} pinned to monitoring board successfully.` });
        setSearchQuery('');
        setShowDropdown(false);
        fetchWatchlist();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to pin target stock.' });
    }
  };

  // 4. Remove stock item from watchlist index queue
  const handleRemoveFromWatchlist = async (symbol) => {
    setActionId(symbol);
    setFeedback({ type: '', message: '' });

    try {
      const response = await apiClient.delete(`/api/watchlist/${symbol.toUpperCase()}`);
      if (response.data.success) {
        setFeedback({ type: 'success', message: response.data.message || `${symbol.toUpperCase()} removed from tracking index.` });
        setWatchlist(prev => prev.filter(item => item.symbol !== symbol));
      }
    } catch (err) {
      console.error("Watchlist item deletion failed:", err);
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to execute removal.' });
    } finally {
      setActionId(null);
    }
  };

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans select-none">

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* Banner Headers Title Layout */}
        <header className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800 m-0">My Watchlist</h1>
            <p className="text-xs text-slate-400 mt-1 m-0 font-medium">Monitor live pricing tickers for preferred equity targets before initiating trades</p>
          </div>

          {/* Search Bar Input Container */}
          <div ref={dropdownRef} className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Add stock (e.g., Tata, Reliance)"
              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm transition-all"
            />
            {isSearching && (
              <span className="absolute right-3 top-3 text-[10px] text-slate-400 font-mono animate-pulse">Scanning...</span>
            )}

            {/* Dropdown Results */}
            {showDropdown && recommendations.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl max-h-48 overflow-y-auto z-50 shadow-lg divide-y divide-slate-100">
                {recommendations.map((stock, i) => {
                  const itemSymbol = (stock.nse_scrip_code || stock.bse_scrip_code || "STK").toUpperCase();
                  const itemTitle = stock.title || stock.company_short_name || itemSymbol;
                  const itemSlug = stock.search_id || stock.id || "";

                  return (
                    <div
                      key={itemSlug + i}
                      onClick={() => handleAddToWatchlist(stock)}
                      className="p-2.5 text-xs font-mono flex justify-between items-center hover:bg-blue-50 cursor-pointer transition-colors text-slate-700"
                    >
                      <div className="truncate max-w-[70%]">
                        <span className="text-slate-800 font-bold block truncate">{itemTitle}</span>
                        <span className="text-[9px] text-slate-400 block truncate">{itemSlug}</span>
                      </div>
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">{itemSymbol}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </header>

        {/* Feedback Bar */}
        {feedback.message && (
          <div className={`p-3 text-xs rounded-xl font-mono border ${feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}>
            {feedback.type === 'success' ? '✓ SUCCESS: ' : '⚠️ NOTICE: '}{feedback.message}
          </div>
        )}

        {/* --- MAIN ASSET REPOSITORY CONTENT DISPLAY --- */}
        {isLoading ? (
          /* RESPONSIVE SHIMMER UI LOADING COMPONENT */
          <div className="space-y-4 animate-pulse">
            {/* Desktop Table View Shimmer Skeleton Loader */}
            <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-100 h-10 w-full border-b border-slate-200"></div>
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="flex justify-between items-center py-2">
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/6"></div>
                    <div className="h-4 bg-slate-100 rounded w-1/6"></div>
                    <div className="h-6 bg-slate-200 rounded w-12"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Stack View Shimmer Cards */}
            <div className="block md:hidden space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-6 bg-slate-200 rounded w-10"></div>
                  </div>
                  <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        ) : watchlist.length === 0 ? (
          /* EMPTY MONITORING STATE MAPPER */
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-sm">
            <p className="text-3xl m-0">📋</p>
            <h3 className="text-base font-bold text-slate-700 mt-3 m-0">Your watchlist is empty</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-0 leading-relaxed">
              Use the search bar above to look up instruments and pin them here for persistent ledger tracking.
            </p>
          </div>
        ) : (
          /* RESPONSIVE WATCHLIST VIEWER GRID */
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">

            {/* Desktop Structured Viewport Wrapper */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Company</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ticker Symbol</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Monitored Base Price</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {watchlist.map((asset) => (
                    <tr key={asset.id || asset.symbol} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 text-xs font-bold text-slate-800 font-mono truncate max-w-[240px]">
                        {asset.companyName || "Equity Asset"}
                      </td>
                      <td className="p-4">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider font-mono">
                          {asset.symbol}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-bold text-slate-700 font-mono text-right">
                        {formatINR(asset.livePrice || asset.price)}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleRemoveFromWatchlist(asset.symbol)}
                          disabled={actionId === asset.symbol}
                          className="text-xs font-bold text-red-600 hover:text-red-800 bg-transparent border-none cursor-pointer disabled:opacity-40 transition-colors"
                        >
                          {actionId === asset.symbol ? 'Removing...' : 'Unpin'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards Layout (Flawless Vertical Stack) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {watchlist.map((asset) => (
                <div key={asset.id || asset.symbol} className="p-4 flex flex-col space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="truncate pr-4">
                      <h4 className="text-xs font-bold text-slate-800 font-mono m-0 truncate">{asset.companyName || "Equity Asset"}</h4>
                      <span className="inline-block bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider font-mono mt-1">
                        {asset.symbol}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveFromWatchlist(asset.symbol)}
                      disabled={actionId === asset.symbol}
                      className="text-xs font-bold text-red-600 bg-transparent border-none cursor-pointer disabled:opacity-40"
                    >
                      {actionId === asset.symbol ? '...' : '✕'}
                    </button>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[10px] text-slate-400 font-medium">Tracking Price</span>
                    <span className="text-xs font-bold text-slate-700 font-mono">
                      {formatINR(asset.livePrice || asset.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
    </div>
  
</div>
  )}
