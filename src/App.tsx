import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import Login from './screens/Login';
import Landing from './screens/Landing';
import Dashboard from './screens/Dashboard';
import ReportViolation from './screens/ReportViolation';
import Achievements from './screens/Achievements';
import BankDetails from './screens/BankDetails';
import KYC from './screens/KYC';
import VerificationHub from './screens/VerificationHub';
import PhotoModeration from './screens/PhotoModeration';
import Profile from './screens/Profile';
import Directory from './screens/Directory';

import { FirebaseProvider } from './components/FirebaseProvider';
import { ThemeProvider } from './components/ThemeProvider';
import { useFirebase } from './components/FirebaseProvider';

// Protects /admin — only users with role === 'admin' can access
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useFirebase();

  if (loading || (user && !profile)) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <p className="text-xs font-bold text-slate-400 animate-pulse tracking-widest uppercase">Verifying Admin Token...</p>
        </div>
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <FirebaseProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/report" element={<ReportViolation />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/kyc" element={<KYC />} />
              <Route path="/bank" element={<BankDetails />} />
              <Route path="/directory" element={<Directory />} />
              <Route path="/profile" element={<Profile />} />

              {/* Admin routes — role-guarded */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <VerificationHub />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/photos"
                element={
                  <AdminRoute>
                    <PhotoModeration />
                  </AdminRoute>
                }
              />
            </Route>

            <Route path="/" element={<Landing />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </FirebaseProvider>
  );
}
