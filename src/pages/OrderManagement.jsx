import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Filter, Search, ChevronDown, Check, X, Circle } from 'lucide-react';

const statusColors = {
  Valider: 'bg-[#d1c4e9] text-[#4a148c]',
  En_attente: 'bg-blue-100 text-blue-800',
  Annuler: 'bg-red-100 text-red-800',
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? 'Date non valide' : date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const ordersPerPage = 5;

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const filterOrderId = queryParams.get('filter');

  const fetchOrders = async () => {
    try {
      const admin = JSON.parse(localStorage.getItem('admin'));
      if (!admin || !admin.token) {
        setErrorMessage('Authentication required. Please log in as an admin.');
        return;
      }

      const response = await fetch('http://localhost:5000/order/', {
        headers: {
          'Authorization': `Bearer ${admin.token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || `Failed to fetch orders: ${response.status}`);
      }

      const data = await response.json();
      setOrders(data.orders || []);
      setErrorMessage('');
    } catch (err) {
      console.error('Erreur lors du chargement des commandes:', err);
      setErrorMessage(err.message);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (filterOrderId && orders.length > 0) {
      const orderIndex = orders.findIndex(order => order.id === filterOrderId);
      if (orderIndex !== -1) {
        const targetPage = Math.floor(orderIndex / ordersPerPage) + 1;
        setCurrentPage(targetPage);
      }
    }
  }, [filterOrderId, orders]);

  const updateOrderStatus = async (orderId, newStatus, message) => {
    try {
      const admin = JSON.parse(localStorage.getItem('admin'));
      if (!admin || !admin.token) {
        setErrorMessage('Authentication required. Please log in as an admin.');
        return;
      }

      const order = orders.find(o => o.id === orderId);
      const updatedMessages = [...(order.messages || []), message];

      const response = await fetch(`http://localhost:5000/order/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${admin.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          messages: updatedMessages,
          ...(newStatus === 'Valider' && { message: '' })
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to update order status');
      }

      const adminNotification = {
        user_id: JSON.parse(localStorage.getItem('admin')).id,
        message: `Commande ${orderId} ${newStatus === 'Annuler' ? 'annulée' : 'validée'}`,
        order_id: orderId,
        is_admin: true
      };
      const clientNotification = {
        user_id: order.user_id,
        message: `Votre commande ${orderId} a été ${newStatus === 'Annuler' ? 'annulée' : 'validée'}. ${message || ''}`,
        order_id: orderId,
        is_admin: false
      };

      await fetch('http://localhost:5000/admin/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${admin.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([adminNotification, clientNotification])
      });

      await fetchOrders();
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la commande:', err);
      setErrorMessage(err.message);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setShowStatusDropdown(false);
    setCurrentPage(1);
  };

  const handleValidateOrder = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    const defaultMessage = `Article ${order.item} (${order.quantity}) disponible en agence Witti Côte d'Ivoire. Vous pouvez le récupérer.`;
    const customMessage = window.prompt("Modifier le message (laissez vide pour utiliser le message par défaut):", defaultMessage);
    const finalMessage = customMessage || defaultMessage;
    updateOrderStatus(orderId, 'Valider', finalMessage);
    alert(`Notification envoyée à ${order.customer}: ${finalMessage}`);
  };

  const handleCancelOrder = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    updateOrderStatus(orderId, 'Annuler', 'Article non disponible en stock');
    alert(`Notification envoyée à ${order.customer}: Article non disponible en stock`);
  };

  const downloadCSV = () => {
    const headers = ['ID, Client, Quantité, Article, Date, Heure, Jetons, Statut, Messages'];
    const rows = paginatedOrders.map(order => [
      order.id,
      order.customer,
      order.quantity,
      order.item,
      formatDate(order.date),
      order.heure,
      order.amount.toFixed(2),
      order.status,
      order.messages.length > 0 ? order.messages.join('; ') : 'Aucun message'
    ].join(','));
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.item.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    const matchesFilter = !filterOrderId || order.id === filterOrderId;
    return matchesSearch && matchesStatus && matchesFilter;
  });

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ordersPerPage);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-photoshop-jaune">Gestion des commandes</h1>
        <button
          onClick={downloadCSV}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Télécharger CSV
        </button>
      </div>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          {errorMessage}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="search"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-photoshop-orange focus:border-photoshop-orange"
              placeholder="Rechercher une commande..."
              value={searchTerm}
              onChange={handleSearch}
              aria-label="Rechercher une commande"
            />
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-photoshop-orange focus:border-photoshop-orange"
              aria-label="Filtrer par statut"
            >
              <Filter size={16} className="mr-2 text-gray-500" />
              <span>{statusFilter || 'Filtrer par statut'}</span>
              <ChevronDown size={16} className="ml-2 text-gray-500" />
            </button>
            
            {showStatusDropdown && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <button
                  onClick={() => handleStatusFilter('')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Tous les statuts
                </button>
                <button
                  onClick={() => handleStatusFilter('Valider')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Valider
                </button>
                <button
                  onClick={() => handleStatusFilter('En_attente')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  En attente
                </button>
                <button
                  onClick={() => handleStatusFilter('Annuler')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Heure
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jetons
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Messages
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {order.status === 'Valider' && (
                        <Circle size={12} className="text-green-600 mr-2" fill="currentColor" />
                      )}
                      {order.status === 'Annuler' && (
                        <Circle size={12} className="text-red-600 mr-2" fill="currentColor" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                        <div className="text-sm text-gray-500">{order.contact}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{order.quantity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{order.item}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(order.date)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{order.heure}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.amount.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      statusColors[order.status]
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {order.messages.length > 0 ? order.messages.join(', ') : 'Aucun message'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleValidateOrder(order.id)}
                      className="text-green-600 hover:text-green-800"
                      disabled={order.status === 'Valider' || order.status === 'Annuler'}
                      aria-label={`Valider la commande ${order.id}`}
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="text-red-600 hover:text-red-800"
                      disabled={order.status === 'Valider' || order.status === 'Annuler'}
                      aria-label={`Annuler la commande ${order.id}`}
                    >
                      <X size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-600">
          Affichage de {startIndex + 1} à {Math.min(startIndex + ordersPerPage, filteredOrders.length)} sur {filteredOrders.length} commandes
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            aria-label="Page précédente"
          >
            Précédent
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            aria-label="Page suivante"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;