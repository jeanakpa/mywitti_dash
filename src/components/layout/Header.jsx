import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, LogOut, Menu, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const NotificationItem = ({ id, text, time, onClick, onMarkAsRead }) => {
  const handleClick = async () => {
    try {
      await onMarkAsRead(id); // Marquer comme lu
      onClick(); // Fermer le menu déroulant
    } catch (err) {
      console.error('Erreur lors du marquage comme lu:', err);
    }
  };

  return (
    <Link
      to={`/notifications?id=${id}`}
      onClick={handleClick}
      className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100"
    >
      <p className="text-sm font-medium text-gray-900">{text}</p>
      <p className="text-xs text-gray-500">{time}</p>
    </Link>
  );
};

const ProfileMenu = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log('Logging out');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('admin');
    navigate('/login', { replace: true });
  };

  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
      <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200">
        Administrateur
      </div>
      <Link
        to="/profile"
        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        Mon profil
      </Link>
      <div className="border-t border-gray-100"></div>
      <button
        onClick={handleLogout}
        className="flex items-center w-full text-left px-4 py-2 text-sm text-photoshop-orange hover:bg-gray-100"
      >
        <LogOut size={16} className="mr-2" />
        Déconnexion
      </button>
    </div>
  );
};

const Header = ({ toggleSidebar }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    const admin = JSON.parse(localStorage.getItem('admin'));
    if (!admin || !admin.token) {
      console.log('Aucun token admin trouvé dans localStorage:', localStorage.getItem('admin'));
      setError('Token manquant. Veuillez vous reconnecter.');
      setLoading(false);
      return;
    }

    console.log('Fetching notifications with token:', admin.token);
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/admin/notifications', {
        headers: {
          Authorization: `Bearer ${admin.token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Notifications récupérées:', response.data);
      setNotifications(response.data.notifications.filter(n => !n.is_read));
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des notifications:', err.message);
      if (err.message.includes('Network Error')) {
        setError('Impossible de se connecter au serveur. Vérifiez si le serveur est en cours d\'exécution sur http://localhost:5000.');
      } else if (err.response?.status === 403 || err.response?.status === 401) {
        setError('Session invalide. Veuillez vous reconnecter.');
        localStorage.removeItem('admin');
        navigate('/login');
      } else {
        setError(`Erreur: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    const admin = JSON.parse(localStorage.getItem('admin'));
    if (!admin || !admin.token) {
      setError('Accès non autorisé. Veuillez vous connecter.');
      navigate('/login');
      return;
    }

    try {
      await axios.patch(`http://localhost:5000/admin/notifications/${notificationId}`, {}, {
        headers: {
          Authorization: `Bearer ${admin.token}`,
          'Content-Type': 'application/json',
        },
      });

      // Mettre à jour la liste des notifications en supprimant celle qui vient d'être lue
      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Erreur lors du marquage comme lu:', err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        setError('Session invalide. Veuillez vous reconnecter.');
        localStorage.removeItem('admin');
        navigate('/login');
      } else {
        setError(err.response?.data?.msg || 'Erreur lors du marquage comme lu.');
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 h-16 shadow-sm z-20">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-500 hover:text-photoshop-orange hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-photoshop-orange md:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
          </button>
          
          <div className="relative flex-1 ml-4 max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="search"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-photoshop-orange focus:border-photoshop-orange"
              placeholder="Rechercher..."
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-500 rounded-full hover:text-photoshop-orange hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-photoshop-orange relative"
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 h-5 w-5 bg-photoshop-orange rounded-full flex items-center justify-center text-xs text-white">
                  {notifications.length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200 flex justify-between items-center">
                  <span>Notifications</span>
                  <button onClick={() => setShowNotifications(false)} className="text-gray-500 hover:text-gray-700">
                    <X size={16} />
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-gray-500 text-center">Chargement...</div>
                  ) : error ? (
                    <div className="p-4 text-red-500">{error}</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-gray-500 text-center">
                      Aucune notification pour le moment.
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <NotificationItem
                        key={notification.id}
                        id={notification.id}
                        text={notification.message}
                        time={new Date(notification.created_at).toLocaleString('fr-FR')}
                        onClick={() => setShowNotifications(false)}
                        onMarkAsRead={handleMarkAsRead}
                      />
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="px-4 py-2 text-xs font-medium text-center text-photoshop-orange border-t border-gray-200">
                    <Link to="/notifications" onClick={() => setShowNotifications(false)}>
                      Voir toutes les notifications
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center text-gray-500 hover:text-photoshop-orange focus:outline-none focus:ring-2 focus:ring-photoshop-orange"
            >
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                <User size={20} className="text-gray-500" />
              </div>
            </button>
            
            {showProfileMenu && <ProfileMenu />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;