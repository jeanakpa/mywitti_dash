// src/components/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, FileQuestion, ShoppingCart, Package, Shield, Bell, FileText, Gift } from 'lucide-react';
import witti_logo from '../../assets/witti_logo.png';

const MenuItem = ({ path, name, icon, isActive }) => (
  <Link
    to={path}
    className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ease-in-out ${
      isActive
        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
        : 'text-gray-200 hover:bg-blue-600 hover:text-white'
    }`}
  >
    {icon && React.createElement(icon, { size: 20, className: 'mr-3' })}
    <span className="font-medium">{name}</span>
  </Link>
);

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const admin = JSON.parse(localStorage.getItem('admin')) || {};
  const userRole = admin.role || 'admin';

  const baseMenuItems = [
    { path: '/', name: 'Accueil', icon: Home },
    { path: '/users', name: 'Gestion des clients', icon: Users },
    { path: '/surveys', name: 'Système de sondage', icon: FileQuestion },
    { path: '/orders', name: 'Gestion des commandes', icon: ShoppingCart },
    { path: '/stock', name: 'Gestion des stocks', icon: Package },
    { path: '/notifications', name: 'Notifications', icon: Bell },
    { path: '/faqs', name: 'Gestion des FAQs', icon: FileText },
    { path: '/referrals', name: 'Gestion des parrainages', icon: Gift },
  ];

  const adminMenuItems = userRole === 'Super Admin'
    ? [{ path: '/admins', name: 'Gestion des administrateurs', icon: Shield }]
    : [];

  const menuItems = [...baseMenuItems, ...adminMenuItems];

  return (
    <>
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E293B] text-white z-20 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 md:w-64 shadow-lg`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center px-4 py-6 border-b border-gray-700">
            <img src={witti_logo} alt="Witti Logo" className="h-12 w-auto" />
          </div>
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <MenuItem {...item} isActive={location.pathname === item.path} />
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-10 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;