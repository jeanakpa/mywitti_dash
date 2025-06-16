import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Bell, CheckCircle } from 'lucide-react';
import axios from 'axios';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);

        const admin = JSON.parse(localStorage.getItem('admin'));
        if (!admin || !admin.token) {
          throw new Error('Aucune donnée admin trouvée. Veuillez vous reconnecter.');
        }

        const response = await axios.get('http://localhost:5000/admin/notifications', {
          headers: {
            Authorization: `Bearer ${admin.token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.data || !Array.isArray(response.data.notifications)) {
          throw new Error('Les données de notifications sont invalides.');
        }

        setNotifications(response.data.notifications);
      } catch (err) {
        console.error('Erreur lors du chargement des notifications:', err);
        if (err.message === 'Network Error') {
          setError('Erreur réseau. Vérifiez si le serveur est démarré sur http://localhost:5000.');
        } else if (err.response) {
          if (err.response.status === 403) {
            setError('Accès interdit. Vérifiez vos permissions ou reconnectez-vous.');
            localStorage.removeItem('admin');
            navigate('/login');
          } else if (err.response.status === 401) {
            setError('Session expirée. Veuillez vous reconnecter.');
            localStorage.removeItem('admin');
            navigate('/login');
          } else {
            setError(`Erreur ${err.response.status}: ${err.response.data?.msg || 'Échec du chargement.'}`);
          }
        } else {
          setError(err.message || 'Erreur inconnue.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [navigate]);

  const handleDeleteNotification = async (notificationId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) return;

    try {
      setError(null);
      const admin = JSON.parse(localStorage.getItem('admin'));
      if (!admin || !admin.token) {
        setError('Accès non autorisé. Veuillez vous connecter.');
        navigate('/login');
        return;
      }

      await axios.delete(`http://localhost:5000/admin/notifications/${notificationId}`, {
        headers: {
          Authorization: `Bearer ${admin.token}`,
          'Content-Type': 'application/json',
        },
      });

      setNotifications(notifications.filter((notif) => notif.id !== notificationId));
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      if (err.response) {
        if (err.response.status === 403) {
          setError('Accès interdit. Vérifiez vos permissions.');
          localStorage.removeItem('admin');
          navigate('/login');
        } else if (err.response.status === 401) {
          setError('Session expirée. Veuillez vous reconnecter.');
          localStorage.removeItem('admin');
          navigate('/login');
        } else if (err.response.status === 404) {
          setError('Notification non trouvée.');
        } else {
          setError(`Erreur ${err.response.status}: ${err.response.data?.msg || 'Échec de la suppression.'}`);
        }
      } else {
        setError(err.message || 'Erreur serveur lors de la suppression.');
      }
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      setError(null);
      const admin = JSON.parse(localStorage.getItem('admin'));
      if (!admin || !admin.token) {
        setError('Accès non autorisé. Veuillez vous connecter.');
        navigate('/login');
        return;
      }

      await axios.patch(`http://localhost:5000/admin/notifications/${notificationId}`, {}, {
        headers: {
          Authorization: `Bearer ${admin.token}`,
          'Content-Type': 'application/json',
        },
      });

      setNotifications(notifications.map((notif) =>
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      ));
    } catch (err) {
      console.error('Erreur lors du marquage comme lu:', err);
      setError(err.response?.data?.msg || 'Erreur lors du marquage comme lu.');
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-600 animate-pulse">Chargement des notifications...</div>;
  if (error) return (
    <div className="p-6 text-start text-red-500">
      {error}
      <Link to="/login" className="ml-2 text-blue-600 hover:underline">Se connecter</Link>
    </div>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center mb-6">
        <Bell className="w-8 h-8 text-blue-600 mr-3" />
        <h1 className="text-3xl font-semibold text-gray-800">Notifications</h1>
        {notifications.some((n) => !n.is_read) && (
          <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            Nouvelles
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 text-lg">Aucune notification pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification, index) => (
            <div
              key={notification.id}
              className={`flex items-start justify-between bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn ${
                !notification.is_read ? 'border-l-4 border-blue-500' : 'border-l-4 border-gray-300'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex-1">
                <p className={`text-sm font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notification.created_at).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="flex space-x-2">
                {!notification.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                    title="Marquer comme lu"
                  >
                    <CheckCircle size={18} />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteNotification(notification.id)}
                  className="text-red-600 hover:text-red-800 transition-colors duration-200"
                  title="Supprimer la notification"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;