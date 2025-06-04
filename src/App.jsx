import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SurveysProvider } from './context/SurveysContext';
import { OrdersProvider } from './context/OrdersContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import SurveyManagement from './pages/SurveyManagement';
import Settings from './pages/Settings';
import CreateSurvey from './pages/CreateSurvey';
import EditSurvey from './pages/EditSurvey';
import Login from './pages/Login';
import SurveyDetails from './pages/SurveyDetails';
import OrderManagement from './pages/OrderManagement';
import AdminManagement from './pages/AdminManagement';
import RespondSurvey from './pages/RespondSurvey';
import SurveyResponses from './pages/SurveyResponses';
import StockManagement from './pages/StockManagement';
import Notifications from './pages/Notifications';
import FaqManagement from './pages/FaqManagement';
import FaqEdit from './pages/FaqEdit'; // Importation correcte
import FaqCreate from './pages/FaqCreate'; // Importation correcte
import ReferralManagement from './pages/ReferralManagement';

const ProtectedRoute = ({ children, superAdminOnly = false }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const admin = JSON.parse(localStorage.getItem('admin')) || {};
  const userRole = admin.role || 'Admin';
  const hasToken = !!admin.token;

  if (!isAuthenticated || !hasToken) {
    return <Navigate to="/login" replace />;
  }

  if (superAdminOnly && userRole !== 'Super Admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <SurveysProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="surveys" element={<SurveyManagement />} />
            <Route path="surveys/create" element={<CreateSurvey />} />
            <Route path="surveys/edit/:id" element={<EditSurvey />} />
            <Route path="surveys/:id" element={<SurveyDetails />} />
            <Route path="surveys/respond/:id" element={<RespondSurvey />} />
            <Route path="surveys/:id/responses" element={<SurveyResponses />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="stock" element={<StockManagement />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="faqs" element={<FaqManagement />} />
            <Route path="/faqs/create" element={<FaqCreate />} />
            <Route path="/faqs/edit/:id" element={<FaqEdit />} />
            <Route path="referrals" element={<ReferralManagement />} />
            <Route
              path="admins"
              element={
                <ProtectedRoute superAdminOnly={true}>
                  <AdminManagement />
                </ProtectedRoute>
              }
            />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </SurveysProvider>
    </Router>
  );
}

export default App;