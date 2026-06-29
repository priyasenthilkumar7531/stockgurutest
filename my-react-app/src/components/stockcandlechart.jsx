import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { apiClient } from '../services/auth';
import { useNavigate } from 'react-router-dom';

export default function StockCandleChart({ symbol }) {
    const [candleSeries, setCandleSeries] = useState([]);
    const navigate=useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [timeframe, setTimeframe] = useState("1D");

    // Live state tracking for the top-right metric panel
    const [ohlc, setOhlc] = useState({ open: "-", high: "-", low: "-", close: "-" });

    const TIMEFRAMES = ["1D", "1W", "1M", "3M", "6M", "1Y", "3Y", "5Y", "All"];

    useEffect(() => {
        const fetchCandleData = async () => {
            if (!symbol) return;
            setIsLoading(true);
            try {
                const response = await apiClient.get(`/api/market/candles/${symbol}`, {
                    params: { range: timeframe }
                });
                
                if (response.data && response.data.candles) {
                    const rawData = response.data.candles;
                    const formattedCandles = rawData.map((row) => ({
                        x: new Date(row[0] * 1000).getTime(),
                        y: [parseFloat(row[1]), parseFloat(row[2]), parseFloat(row[3]), parseFloat(row[4])]
                    }));

                    setCandleSeries([{ data: formattedCandles }]);

                    // Set initial legend value to show the latest market candle closing figures
                    if (formattedCandles.length > 0) {
                        const lastCandle = formattedCandles[formattedCandles.length - 1].y;
                        setOhlc({
                            open: lastCandle[0].toFixed(2),
                            high: lastCandle[1].toFixed(2),
                            low: lastCandle[2].toFixed(2),
                            close: lastCandle[3].toFixed(2)
                        });
                    }
                }
            } catch (err) {
                console.error(err);
                setError("Failed to sync chart assets.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchCandleData();
    }, [symbol, timeframe]);

    const chartOptions = {
        chart: {
            type: 'candlestick',
            toolbar: { show: false },
            sparkline: { enabled: false },
            events: {
                // Listens for mouse movements over the candles to update the OHLC overlay strings dynamically
                mouseMove: function(event, chartContext, config) {
                    const seriesIndex = config.seriesIndex;
                    const dataPointIndex = config.dataPointIndex;
                    if (seriesIndex === 0 && dataPointIndex !== -1) {
                        const candleData = config.config.series[seriesIndex].data[dataPointIndex].y;
                        setOhlc({
                            open: candleData[0].toFixed(2),
                            high: candleData[1].toFixed(2),
                            low: candleData[2].toFixed(2),
                            close: candleData[3].toFixed(2)
                        });
                    }
                }
            }
        },
        // MINIMALIST OVERRIDES: Removes borders, grid lines, and axis markers
        grid: { show: false },
        xaxis: {
            type: 'datetime',
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { show: false } // Hidden to match your clean layout style
        },
        yaxis: {
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { show: false } // Hidden sidebar scales
        },
        tooltip: { enabled: false }, // Disables standard box tooltips so the top legend takes over
        plotOptions: {
            candlestick: {
                colors: { upward: '#22c55e', downward: '#ef4444' },
                wick: { useFillColor: true }
            }
        }
    };

    if (isLoading) return <div className="h-72 flex items-center justify-center text-xs text-slate-400 font-mono">⚡ Hydrating Canvas...</div>;
    if (error) return <div className="h-72 flex items-center justify-center text-xs text-rose-400 font-mono">⚠️ {error}</div>;

    return (
        <div className="w-full bg-white rounded-2xl p-4 space-y-4 font-sans select-none">
            
            {/* 1. TOP LIVE OHLC HEADER METRIC TRAY */}
            <div className="flex justify-between items-center px-2">
                <span className="text-[11px] font-bold text-slate-400 font-mono tracking-wider">LIVE MARKET INDEX ENGINE</span>
                <div className="flex items-center space-x-3 text-xs font-mono font-bold">
                    <span className="text-slate-400">Price</span>
                    <span className="text-slate-500">O <span className="text-emerald-500 font-extrabold">{ohlc.open}</span></span>
                    <span className="text-slate-500">H <span className="text-emerald-500 font-extrabold">{ohlc.high}</span></span>
                    <span className="text-slate-500">L <span className="text-emerald-500 font-extrabold">{ohlc.low}</span></span>
                    <span className="text-slate-500">C <span className="text-emerald-500 font-extrabold">{ohlc.close}</span></span>
                </div>
            </div>

            {/* 2. THE FLOATING CANDLESTICK CANVAS */}
            <div className="h-[250px] w-full">
                <Chart options={chartOptions} series={candleSeries} type="candlestick" height="100%" />
            </div>

            {/* 3. CLEAN BOTTOM TIMEFRAME PILL CONTROL BAR */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200/60 p-1 rounded-full shadow-inner">
                    {TIMEFRAMES.map((tf) => (
                        <button
                            key={tf}
                            type="button"
                            onClick={() => setTimeframe(tf)}
                            className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full transition-all cursor-pointer border-none ${
                                timeframe === tf
                                    ? "bg-slate-800 text-white shadow-sm"
                                    : "text-slate-400 hover:text-slate-700 bg-transparent"
                            }`}
                        >
                            {tf}
                        </button>
                    ))}
                </div>
            </div>

        </div>
    );
}


