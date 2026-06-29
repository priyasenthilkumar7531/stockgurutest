import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient, clearTokens } from '../services/auth'; // Ensure paths match your project tree
import NavbarSearch from './SearchBar'; // Assuming standard relative sibling location
import logo from '../assets/logo.png'; // Assuming standard asset structure

export default function Navbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // Mobile menu state
  const [showProfileMenu, setShowProfileMenu] = useState(false); // Profile dropdown state
  const dropdownRef = useRef(null);

  // Dynamic state hooks for live user context data
  const [userProfile, setUserProfile] = useState({
    name: "User Profile",
    email: "Loading...",
    initials: "U",
    isVerified: false
  });

  // Stock ticker data for the sub-bar strip updated to Indian bluechips
  const stocks = [
    { symbol: "RELIANCE", price: "2,450.40", change: "+1.42%", isGreen: true },
    { symbol: "TCS", price: "3,200.20", change: "-2.15%", isGreen: false },
    { symbol: "INFY", price: "1,475.12", change: "+4.80%", isGreen: true },
    { symbol: "HDFCBANK", price: "1,650.15", change: "-0.45%", isGreen: false },
    { symbol: "SBIN", price: "765.30", change: "+3.10%", isGreen: true },
  ];

  // Fetch authenticated user data from backend on mount
  useEffect(() => {
    const fetchUserContext = async () => {
      try {
        const response = await apiClient.get('/api/user/profile'); 
        if (response.data && response.data.success) {
          const user = response.data.data;
          
          // REMOVED: Broken setVirtualBalance call that threw runtime errors
          
          // Generate initials safely
          const nameParts = user.fullName ? user.fullName.split(" ") : ["User"];
          const initialsStr = nameParts.length > 1 
            ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase() 
            : `${nameParts[0][0]}`.toUpperCase();

          setUserProfile({
            name: user.fullName || "Stock Guru Trader",
            email: user.email || "",
            initials: initialsStr,
            isVerified: user.kycStatus === "approved"
          });
        }
      } catch (err) {
        console.error("Failed to load authenticated navbar data:", err);
      }
    };

    fetchUserContext();
  }, []);

  // Close profile dropdown when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    setShowProfileMenu(false);
    setIsOpen(false);
    clearTokens(); // Wipes keys from localStorage securely
    navigate("/auth/login");
  };

  return (
    <nav className="w-full bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50 transition-all duration-300">
      {/* Main Top Header Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Left: Branding & Core Links */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 no-underline">
              <img src={logo} alt="StockGuru" className="w-13 h-13 object-contain p-2" />
              <span className="text-xl font-bold text-blue-900 tracking-tight p-2">
                StockGuru
              </span>
            </Link>
            <NavbarSearch/>
            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-12">
              <Link to="/market/explore" className="text-gray-600 hover:text-blue-800 font-semibold no-underline transition">Explore</Link>
              <Link to="/portfolio" className="text-gray-600 hover:text-blue-800 font-semibold no-underline transition">Portfolio</Link>
              <Link to="/watchlist" className="text-gray-600 hover:text-blue-800 font-semibold no-underline transition">Watchlist</Link>
              <Link to="/leaderboard" className="text-gray-600 hover:text-blue-800 font-semibold no-underline transition">Leaderboard</Link>
            </div>
          </div>

          {/* Right Area: Profile Trigger (Virtual balance UI items entirely removed) */}
          <div className="hidden md:flex items-center gap-6">

            {/* Profile Dropdown Trigger Container */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-10 h-10 rounded-full bg-blue-800 text-white font-bold flex items-center justify-center border-2 border-transparent hover:border-blue-300 focus:outline-none transition select-none cursor-pointer"
              >
                {userProfile.initials}
              </button>

              {/* Profile Card Popup Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl p-4 text-left">
                  <div className="pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 text-sm m-0 truncate max-w-[140px]">{userProfile.name}</p>
                      {userProfile.isVerified && (
                        <span className="text-[9px] bg-green-100 text-green-700 border border-green-300 font-extrabold px-1.5 py-0.5 rounded-full uppercase shrink-0">Verified KYC</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 font-medium truncate mt-0.5 m-0">{userProfile.email}</p>
                  </div>
                  
                  <div className="py-2 space-y-1">
                    <Link 
                      to="/portfolio" 
                      onClick={() => setShowProfileMenu(false)}
                      className="block px-2 py-2 text-sm text-gray-600 hover:text-blue-800 hover:bg-slate-50 font-semibold no-underline rounded-lg transition"
                    >
                      My Holdings Profile
                    </Link>
                    <Link 
                      to="/kyc" 
                      onClick={() => setShowProfileMenu(false)}
                      className="block px-2 py-2 text-sm text-gray-600 hover:text-blue-800 hover:bg-slate-50 font-semibold no-underline rounded-lg transition"
                    >
                      Verification Status
                    </Link>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <button 
                      onClick={handleSignOut}
                      className="w-full text-left px-2 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition border-none bg-transparent cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Layout Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none font-bold text-xl px-2 cursor-pointer"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-50 border-t border-gray-100 px-4 py-3 space-y-3">
          <div className="pb-2 border-b border-gray-200">
            <p className="font-bold text-gray-900 text-sm m-0">{userProfile.name}</p>
            <p className="text-xs text-gray-400 font-medium m-0 mt-0.5">{userProfile.email}</p>
          </div>
          <Link to='/market/explore' onClick={()=> setIsOpen(false)} className="block text-gray-700 font-semibold no-underline">Explore</Link>
          <Link to="/portfolio" onClick={() => setIsOpen(false)} className="block text-gray-700 font-semibold no-underline">Portfolio</Link>
          <Link to="/watchlist" onClick={() => setIsOpen(false)} className="block text-gray-700 font-semibold no-underline">Watchlist</Link>
          <Link to="/leaderboard" onClick={() => setIsOpen(false)} className="block text-gray-700 font-semibold no-underline">Leaderboard</Link>
          <div className="pt-2 border-t border-gray-200">
            <button 
              onClick={handleSignOut}
              className="w-full text-left py-2 text-sm font-bold text-red-600 bg-transparent border-none cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
