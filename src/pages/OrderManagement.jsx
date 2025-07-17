import React, { useEffect, useState } from 'react';
import { ShoppingCart, CheckCircle, XCircle, Eye, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/api';
import PageHeader from '../components/common/PageHeader';
import ModernTable from '../components/common/ModernTable';
import StatusBadge from '../components/common/StatusBadge';

const statusMap = {
  pending: { label: 'En attente', type: 'warning' },
  validated: { label: 'Validée', type: 'success' },
  cancelled: { label: 'Annulée', type: 'error' },
};

const OrderManagement = () => {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchOrders(); }, [token]);

  const fetchOrders = async () => {
    setLoading(true); setError('');
    try {
      const data = await apiFetch('/admin/orders', { token });
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      setError(err?.data?.msg || err?.data?.error || err?.message || 'Erreur lors du chargement.');
    } finally { setLoading(false); }
  };

  const handleValidate = async (order) => {
    if (!window.confirm('Valider cette commande ?')) return;
    try {
      await apiFetch(`/admin/orders/${order.id}/validate`, { 
        method: 'PUT', 
        token
      });
      fetchOrders();
    } catch (err) {
      setError(err?.data?.msg || err?.data?.error || err?.message || 'Erreur lors de la validation.');
    }
  };

  const handleCancel = async (order) => {
    if (!window.confirm('Annuler cette commande ?')) return;
    try {
      await apiFetch(`/admin/orders/${order.id}/cancel`, { 
        method: 'PUT', 
        token
      });
    fetchOrders();
    } catch (err) {
      setError(err?.data?.msg || err?.data?.error || err?.message || 'Erreur lors de l\'annulation.');
    }
  };

  // Tri : commandes en attente d'abord, traitées ensuite
  const sortedOrders = [...orders].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return 0;
  });
  // Recherche et pagination
  const filtered = sortedOrders.filter(o =>
    o.id?.toString().includes(search) ||
    o.status?.toLowerCase().includes(search.toLowerCase()) ||
    o.amount?.toString().includes(search) ||
    o.date?.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_id?.toString().includes(search) ||
    (o.items && o.items.some(item => item.libelle?.toLowerCase().includes(search.toLowerCase())))
  );
  const itemsPerPage = 8;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto w-full animate-fade-in-up">
      <PageHeader
        title="Gestion des commandes"
        description="Validez, annulez ou consultez les commandes des clients."
        icon={ShoppingCart}
        gradient="from-gray-700 to-gray-900"
      >
        <button
          onClick={() => { setRefreshing(true); fetchOrders().then(() => setRefreshing(false)); }}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold shadow flex items-center gap-2"
        >
          <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} /> Rafraîchir
        </button>
      </PageHeader>
      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-2">
        <input
          type="text"
          placeholder="Rechercher par ID, statut, montant, date..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full md:w-72 px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
      <ModernTable
        headers={["ID", "Client", "Articles", "Montant", "Statut", "Date", "Actions"]}
        loading={loading}
        emptyMessage="Aucune commande trouvée."
      >
        {paginated.map(order => (
          <tr key={order.id}>
            <td className="px-6 py-4">{order.id}</td>
            <td className="px-6 py-4">
              <a
                href={`/admin/users/${order.customer_id}`}
                className="text-blue-600 hover:underline font-semibold"
              >
                {`Client #${order.customer_id}`}
              </a>
            </td>
            <td className="px-6 py-4">
              {order.items && order.items.length > 0 ? (
                <ul className="space-y-1">
                  {order.items.map((item, idx) => (
                    <li key={idx}>
                      <span className="font-medium">{item.libelle}</span> <span className="text-gray-500">x{item.quantity}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-gray-400 italic">Aucun article</span>
              )}
                  </td>
            <td className="px-6 py-4">{order.amount} jetons</td>
            <td className="px-6 py-4">
              <StatusBadge status={statusMap[order.status]?.label || order.status} type={statusMap[order.status]?.type || 'default'} />
                  </td>
            <td className="px-6 py-4">{order.date}</td>
            <td className="px-6 py-4 flex gap-2">
              <button 
                onClick={() => handleValidate(order)} 
                disabled={order.status === 'validated' || order.status === 'cancelled'}
                className={`${order.status === 'validated' || order.status === 'cancelled' 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-green-600 hover:underline'}`} 
                title={order.status === 'validated' ? 'Déjà validée' : order.status === 'cancelled' ? 'Commande annulée' : 'Valider'}
              >
                <CheckCircle size={18} />
                    </button>
              <button 
                onClick={() => handleCancel(order)} 
                disabled={order.status === 'validated' || order.status === 'cancelled'}
                className={`${order.status === 'validated' || order.status === 'cancelled' 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-red-600 hover:underline'}`} 
                title={order.status === 'validated' ? 'Commande validée' : order.status === 'cancelled' ? 'Déjà annulée' : 'Annuler'}
              >
                <XCircle size={18} />
                    </button>
                  </td>
                </tr>
        ))}
      </ModernTable>
      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default OrderManagement;