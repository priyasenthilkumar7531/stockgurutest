import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/auth';
 // Points directly to your global Axios configuration instances
import StockBackground from './background';

export default function RealKYCVerification() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');

  // Swagger Schema Form Fields States
  const [fullName, setFullName] = useState("");
  const [panNumber, setPanNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState('');

  // Application Dynamic State Trackers
  const [kycStatus, setKycStatus] = useState('none'); // 'pending', 'approved', 'rejected', 'none'
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // 1. SYSTEM HYDRATION LOOKUP: Triggered immediately on page load
  const fetchKycStatus = async () => {
    try {
      setError('');
      const response = await apiClient.get("/api/kyc/status");
      const data = response.data || {};

      // Adaptively checks variations of your backend response contracts
      const statusValue = data.status || data.kyc?.status || data.data?.status;

      if (statusValue) {
        setKycStatus(statusValue);
        setRemarks(data.remarks || data.message || "Under compliance audit review.");
        setStep(4); // Forward directly to the status screen if a record exists
      } else {
        setKycStatus('none');
        setStep(1);
      }
    } catch (err) {
      // ✅ SUCCESS STRATEGY: Treat 404 as a fresh user setup condition instead of a crashing error
      if (err.response && err.response.status === 404) {
        setKycStatus('none');
        setRemarks('');
        setError(''); // Explicitly suppress warning banners for unsubmitted profiles
        setStep(1);
      } else {
        setError(err.response?.data?.message || 'Handshake failed with compliance status network.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKycStatus();
  }, []);

  // 2. BACKGROUND RE-POLLING HOOK: Listens for administrative audits updates every 30s
  useEffect(() => {
    if (kycStatus !== "pending") return;

    const interval = setInterval(async () => {
      try {
        const response = await apiClient.get("/api/kyc/status");
        const data = response.data || {};
        const statusValue = data.status || data.kyc?.status || data.data?.status;

        if (statusValue) {
          setKycStatus(statusValue);
          setRemarks(data.remarks || "");
          if (statusValue === 'approved') {
            window.location.href = '/'; // Dynamic entry route redirect
          }
        }
      } catch (err) {
        console.error("Polling error caught:", err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [kycStatus]);

  // STAGE 1 Form Submit Event Handler
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setStep(2);
  };

  // STAGE 2 Form Submit Event Handler
  const handlePANSubmit = (e) => {
    e.preventDefault();
    setError('');

    const cleanPAN = panNumber.trim().toUpperCase();
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

    if (!panRegex.test(cleanPAN)) {
      setError('Invalid PAN format. Must be 10 characters (e.g., ABCDP1234F).');
      return;
    }
    setStep(3);
  };

  // STAGE 3 Form Submit Event Handler (Final Payload Submission Block)
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const payload = {
      fullName: fullName.trim(),
      panNumber: panNumber.trim().toUpperCase(),
      aadhaarNumber: aadhaarNumber.trim(),
      address: address.trim(),
      dob: dob
    };

    try {
      const response = await apiClient.post('/api/kyc/submit', payload);
      const data = response.data || {};
      const statusValue = data.status || data.data?.status || 'pending';

      setKycStatus(statusValue);
      setRemarks(data.remarks || data.message || 'KYC submitted successfully.');
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || 'Server context transmission error.');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ LOADING GATE: Blocks layout rendering anomalies until network handshakes finish
  if (isLoading && kycStatus === '') {
    return (
      <div className="min-h-screen w-full flex justify-center items-center bg-slate-900 text-white font-mono text-xs tracking-widest uppercase">
        ⚡ ESTABLISHING SECURE ACCOUNT ROUTING TIER...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex justify-center items-center overflow-hidden bg-slate-900 font-sans antialiased box-border">
      <StockBackground />

      <div className="relative z-10 w-[400px] bg-white border border-slate-200 p-8 rounded-2xl shadow-2xl box-border">

        {/* Dynamic Navigation Progress Header */}
        <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4 select-none">
          <h2 className="text-xl font-bold text-slate-800 m-0">KYC Verification</h2>
          <span className="text-xs font-mono font-bold px-2 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded">
            Stage {step} of 4
          </span>
        </div>

        {/* ✅ DYNAMIC ERROR BANNER CONTROL CHECK */}
        {error && kycStatus !== 'none' && (
          <div className="mb-4 p-3 text-xs bg-red-50 border border-red-200 text-red-600 rounded-lg font-medium text-left">
            ⚠️ {error}
          </div>
        )}

        {/* REGISTRATION STEPS (Only rendering when user profile lacks data records) */}
        {kycStatus === 'none' && step === 1 && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <p className="text-xs text-slate-400 font-bold mb-2 uppercase font-mono text-left m-0">Step 1: Contact Verification</p>
            <input
              type="email" required placeholder="Email Address"
              className="w-full border p-3 rounded-lg border-slate-200 text-sm box-border focus:outline-blue-600"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="w-full py-3 text-sm font-semibold text-white bg-blue-800 hover:bg-blue-700 rounded-lg shadow-md border-none cursor-pointer transition">
              Verify Email Address
            </button>
          </form>
        )}

        {kycStatus === 'none' && step === 2 && (
          <form onSubmit={handlePANSubmit} className="space-y-4">
            <p className="text-xs text-slate-400 font-bold mb-2 uppercase font-mono text-left m-0">Step 2: Legal Identity</p>
            <input
              type="text" required placeholder="Full Name"
              className="w-full border p-3 rounded-lg border-slate-200 text-sm box-border focus:outline-blue-600"
              value={fullName} onChange={(e) => setFullName(e.target.value)}
            />
            <input
              type="text" required maxLength={10} placeholder="PAN Card Number"
              className="w-full border p-3 rounded-lg border-slate-200 tracking-widest uppercase font-mono text-sm box-border focus:outline-blue-600"
              value={panNumber} onChange={(e) => setPanNumber(e.target.value)}
            />
            <button type="submit" className="w-full py-3 text-sm font-semibold text-white bg-blue-800 hover:bg-blue-700 rounded-lg shadow-md border-none cursor-pointer transition">
              Validate Identity Credentials
            </button>
          </form>
        )}

        {kycStatus === 'none' && step === 3 && (
          <form onSubmit={handleFinalSubmit} className="space-y-4">
            <p className="text-xs text-slate-400 font-bold mb-2 uppercase font-mono text-left m-0">Step 3: Residency Verification</p>

            <input
              type="text" required maxLength={12} placeholder="12-Digit Aadhaar Number"
              className="w-full border p-3 rounded-lg border-slate-200 text-sm font-mono tracking-widest box-border focus:outline-blue-600"
              value={aadhaarNumber} onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ""))}
            />
            <input
              type="date" required placeholder="Date of Birth"
              className="w-full border p-3 rounded-lg border-slate-200 text-sm box-border focus:outline-blue-600 text-slate-500 font-medium"
              value={dob} onChange={(e) => setDob(e.target.value)}
            />
            <textarea
              required placeholder="Full Residential Address" rows="2"
              className="w-full border p-3 rounded-lg border-slate-200 text-sm box-border focus:outline-blue-600 resize-none"
              value={address} onChange={(e) => setAddress(e.target.value)}
            />
            <button type="submit" className="w-full py-3 text-sm font-semibold text-white bg-blue-800 hover:bg-blue-700 rounded-lg shadow-md border-none cursor-pointer transition">
              Submit Final Verification
            </button>
          </form>
        )}

        {/* STAGE 4: POST-SUBMISSION STATUS SCREEN */}
        {(kycStatus === 'pending' || kycStatus === 'approved' || kycStatus === 'rejected') && (
            <div className="text-center space-y-4 py-2 select-none">
              <p className="text-xs text-slate-400 font-bold uppercase font-mono text-left m-0">
                Stage 4: Compliance Status
              </p>

              {/* Dynamic Status Alert Panel */}
              <div className={`p-4 rounded-xl border border-solid text-sm font-bold capitalize ${kycStatus === 'approved' ? 'bg-green-50 border-green-200 text-green-700' :
                  kycStatus === 'rejected' ? 'bg-red-50 border-red-200 text-red-700' :
                    'bg-amber-50 border-amber-200 text-amber-700 animate-pulse'
                }`}>
                {kycStatus === 'approved' ? '✅ Verification Approved' :
                  kycStatus === 'rejected' ? '❌ Verification Rejected' :
                    '⏳ Audit Review Pending'}
              </div>

              {/* Auditor Remarks Section */}
              <p className="text-xs text-slate-500 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 border-solid text-left m-0">
                {remarks || "Your application profile metrics are currently being evaluated against exchange KYC policies."}
              </p>

              {/* Re-submission Trigger Button */}
              {kycStatus === 'rejected' && (
                <button
                  type="button"
                  onClick={() => {
                    setKycStatus('none');
                    setStep(1);
                  }}
                  className="w-full mt-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs tracking-wider border-none cursor-pointer transition-colors shadow-xs"
                >
                  Re-Submit Verification Form
                </button>
              )}
            </div>
          )}
      </div>
    </div>
  )};

    
