import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/auth'; // Ensure this points to your shared Axios core instances
export default function AdminKycPortal() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Track network execution states per row to prevent double clicks during processing
  const [processingId, setProcessingId] = useState(null);

  // 1. INITIAL SYSTEM HYDRATION LOOP
  const fetchPendingKycData = async () => {
    setIsLoading(true);
    setError("");
    try {
      // MATCHES BACKEND CONTRACT: GET /admin/kyc/pending
      const response = await apiClient.get('/admin/kyc/pending');
      setPendingRequests(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Back-office KYC retrieval error:", err);
      setError(err.response?.data?.message || "Failed to resolve active verification registries.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingKycData();
  }, []);

  // 2. APPROVAL EXECUTIVE ACTION PIPELINE
  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      // MATCHES BACKEND CONTRACT: PATCH /admin/kyc/{id}/approve
      await apiClient.patch(`/admin/kyc/${id}/approve`);
      
      // Optimistically clean the processed record row out of the pending viewport table array
      setPendingRequests(prev => prev.filter(req => req.id !== id));
    } catch (err) {
      console.error("KYC approval modification crash logs:", err);
      alert(err.response?.data?.message || "Failed to finalize asset activation sequence.");
    } finally {
      setProcessingId(null);
    }
  };

  // 3. REJECTION EXECUTIVE ACTION PIPELINE
  const handleReject = async (id) => {
    const reason = prompt("Enter verification rejection reason text:");
    if (reason === null) return; // Halt if administrator clicks 'Cancel'

    setProcessingId(id);
    try {
      // MATCHES BACKEND CONTRACT: PATCH /admin/kyc/{id}/reject
      await apiClient.patch(`/admin/kyc/${id}/reject`, { reason });
      
      setPendingRequests(prev => prev.filter(req => req.id !== id));
    } catch (err) {
      console.error("KYC rejection modification crash logs:", err);
      alert(err.response?.data?.message || "Failed to finalize account block sequence.");
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-mono text-slate-500 font-bold uppercase tracking-widest">
        ⏳ Synchronizing secure clearance registers...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafd] text-slate-800 font-sans antialiased p-6 sm:p-8 select-none">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* TOP LEVEL NAVIGATION SUMMARY HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
          <div className="text-left">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 m-0">Compliance Control Center</h1>
            <p className="text-xs text-slate-400 font-medium mt-1">Admin-only review and approval workflow registries.</p>
          </div>
          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-mono font-bold px-3 py-1 rounded-full self-start sm:self-auto uppercase tracking-wider">
            🛡️ {pendingRequests.length} Pending Audits
          </span>
        </div>

        {/* CORE WORKFLOW LISTING INTERFACE PANEL */}
        {error ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-xs">
            <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">⚠️</div>
            <h3 className="text-slate-800 font-bold text-sm m-0">Sync Network Error</h3>
            <p className="text-slate-400 text-xs mt-1 mb-4">{error}</p>
            <button type="button" onClick={fetchPendingKycData} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold border-none cursor-pointer hover:bg-slate-800 transition">
              Force Registry Refresh
            </button>
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="bg-white border border-slate-200/60 rounded-2xl p-12 text-center shadow-xs font-mono border-dashed">
            <div className="text-2xl mb-2">🎉</div>
            <h3 className="text-slate-700 text-xs font-bold uppercase tracking-wider m-0">Audit Registry Cleared</h3>
            <p className="text-slate-400 text-[11px] mt-1">All real-time customer identification accounts are up to date.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/60 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-mono font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Applicant Trace</th>
                    <th className="p-4">Submission Date</th>
                    <th className="p-4">Verification Type</th>
                    <th className="p-4 text-right">Administrative Execution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium">
                  {pendingRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-slate-50/40 transition">
                      
                      {/* Column 1: Applicant Profile Metadata Details */}
                      <td className="p-4">
                        <div className="flex flex-col text-left">
                          <span className="font-bold text-slate-900 text-sm">{request.fullName || request.username || "Anonymous Trader"}</span>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-tight">UID: {request.id}</span>
                        </div>
                      </td>
                      
                      {/* Column 2: Clock Timestamp Parsers */}
                      <td className="p-4 text-slate-500 font-mono">
                        {request.submittedAt 
                          ? new Date(request.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) 
                          : "Pending Sync"}
                      </td>

                      {/* Column 3: Document Badge Type Flags */}
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded text-[10px] font-mono font-bold uppercase">
                          {request.documentType || "PAN / AADHAAR"}
                        </span>
                      </td>

                      {/* Column 4: Interactive Command Action Controls Buttons */}
                      <td className="p-4 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            type="button"
                            disabled={processingId !== null}
                            onClick={() => handleApprove(request.id)}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1.5 rounded-xl border-none cursor-pointer transition disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                          >
                            {processingId === request.id ? "Processing..." : "Approve ✓"}
                          </button>
                          <button
                            type="button"
                            disabled={processingId !== null}
                            onClick={() => handleReject(request.id)}
                            className="bg-white border border-slate-200 hover:border-slate-300 text-rose-600 font-bold px-3 py-1.5 rounded-xl cursor-pointer transition disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                          >
                            Reject ✕
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
