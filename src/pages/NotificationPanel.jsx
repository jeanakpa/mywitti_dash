import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [error, setError] = useState(null); // Ajout pour gérer les erreurs

  useEffect(() => {
    const fetchNotifications = async () => {
      const admin = JSON.parse(localStorage.getItem('admin'));
      if (!admin || !admin.token) {
        console.log('Aucun token admin trouvé dans localStorage:', localStorage.getItem('admin'));
        setError('Token manquant. Veuillez vous reconnecter.');
        return;
      }

      console.log('Fetching notifications with token:', admin.token); // Débogage
      try {
        const response = await fetch('http://localhost:5000/admin/notifications', {
          headers: { 'Authorization': `Bearer ${admin.token}` },
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Erreur API:', response.status, errorText);
          setError(`Erreur API: ${response.status} - ${errorText}`);
          return;
        }
        const data = await response.json();
        console.log('Notifications récupérées:', data); // Débogage
        setNotifications(data.filter(n => !n.is_read));
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la récupération des notifications:', err);
        setError('Erreur réseau. Veuillez vérifier votre connexion.');
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <button onClick={() => setShowPanel(!showPanel)} className="p-2 text-gray-500 hover:text-photoshop-orange">
        <Bell size={24} />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 h-5 w-5 bg-photoshop-orange rounded-full text-white text-xs flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>
      {showPanel && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 border border-gray-200">
          <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b">Notifications</div>
          <div className="max-h-60 overflow-y-auto">
            {error ? (
              <div className="p-4 text-red-500">{error}</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-gray-500">Aucune notification.</div>
            ) : (
              notifications.map(n => (
                <a href={`/orders?filter=${n.order_id}`} key={n.id} className="block px-4 py-2 hover:bg-gray-50 border-b">
                  <p>{n.message}</p>
                  <p className="text-xs text-gray-500">{new Date(n.created_at).toLocaleString()}</p>
                </a>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;