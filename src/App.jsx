import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/layout/Layout';
import UserManagement from './pages/UserManagement';
import OrderManagement from './pages/OrderManagement';
import StockManagement from './pages/StockManagement';
import NotificationPanel from './pages/NotificationPanel';
import FAQManagement from './pages/FAQManagement';
import ReferralManagement from './pages/ReferralManagement';
import AdminManagement from './pages/AdminManagement';
import SurveyManagement from './pages/SurveyManagement';
import SurveyResponse from './pages/SurveyResponse';
import AdvertisementManagement from './pages/AdvertisementManagement';
import Profile from './pages/Profile';

const Empty = ({ title }) => <div className="text-center text-2xl text-gray-400 py-20">{title} (à venir)</div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="admins" element={<AdminManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="stock" element={<StockManagement />} />
          <Route path="notifications" element={<NotificationPanel />} />
          <Route path="faqs" element={<FAQManagement />} />
          <Route path="surveys" element={<SurveyManagement />} />
          <Route path="survey-response" element={<SurveyResponse />} />
          <Route path="advertisements" element={<AdvertisementManagement />} />
          <Route path="referrals" element={<ReferralManagement />} />
          <Route path="profile" element={<Profile />} />
          <Route
            path="stock"
            element={
              <PrivateRoute>
                <StockManagement />
              </PrivateRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
