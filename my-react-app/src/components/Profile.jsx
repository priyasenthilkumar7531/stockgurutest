import { useState } from "react";
import logo from "../assets/logo.png"; // Adjust path if needed
export default function Profile() {
  // 1. Initial User State
  const [userProfile, setUserProfile] = useState({
    fullName: "Priya Senthilkumar",
    email: "priya@stockguru.com",
    phone: "9876543210", // 10-digit base format
    joinDate: "June 2026",
    accountTier: "Pro Trader",
    startingCash: 100000,
    currentValue: 124500,
    totalTrades: 42,
    winRate: 68,
  });

  // 2. Form Editing State
  const [formData, setFormData] = useState({
    fullName: userProfile.fullName,
    email: userProfile.email,
    phone: userProfile.phone,
  });

  // Track user interaction for dynamic inline state coloration
  const [touched, setTouched] = useState({ 
    fullName: false, 
    email: false, 
    phone: false 
  });
  
  const [isSaved, setIsSaved] = useState(false);

  // 3. Validation Logic Engine
  const checkErrors = () => {
    const errors = {};

    // Name constraint: No numbers
    if (!formData.fullName.trim()) {
      errors.fullName = "Full Name cannot be empty.";
    } else if (/[0-9]/.test(formData.fullName)) {
      errors.fullName = "Names cannot contain numbers.";
    }

    // Email constraint
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address.";
    }

    // Indian Mobile Number constraint (Must start with 6-9, exactly 10 digits)
    const indianPhoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phone) {
      errors.phone = "Mobile number is required.";
    } else if (!indianPhoneRegex.test(formData.phone)) {
      errors.phone = "Enter a valid 10-digit Indian mobile number (starts with 6-9).";
    }

    return errors;
  };

  const validationErrors = checkErrors();
  
  // Financial metrics calculations
  const netProfit = userProfile.currentValue - userProfile.startingCash;
  const profitPercentage = ((netProfit / userProfile.startingCash) * 100).toFixed(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Strip away non-numeric characters automatically from the phone input box
    const cleanValue = name === "phone" ? value.replace(/\D/g, "") : value;
    
    setFormData((prev) => ({ ...prev, [name]: cleanValue }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    setIsSaved(false);
  };

  // Generates conditional layout states across active focus boundaries
  const getInputClass = (fieldName) => {
    const baseClass = "w-full border p-3 rounded-xl focus:outline-none transition duration-200 mt-1 text-gray-800 font-medium ";
    if (!touched[fieldName]) return `${baseClass} border-gray-200 focus:ring-2 focus:ring-blue-500`;
    return validationErrors[fieldName]
      ? `${baseClass} border-red-500 bg-red-50/30 focus:ring-2 focus:ring-red-500`   // Red if invalid
      : `${baseClass} border-green-500 bg-green-50/30 focus:ring-2 focus:ring-green-500`; // Green if correct
  };

  const handleSave = (e) => {
    e.preventDefault();
    setTouched({ fullName: true, email: true, phone: true });

    if (Object.keys(validationErrors).length === 0) {
      setUserProfile((prev) => ({ ...prev, ...formData }));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar Summary Card */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-2xl p-6 h-fit transition-all duration-300 ease-in-out hover:shadow-3xl hover:shadow-gray-200/50">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-gradient-to-tr from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md mb-4 select-none">
              {userProfile.fullName.charAt(0)}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900">{userProfile.fullName}</h2>
            
            <span className="mt-2 px-3 py-1 bg-green-50 border border-green-200 text-green-700 font-bold text-xs uppercase tracking-wider rounded-full">
              {userProfile.accountTier}
            </span>
            
            <p className="text-gray-400 text-sm mt-4">Trader since {userProfile.joinDate}</p>
          </div>

          <div className="border-t border-gray-100 mt-6 pt-6 space-y-4">
            <div className="flex justify-between items-center text-sm font-semibold text-gray-600">
              <span>Total Trades</span>
              <span className="text-gray-900 font-bold">{userProfile.totalTrades}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-semibold text-gray-600">
              <span>Win Rate</span>
              <span className="text-emerald-600 font-bold">{userProfile.winRate}%</span>
            </div>
          </div>
        </div>

        {/* Right Column: Information Inputs */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Performance Box Group */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-2xl p-6 transition-all duration-300 ease-in-out hover:shadow-3xl hover:shadow-gray-200/50">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Simulator Performance</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Portfolio Value</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">${userProfile.currentValue.toLocaleString()}</p>
              </div>

              <div className={`p-4 rounded-xl border ${netProfit >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                <p className={`text-xs font-bold uppercase tracking-wider ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>Total Return (P&L)</p>
                <p className={`text-2xl font-extrabold mt-1 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {netProfit >= 0 ? "+" : ""}${netProfit.toLocaleString()} ({profitPercentage}%)
                </p>
              </div>
            </div>
          </div>

          {/* Settings Form Panel */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-2xl p-6 transition-all duration-300 ease-in-out hover:shadow-3xl hover:shadow-blue-600/5">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Account Settings</h3>
            
            <form onSubmit={handleSave} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="text-sm font-bold text-gray-600">Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className={getInputClass("fullName")} />
                  {touched.fullName && validationErrors.fullName && <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors.fullName}</p>}
                </div>

                {/* Indian Phone Input Block */}
                <div>
                  <label className="text-sm font-bold text-gray-600">Mobile Number</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 top-4 text-gray-400 text-sm font-semibold select-none">+91</span>
                    <input 
                      type="text" 
                      name="phone" 
                      maxLength="10"
                      placeholder="1234567890"
                      value={formData.phone} 
                      onChange={handleChange} 
                      className={`${getInputClass("phone")} pl-12`} // Shifted left padding text over to accommodate prefix
                    />
                  </div>
                  {touched.phone && validationErrors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors.phone}</p>}
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="text-sm font-bold text-gray-600">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={getInputClass("email")} />
                {touched.email && validationErrors.email && <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors.email}</p>}
              </div>

              {/* Action Buttons Tray Footer */}
              <div className="flex items-center gap-4 pt-2">
                <button type="submit" className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition active:scale-95 shadow-md shadow-blue-600/10">
                  Save Changes
                </button>
                
                {isSaved && (
                  <p className="text-green-600 text-sm font-bold animate-pulse">
                    ✓ Changes updated successfully!
                  </p>
                )}
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
