import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Planning from './pages/Planning';
import Procurement from './pages/Procurement';
import Inventory from './pages/Inventory';
import Production from './pages/Production';
import Sales from './pages/Sales';
import HR from './pages/HR';
import Quality from './pages/Quality';
import Recipes from './pages/Recipes';
import Maintenance from './pages/Maintenance';
import Logistics from './pages/Logistics';
import MasterData from './pages/MasterData';
import Users from './pages/Users';
import Learning from './pages/Learning';

const Finance = () => (
  <div className="space-y-8">
    <header>
      <h2 className="text-4xl font-serif font-bold text-[#5A5A40]">Finance</h2>
      <p className="text-black/40 mt-1">Financial reports, invoices, and payments</p>
    </header>
    <div className="bg-white p-12 rounded-3xl border border-black/5 text-center">
      <p className="text-black/40 italic">Finance module integration in progress...</p>
    </div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0]">
        <div className="w-12 h-12 border-4 border-[#5A5A40] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!profile?.companyId) {
    return <Navigate to="/login" />;
  }

  return <Layout>{children}</Layout>;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/planning"
        element={
          <ProtectedRoute>
            <Planning />
          </ProtectedRoute>
        }
      />
      <Route
        path="/procurement"
        element={
          <ProtectedRoute>
            <Procurement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <Inventory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/production"
        element={
          <ProtectedRoute>
            <Production />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales"
        element={
          <ProtectedRoute>
            <Sales />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quality"
        element={
          <ProtectedRoute>
            <Quality />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recipes"
        element={
          <ProtectedRoute>
            <Recipes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/maintenance"
        element={
          <ProtectedRoute>
            <Maintenance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/logistics"
        element={
          <ProtectedRoute>
            <Logistics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr"
        element={
          <ProtectedRoute>
            <HR />
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance"
        element={
          <ProtectedRoute>
            <Finance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/master-data"
        element={
          <ProtectedRoute>
            <MasterData />
          </ProtectedRoute>
        }
      />
      <Route
        path="/learning/:feature"
        element={
          <ProtectedRoute>
            <Learning />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
