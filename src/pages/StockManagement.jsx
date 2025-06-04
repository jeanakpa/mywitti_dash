import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const StockManagement = () => {
  const navigate = useNavigate();
  const [stock, setStock] = useState([]);
  const [newItem, setNewItem] = useState({
    reward_id: '',
    name: '',
    quantity_available: '',
    price_tokens: '',
    unit_price_fcfa: '',
    image: null,
    category: ''
  });
  const [editItem, setEditItem] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 5;

  // Récupérer le stock depuis l'API
  useEffect(() => {
    const fetchStock = async () => {
      try {
        setLoading(true);
        setError(null);

        const admin = JSON.parse(localStorage.getItem('admin'));
        if (!admin || !admin.token) {
          throw new Error('Aucune donnée admin trouvée dans localStorage. Veuillez vous reconnecter.');
        }

        const response = await axios.get('http://localhost:5000/admin/stock', {
          headers: {
            Authorization: `Bearer ${admin.token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!Array.isArray(response.data)) {
          throw new Error('Les données de l\'API ne sont pas un tableau.');
        }

        setStock(response.data);
      } catch (err) {
        console.error('Erreur complète:', err);
        if (err.message === 'Network Error') {
          setError('Erreur réseau. Vérifiez si le serveur Flask est démarré sur http://localhost:5000.');
        } else if (err.response) {
          if (err.response.status === 403) {
            setError('Accès interdit. Vérifiez vos permissions ou reconnectez-vous.');
            localStorage.removeItem('admin');
            navigate('/login');
          } else if (err.response.status === 404) {
            setError('Endpoint non trouvé. Vérifiez l\'URL de l\'API.');
          } else {
            setError(`Erreur ${err.response.status}: ${err.response.data?.message || 'Erreur inconnue.'}`);
          }
        } else {
          setError(err.message || 'Impossible de charger le stock. Vérifiez le serveur ou votre connexion.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStock();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editItem) {
      setEditItem({ ...editItem, [name]: value });
    } else {
      setNewItem({ ...newItem, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (editItem) {
      setEditItem({ ...editItem, image: file });
    } else {
      setNewItem({ ...newItem, image: file });
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const admin = JSON.parse(localStorage.getItem('admin'));
      if (!admin || !admin.token) {
        setError('Aucune donnée admin trouvée dans localStorage. Veuillez vous reconnecter.');
        navigate('/login');
        return;
      }

      if (!newItem.reward_id || !newItem.name || !newItem.quantity_available || !newItem.price_tokens || !newItem.unit_price_fcfa || !newItem.image) {
        setError('Veuillez remplir tous les champs.');
        return;
      }

      const formData = new FormData();
      formData.append('reward_id', Number(newItem.reward_id));
      formData.append('name', newItem.name);
      formData.append('quantity_available', Number(newItem.quantity_available));
      formData.append('price_tokens', Number(newItem.price_tokens));
      formData.append('unit_price_fcfa', Number(newItem.unit_price_fcfa));
      formData.append('category', newItem.category || '');
      formData.append('image', newItem.image);

      const response = await axios.post('http://localhost:5000/admin/stock', formData, {
        headers: {
          Authorization: `Bearer ${admin.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setStock(prev => [...prev, response.data]);
      setNewItem({
        reward_id: '',
        name: '',
        quantity_available: '',
        price_tokens: '',
        unit_price_fcfa: '',
        image: null,
        category: ''
      });
      setIsAdding(false);
    } catch (err) {
      console.error('Erreur lors de l\'ajout de l\'article:', err);
      if (err.response) {
        if (err.response.status === 403) {
          setError('Accès interdit. Seuls les super admins peuvent ajouter du stock.');
          localStorage.removeItem('admin');
          navigate('/login');
        } else if (err.response.status === 401) {
          setError('Non autorisé. Le jeton est invalide ou expiré. Reconnectez-vous.');
          localStorage.removeItem('admin');
          navigate('/login');
        } else {
          setError(`Erreur ${err.response.status}: ${err.response.data?.message || 'Échec de l\'ajout.'}`);
        }
      } else {
        setError(err.message || 'Erreur lors de l\'ajout de l\'article.');
      }
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const admin = JSON.parse(localStorage.getItem('admin'));
      if (!admin || !admin.token) {
        setError('Aucune donnée admin trouvée dans localStorage. Veuillez vous reconnecter.');
        navigate('/login');
        return;
      }

      const formData = new FormData();
      formData.append('name', editItem.name);
      formData.append('quantity_available', Number(editItem.quantity_available));
      formData.append('price_tokens', Number(editItem.price_tokens));
      formData.append('unit_price_fcfa', Number(editItem.unit_price_fcfa));
      formData.append('category', editItem.category || '');
      if (editItem.image instanceof File) {
        formData.append('image', editItem.image);
      }

      const response = await axios.put(`http://localhost:5000/admin/stock/${editItem.id}`, formData, {
        headers: {
          Authorization: `Bearer ${admin.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setStock(stock.map(item => item.id === response.data.id ? response.data : item));
      setEditItem(null);
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'article:', err);
      if (err.response) {
        if (err.response.status === 403) {
          setError('Accès interdit. Seuls les super admins peuvent modifier le stock.');
          localStorage.removeItem('admin');
          navigate('/login');
        } else if (err.response.status === 401) {
          setError('Non autorisé. Le jeton est invalide ou expiré. Reconnectez-vous.');
          localStorage.removeItem('admin');
          navigate('/login');
        } else if (err.response.status === 404) {
          setError('Stock non trouvé.');
        } else {
          setError(`Erreur ${err.response.status}: ${err.response.data?.message || 'Échec de la mise à jour.'}`);
        }
      } else {
        setError(err.message || 'Erreur lors de la mise à jour de l\'article.');
      }
    }
  };

  const handleDeleteItem = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      try {
        setError(null);
        const admin = JSON.parse(localStorage.getItem('admin'));
        if (!admin || !admin.token) {
          setError('Aucune donnée admin trouvée dans localStorage. Veuillez vous reconnecter.');
          navigate('/login');
          return;
        }

        const response = await axios.delete(`http://localhost:5000/admin/stock/${id}`, {
          headers: {
            Authorization: `Bearer ${admin.token}`,
            'Content-Type': 'application/json',
          },
        });

        setStock(stock.filter(item => item.id !== id));
      } catch (err) {
        console.error('Erreur lors de la suppression de l\'article:', err);
        if (err.response) {
          if (err.response.status === 403) {
            setError('Accès interdit. Seuls les super admins peuvent supprimer le stock.');
            localStorage.removeItem('admin');
            navigate('/login');
          } else if (err.response.status === 401) {
            setError('Non autorisé. Le jeton est invalide ou expiré. Reconnectez-vous.');
            localStorage.removeItem('admin');
            navigate('/login');
          } else if (err.response.status === 404) {
            setError('Stock non trouvé.');
          } else {
            setError(`Erreur ${err.response.status}: ${err.response.data?.message || 'Échec de la suppression.'}`);
          }
        } else {
          setError(err.message || 'Erreur lors de la suppression de l\'article.');
        }
      }
    }
  };

  const handleEditItem = (item) => {
    setEditItem({ ...item, image: null }); // Réinitialiser l'image pour l'édition
  };

  const downloadCSV = () => {
    const headers = ['ID, Nom, Catégorie, Quantité, Prix (jetons), Prix unitaire (FCFA)'];
    const rows = paginatedStock.map(item => [
      item.id,
      item.name,
      item.category || '',
      item.quantity_available,
      item.price_tokens,
      item.unit_price_fcfa
    ].join(','));
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stock.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(stock.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStock = stock.slice(startIndex, startIndex + itemsPerPage);

  if (loading) return <div className="p-6 text-center text-gray-600">Chargement...</div>;
  if (error) return (
    <div className="p-6 text-center text-red-600">
      {error}
      <Link to="/login" className="ml-2 text-indigo-600 hover:text-indigo-900">Se connecter</Link>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-photoshop-jaune">Gestion des stocks</h1>

      <div className="flex justify-between items-center mt-4">
        <button 
          onClick={() => setIsAdding(!isAdding)} 
          className="px-6 py-2 bg-[#5c669a] text-white rounded hover:bg-[#262e55]"
        >
          Ajouter un article
        </button>
        <button
          onClick={downloadCSV}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Télécharger CSV
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddItem} className="bg-white p-6 rounded-lg shadow-lg mt-6" encType="multipart/form-data">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Ajouter un nouvel article</h2>
          <div className="space-y-4">
            <input
              type="number"
              name="reward_id"
              placeholder="ID de la récompense"
              value={newItem.reward_id}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              name="name"
              placeholder="Nom de l'article"
              value={newItem.name}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="number"
              name="quantity_available"
              placeholder="Quantité"
              value={newItem.quantity_available}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="number"
              name="price_tokens"
              step="0.01"
              placeholder="Prix (jetons)"
              value={newItem.price_tokens}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="number"
              name="unit_price_fcfa"
              step="0.01"
              placeholder="Prix unitaire (FCFA)"
              value={newItem.unit_price_fcfa}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              name="category"
              placeholder="Catégorie"
              value={newItem.category}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="file"
              name="image"
              accept="image/png, image/jpeg, image/gif"
              onChange={handleImageChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Plus size={18} className="mr-2" />
              Ajouter
            </button>
          </div>
        </form>
      )}

      {stock.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md mt-6">
          <p className="text-gray-500">Aucun stock disponible pour le moment.</p>
        </div>
      ) : (
        <div className="mt-6 bg-white rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Quantité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Prix (jetons)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Prix unitaire (FCFA)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedStock.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editItem?.id === item.id ? (
                      <input
                        type="file"
                        name="image"
                        accept="image/png, image/jpeg, image/gif"
                        onChange={handleImageChange}
                        className="p-2 border rounded"
                      />
                    ) : (
                      <img
                        src={`http://localhost:5000${item.image_url}`}
                        alt={item.name}
                        className="h-10 w-10 object-cover rounded"
                        onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editItem?.id === item.id ? (
                      <input
                        type="text"
                        name="name"
                        value={editItem.name}
                        onChange={handleInputChange}
                        className="p-2 border rounded"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{item.name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editItem?.id === item.id ? (
                      <input
                        type="text"
                        name="category"
                        value={editItem.category || ''}
                        onChange={handleInputChange}
                        className="p-2 border rounded"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{item.category || 'N/A'}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editItem?.id === item.id ? (
                      <input
                        type="number"
                        name="quantity_available"
                        value={editItem.quantity_available}
                        onChange={handleInputChange}
                        className="p-2 border rounded"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{item.quantity_available}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editItem?.id === item.id ? (
                      <input
                        type="number"
                        name="price_tokens"
                        step="0.01"
                        value={editItem.price_tokens}
                        onChange={handleInputChange}
                        className="p-2 border rounded"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{item.price_tokens}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editItem?.id === item.id ? (
                      <input
                        type="number"
                        name="unit_price_fcfa"
                        step="0.01"
                        value={editItem.unit_price_fcfa}
                        onChange={handleInputChange}
                        className="p-2 border rounded"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{item.unit_price_fcfa} FCFA</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {editItem?.id === item.id ? (
                      <button onClick={handleSaveEdit} className="text-green-600 hover:text-green-800">
                        <Check size={18} />
                      </button>
                    ) : (
                      <button onClick={() => handleEditItem(item)} className="text-blue-600 hover:text-blue-800">
                        <Edit size={18} />
                      </button>
                    )}
                    <button onClick={() => handleDeleteItem(item.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-600">
          Affichage de {startIndex + 1} à {Math.min(startIndex + itemsPerPage, stock.length)} sur {stock.length} articles
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

export default StockManagement;