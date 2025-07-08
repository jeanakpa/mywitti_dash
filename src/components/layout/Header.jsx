import React, { useState, useEffect } from 'react';
import { Bell, LogOut, Menu, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import witti_logo from '../../assets/witti_logo_2.jpg';
import { apiFetch } from '../../api/api';

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Récupère le nombre de notifications non lues
    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem('admin') ? JSON.parse(localStorage.getItem('admin')).token : null;
        if (!token) return;
        const data = await apiFetch('/admin/notifications', { token });
        const notifications = Array.isArray(data.notifications) ? data.notifications : [];
        setUnreadCount(notifications.filter(n => n.is_read === false).length);
      } catch (e) {
        setUnreadCount(0);
      }
    };
    fetchUnread();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20 h-20 flex items-center px-6 z-20 sticky top-0">
      <div className="flex items-center gap-6 flex-1">
        <button
          onClick={toggleSidebar}
          className="p-3 rounded-2xl text-gray-600 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 focus:outline-none md:hidden transition-all duration-300"
          aria-label="Ouvrir la navigation"
        >
          <Menu size={24} />
        </button>
        
        {/* Logo et titre */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src={witti_logo} alt="Logo MyWitti" className="h-12 w-auto drop-shadow-lg hidden sm:block border-radius-50" />
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full blur-xl" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              MyWitti
            </h1>
            <p className="text-xs text-gray-500">Administration Panel</p>
          </div>
        </div>
      </div>

      {/* Actions utilisateur */}
      <div className="flex items-center gap-4">
        {/* Bouton notifications */}
        <button
          className="relative p-3 rounded-2xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 text-gray-600 hover:text-purple-600 focus:outline-none transition-all duration-300 group"
          onClick={() => navigate('/admin/notifications')}
        >
          <Bell size={22} className="transition-transform duration-300 group-hover:scale-110" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full px-2 py-1 font-bold shadow-lg animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Menu profil */}
        <div className="relative">
          <button
            onClick={() => setShowProfile((v) => !v)}
            className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border border-white/50 text-gray-700 font-medium focus:outline-none transition-all duration-300 hover:shadow-lg"
          >
            <span className="hidden sm:block">{user?.name || 'Admin'}</span>
            <div className="relative">
              <img
                src={witti_logo}
                alt="Avatar"
                className="w-10 h-10 rounded-full border-2 border-white shadow-lg object-contain"
              />
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-400/30 to-blue-400/30 rounded-full blur-sm" />
            </div>
          </button>

          {/* Menu déroulant */}
          {showProfile && (
            <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 z-30 animate-fade-in-up overflow-hidden">
              {/* Header du menu */}
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50/50 to-blue-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.name?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{user?.name || 'Admin'}</p>
                    <p className="text-sm text-gray-500 capitalize">{user?.role || 'admin'}</p>
                  </div>
                </div>
              </div>

              {/* Options du menu */}
              <div className="py-2">
                <button
                  onClick={() => { navigate('/admin/profile'); setShowProfile(false); }}
                  className="w-full flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-200"
                >
                  <User size={18} className="text-purple-600" />
                  <span>Mon Profil</span>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-6 py-3 text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200"
                >
                  <LogOut size={18} />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Effet de bordure lumineuse */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />
    </header>
  );
};

export default Header;