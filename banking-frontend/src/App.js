import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Profile from "./pages/Profile";
import ViewBalance from "./pages/ViewBalance";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Transfer from "./pages/Transfer";
import Transactions from "./pages/Transactions";
import ProtectedRoute from "./pages/ProtectedRoute";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/Withdraw";
import AdminDashboard from "./pages/AdminDashboard";
import AnalyticsCharts from "./pages/AnalyticsCharts";
function App() {
  return (
    
    <Router>
       <Routes>
    <Route path="/admin" element={<AdminDashboard />} />
  </Routes>
      <Routes>
        <Route path="/analytics" element={<AnalyticsCharts />} />
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/accounts"
          element={
            <ProtectedRoute>
              <Accounts />
            </ProtectedRoute>
          }
        />
<Route
  path="/profile"
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  }
/>

<Route
  path="/view-balance"
  element={
    <ProtectedRoute>
      <ViewBalance />
    </ProtectedRoute>
  }
/>
        <Route
          path="/transfer"
          element={
            <ProtectedRoute>
              <Transfer />
            </ProtectedRoute>
          }
        />
        <Route
  path="/deposit/:accountId"
  element={
    <ProtectedRoute>
      <Deposit />
    </ProtectedRoute>
  }
/>

<Route
  path="/withdraw/:accountId"
  element={
    <ProtectedRoute>
      <Withdraw />
    </ProtectedRoute>
  }
/>
        <Route
          path="/transactions/:accountId"
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;