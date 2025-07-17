import React, { useEffect, useState } from 'react';
import { Bell, Trash2, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/api';
import PageHeader from '../components/common/PageHeader';
import ModernTable from '../components/common/ModernTable';
import StatusBadge from '../components/common/StatusBadge';

const NotificationPanel = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchNotifications(); }, [token]);

    const fetchNotifications = async () => {
    setLoading(true); setError('');
    try {
      const data = await apiFetch('/admin/notifications', { token });
      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
    } catch (err) {
      setError(err?.data?.msg || err?.data?.error || err?.message || 'Erreur lors du chargement.');
    } finally { setLoading(false); }
  };

  const handleMarkRead = async (notif) => {
    try {
      // Essayer avec l'endpoint spécifique /read
      await apiFetch(`/admin/notifications/${notif.id}/read`, { 
        method: 'PUT', 
        token
      });
      fetchNotifications();
    } catch (err) {
      console.error('Erreur détaillée:', err);
      setError('Erreur lors de la mise à jour.');
    }
  };

  const handleDelete = async (notif) => {
    if (!window.confirm('Supprimer cette notification ?')) return;
    try {
      await apiFetch(`/admin/notifications/${notif.id}`, { method: 'DELETE', token });
      fetchNotifications();
      } catch (err) {
      setError('Erreur lors de la suppression.');
    }
  };

  // Recherche et pagination
  const filtered = notifications.filter(n =>
    n.title?.toLowerCase().includes(search.toLowerCase()) ||
    n.message?.toLowerCase().includes(search.toLowerCase())
  );
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="max-w-4xl mx-auto w-full animate-fade-in-up">
      <PageHeader
        title="Notifications"
        description="Consultez et gérez les notifications importantes."
        icon={Bell}
        gradient="from-yellow-500 to-orange-600"
      />
      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-2">
        <input
          type="text"
          placeholder="Rechercher une notification..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full md:w-72 px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-yellow-500 focus:outline-none"
        />
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
      <ModernTable
        headers={["Message", "Statut", "Date", "Actions"]}
        loading={loading}
        emptyMessage="Aucune notification."
      >
        {paginated.map(notif => (
          <tr key={notif.id} className={notif.is_read ? 'opacity-60' : ''}>
            <td className="px-6 py-4">{notif.message || 'Aucun message'}</td>
            <td className="px-6 py-4">
              <StatusBadge status={notif.is_read ? 'Lue' : 'Non lue'} type={notif.is_read ? 'success' : 'warning'} />
            </td>
            <td className="px-6 py-4">{notif.created_at || '-'}</td>
            <td className="px-6 py-4 flex gap-2">
              {!notif.is_read && (
                <button onClick={() => handleMarkRead(notif)} className="text-green-600 hover:underline" title="Marquer comme lue"><CheckCircle size={18} /></button>
              )}
              <button onClick={() => handleDelete(notif)} className="text-red-600 hover:underline" title="Supprimer"><Trash2 size={18} /></button>
            </td>
          </tr>
        ))}
      </ModernTable>
      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {i + 1}
      </button>
        ))}
        </div>
    </div>
  );
};

export default NotificationPanel;