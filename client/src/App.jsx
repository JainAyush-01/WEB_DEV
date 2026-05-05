// Main App with sidebar toggle state
import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import BuyPlan from './pages/BuyPlan';
import PaymentSimulator from './pages/PaymentSimulator';
import MembershipHistory from './pages/MembershipHistory';

import AdminDashboard from './pages/AdminDashboard';
import ManageMembers from './pages/ManageMembers';
import ManagePlans from './pages/ManagePlans';
import ManageUsers from './pages/ManageUsers';

const AppLayout = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!user) {
    return <div className="auth-page">{children}</div>;
  }

  return (
    <div className={`app-wrapper ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      <Sidebar />
      <div className="content-wrapper">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        {children}
        <footer className="main-footer">
          <div>
            Copyright &copy; 2023-2026 <strong>The LNM Institute of Information Technology.</strong> All rights reserved.
          </div>
          <div>Webmaster LNMIIT</div>
        </footer>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<AppLayout><Login /></AppLayout>} />
          <Route path="/register" element={<AppLayout><Register /></AppLayout>} />

          <Route path="/" element={<PrivateRoute roleRequired="student"><AppLayout><StudentDashboard /></AppLayout></PrivateRoute>} />
          <Route path="/buy" element={<PrivateRoute roleRequired="student"><AppLayout><BuyPlan /></AppLayout></PrivateRoute>} />
          <Route path="/payment" element={<PrivateRoute roleRequired="student"><AppLayout><PaymentSimulator /></AppLayout></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute roleRequired="student"><AppLayout><MembershipHistory /></AppLayout></PrivateRoute>} />

          <Route path="/admin" element={<PrivateRoute roleRequired="admin"><AppLayout><AdminDashboard /></AppLayout></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute roleRequired="admin"><AppLayout><ManageUsers /></AppLayout></PrivateRoute>} />
          <Route path="/admin/members" element={<PrivateRoute roleRequired="admin"><AppLayout><ManageMembers /></AppLayout></PrivateRoute>} />
          <Route path="/admin/plans" element={<PrivateRoute roleRequired="admin"><AppLayout><ManagePlans /></AppLayout></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
