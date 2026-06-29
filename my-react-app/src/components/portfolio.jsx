import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/auth';
import PortfolioMetrics from '../components/portfolio/portfoliometrics';
import HoldingsList from '../components/portfolio/holdinglist';
import TradeSlip from '../components/portfolio/tradingorder';
import PortfolioSummary from '../components/portfolio/portfoliosummary';

export default function PortfolioDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('holdings');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [holdings, setHoldings] = useState([]);
  const [summary, setSummary] = useState(null);

  const [tradeForm, setTradeForm] = useState({
    searchId: '',
    symbol: '',
    quantity: 1,
    price: 0,
    orderType: 'BUY'
  });

  const fetchPortfolioData = useCallback(async () => {
    try {
      const [analyticsRes, historyRes, holdingsRes, summaryRes] = await Promise.all([
        apiClient.get('/api/portfolio/analytics'),
        apiClient.get('/api/portfolio/history'),
        apiClient.get('/api/portfolio/holdings'),
        apiClient.get('/api/portfolio/summary')
      ]);

      if (analyticsRes.data?.success) setAnalytics(analyticsRes.data.analytics);
      if (historyRes.data?.success) setHistory(historyRes.data.history);
      if (holdingsRes.data?.success) setHoldings(holdingsRes.data.holdings);
      if (summaryRes.data?.success) setSummary(summaryRes.data.summary);
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Data sync error.' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolioData();
  }, [fetchPortfolioData]);

  const handleExecuteTrade = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedback({ type: '', message: '' });

    const isBuy = tradeForm.orderType === 'BUY';
    const endpoint = isBuy ? '/api/portfolio/buy' : '/api/portfolio/sell';

    const payload = isBuy
      ? { searchId: tradeForm.searchId?.trim().toLowerCase() || '', quantity: Number(tradeForm.quantity) }
      : { symbol: tradeForm.symbol?.trim().toUpperCase() || '', quantity: Number(tradeForm.quantity) };

    try {
      const response = await apiClient.post(endpoint, payload);
      if (response.data?.success) {
        setFeedback({ type: 'success', message: response.data.message || 'Trade executed.' });
        fetchPortfolioData();
        setTradeForm(prev => ({ ...prev, quantity: 1, searchId: '', symbol: '' }));
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Execution declined.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {feedback.message && (
          <div className={`p-3 text-xs rounded-xl font-mono border ${
            feedback.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}>
            {feedback.type === 'success' ? '✓ SUCCESS: ' : '⚠️ REJECTED: '}{feedback.message}
          </div>
        )}

        {/* 1. Indian Rupee Cards Summary with built-in Shimmer */}
        <PortfolioSummary summary={summary} isLoading={isLoading} />

        {/* 2. Metrics Block with Inline Shimmer logic */}
        {isLoading ? (
          <div className="w-full h-48 bg-white border border-slate-200 rounded-xl animate-pulse flex items-center justify-center">
            <div className="h-32 bg-slate-100 rounded-lg w-[95%]"></div>
          </div>
        ) : (
          <PortfolioMetrics analytics={analytics} />
        )}

        {/* 3. Holdings Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 animate-pulse">
                {/* Simulated Tab Bar */}
                <div className="flex space-x-4">
                  <div className="h-8 bg-slate-200 rounded w-24"></div>
                  <div className="h-8 bg-slate-200 rounded w-24"></div>
                </div>
                {/* Simulated Data Rows */}
                <div className="space-y-3 pt-4">
                  <div className="h-10 bg-slate-200 rounded w-full"></div>
                  <div className="h-10 bg-slate-100 rounded w-full"></div>
                  <div className="h-10 bg-slate-100 rounded w-full"></div>
                </div>
              </div>
            ) : (
              <HoldingsList
                holdings={holdings}
                history={history}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                setTradeForm={setTradeForm}
              />
            )}
          </div>
          
          <div>
            <TradeSlip
              tradeForm={tradeForm}
              setTradeForm={setTradeForm}
              onSubmit={handleExecuteTrade}
              actionLoading={actionLoading}
            />
          </div>
        </div>

      </div>
    </div>
  );
}





