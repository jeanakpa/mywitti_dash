// src/components/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, FileQuestion, ShoppingCart, Package, Shield, Bell, FileText, Gift, ClipboardList, Megaphone } from 'lucide-react';
import witti_logo from '../../assets/witti_logo.png';

const MenuItem = ({ path, name, icon, isActive }) => (
  <Link
    to={path}
    className={`flex items-center px-6 py-4 rounded-2xl transition-all duration-300 ease-out gap-4 font-medium text-base group relative overflow-hidden
      ${isActive 
        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl transform scale-105' 
        : 'text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:text-purple-700 hover:shadow-lg hover:transform hover:scale-105'
      }`}
  >
    {/* Effet de brillance au survol */}
    <div className={`absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 transition-transform duration-500 ${isActive ? 'translate-x-0' : 'translate-x-full group-hover:translate-x-0'}`} />
    
    {icon && React.createElement(icon, { 
      size: 22, 
      className: `relative z-10 transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-purple-600'}` 
    })}
    <span className="relative z-10">{name}</span>
  </Link>
);

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const admin = JSON.parse(localStorage.getItem('admin')) || {};
  const userRole = admin.role || 'admin';

  const baseMenuItems = [
    { path: '/', name: 'Dashboard', icon: Home },
    { path: '/users', name: 'Clients', icon: Users },
    { path: '/orders', name: 'Commandes', icon: ShoppingCart },
    { path: '/stock', name: 'Stock', icon: Package },
    { path: '/notifications', name: 'Notifications', icon: Bell },
    { path: '/advertisements', name: 'Publicités', icon: Megaphone },
    { path: '/faqs', name: 'FAQs', icon: FileText },
    { path: '/surveys', name: 'Sondages', icon: ClipboardList },
    { path: '/referrals', name: 'Parrainages', icon: Gift },
  ];

  const adminMenuItems = userRole?.toLowerCase().includes('super')
    ? [{ path: '/admins', name: 'Administrateurs', icon: Shield }]
    : [];

  const menuItems = [...baseMenuItems, ...adminMenuItems];

  return (
    <>
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-white/95 to-white/90 backdrop-blur-xl text-gray-800 z-30 transform transition-all duration-500 ease-out shadow-2xl
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:w-72 border-r border-white/20`}
      >
        <div className="flex flex-col h-full">
          {/* Header avec logo */}
          <div className="flex items-center justify-center px-6 py-8 border-b border-white/20 bg-gradient-to-r from-purple-600 to-blue-600">
            <div className="relative">
              <img src={witti_logo} alt="Witti Logo" className="h-16 w-auto drop-shadow-2xl animate-fade-in-up" />
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full blur-xl" />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 overflow-y-auto">
            <div className="space-y-3">
              {menuItems.map((item) => (
                <div key={item.path} className="relative">
                  <MenuItem {...item} isActive={location.pathname === item.path} />
                  {location.pathname === item.path && (
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-l-full" />
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* Footer avec info utilisateur */}
          <div className="p-6 border-t border-white/20 bg-gradient-to-r from-gray-50/50 to-white/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {admin.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{admin.name || 'Admin'}</p>
                <p className="text-xs text-gray-500 capitalize">{admin.role || 'admin'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Effet de bordure lumineuse */}
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-purple-400/30 to-transparent" />
      </aside>

      {/* Overlay pour mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;