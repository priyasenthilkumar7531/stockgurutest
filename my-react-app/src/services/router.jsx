import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import React from 'react';

// Components Imports
import Login from '../components/auth/Login';
import Signup from '../components/auth/SignUp';
import ForgotPassword from '../components/auth/forgotpassword';
import ResetPassword from '../components/auth/resetpassword';
import AdminKycPortal from '../components/Adminkyc';
import SipCalculator from '../components/sip';
import StockDetailsPage from '../components/StockDetails';
import WatchList from '../components/watchlist';
import FullMostBoughtPage from '../components/FullMostBoughtPage';
import StockChart from '../components/StockChart';
import StockCandleChart from '../components/stockcandlechart';
import Profile from '../components/Profile';
import MarketDashboard from '../components/maindashboard';
import KYCVerification from '../components/kycverification';
import Portfolio from '../components/portfolio';
import Leaderboard from '../components/leaderboard';
import NotFoundPage from '../components/Notfound';
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';
import StockMovers from '../components/StockMovers';

// Layout wrapper to inject the global application header navbar across private portals smoothly
function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 w-full">
        <Outlet /> {/* This is where nested children elements dynamically mount */}
      </main>
    </div>
  );
}

const router = createBrowserRouter([
  
  // 1. AUTH SEGMENT (Matches: /auth/* backend design schemas)
  {
    path: '/auth',
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Signup /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
      { path: 'reset-password', element: <ProtectedRoute><ResetPassword /></ProtectedRoute> }
    ]
  },
  {
    path: '/market',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { path: 'explore', element: <MarketDashboard /> },
      { path: 'stock/:searchId', element: <StockDetailsPage /> }, 
      { path: 'most-bought', element: <FullMostBoughtPage /> },
      {path:'stock-mover',element:<StockMovers/>},
      { path: 'chart/:symbol', element: <StockChart /> },
      { path: 'candles/:symbol', element: <StockCandleChart /> }
    ]
  },
  {
    path: '/portfolio',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { path: '', element: <Portfolio /> }, // Base portfolio viewer route
    ]
  },
  {
    path: '/watchlist',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { path: '', element: <WatchList /> }
    ]
  },
  {
    path: '/kyc',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { path: '', element: <KYCVerification /> }
    ]
  },
  {
    path: '/admin',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { path: 'kyc/pending', element: <AdminKycPortal /> }
    ]
  },
  {
    path: '/',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { path: '', element: <Navigate to="/market" replace /> },
      { path: 'sip', element: <SipCalculator /> },
      { path: 'leaderboard', element: <Leaderboard /> },
      { path: 'profile', element: <Profile /> }
    ]
  },
  { path: '/*', element: <NotFoundPage /> }
]);

export default router;
