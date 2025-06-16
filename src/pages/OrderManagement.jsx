import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { FaSpinner } from 'react-icons/fa';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders'); // changez cette URL si besoin
      setOrders(response.data.orders || []);
      setLoading(false);
    } catch (err) {
      setError("Erreur lors du chargement des commandes");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-gray-500 text-3xl" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 text-center mt-4">{error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Gestion des commandes</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">Image</th>
              <th className="px-4 py-2 text-left">Récompense</th>
              <th className="px-4 py-2 text-left">Prix (Jetons)</th>
              <th className="px-4 py-2 text-left">Quantité</th>
              <th className="px-4 py-2 text-left">Total</th>
              <th className="px-4 py-2 text-left">Client</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Statut</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-4">Aucune commande disponible.</td>
              </tr>
            ) : (
              orders.map((order, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">
                    <img
                      src={order.image_url || '/placeholder.jpg'}
                      alt="Récompense"
                      className="w-12 h-12 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-2">{order.recompense || 'N/A'}</td>
                  <td className="px-4 py-2">{order.prix_jetons}</td>
                  <td className="px-4 py-2">{order.quantite}</td>
                  <td className="px-4 py-2">{order.total}</td>
                  <td className="px-4 py-2">{order.nom_client}</td>
                  <td className="px-4 py-2">{format(new Date(order.date), 'dd/MM/yyyy HH:mm')}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-white text-sm ${order.statut === 'validé' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                      {order.statut}
                    </span>
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
                      Voir
                    </button>
                    <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagement;
