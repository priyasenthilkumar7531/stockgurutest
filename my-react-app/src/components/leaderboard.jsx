import React from 'react';

export default function Leaderboard() {
  const leaders = [
    { rank: 1, name: "Rajesh Kumar", netWorth: "₹24,50,000", totalTrades: 142, returns: "+145.0%" },
    { rank: 2, name: "Priya Sharma", netWorth: "₹18,20,500", totalTrades: 89, returns: "+82.0%" },
    { rank: 3, name: "Aman Verma", netWorth: "₹15,10,000", totalTrades: 210, returns: "+51.0%" },
    { rank: 4, name: "You (Trader)", netWorth: "₹1,45,230", totalTrades: 45, returns: "+8.2%", isUser: true },
    { rank: 5, name: "Neha Gupta", netWorth: "₹1,12,000", totalTrades: 31, returns: "+1.2%" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Heading Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800">Top Sim Traders</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Global rankings evaluated by total portfolio net values.</p>
        </div>

        {/* Rankings Listing Table */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 text-xs font-bold uppercase tracking-wider">
                  <th className="pb-3 w-16 text-center">Rank</th>
                  <th className="pb-3">Trader Profile</th>
                  <th className="pb-3">Total Volume</th>
                  <th className="pb-3">Growth Rate</th>
                  <th className="pb-3 text-right">Net Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-medium">
                {leaders.map((player) => (
                  <tr 
                    key={player.rank} 
                    className={`transition-colors ${player.isUser ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-gray-50'}`}
                  >
                    <td className="py-4 text-center">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black mx-auto ${
                        player.rank === 1 ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                        player.rank === 2 ? 'bg-slate-200 text-slate-700 border border-slate-300' :
                        player.rank === 3 ? 'bg-orange-100 text-orange-700 border border-orange-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {player.rank}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`font-bold ${player.isUser ? 'text-blue-800 font-extrabold' : 'text-gray-700'}`}>
                        {player.name}
                      </span>
                      {player.isUser && <span className="ml-2 text-[10px] bg-blue-800 text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">Me</span>}
                    </td>
                    <td className="py-4 text-gray-500 font-normal">{player.totalTrades} Executions</td>
                    <td className="py-4 text-green-600 font-bold">{player.returns}</td>
                    <td className="py-4 text-right font-black text-gray-800">{player.netWorth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
