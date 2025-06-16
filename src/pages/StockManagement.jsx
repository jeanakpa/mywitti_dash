import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const StockManagement = () => {
  const [stock, setStock] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({
    reward_id: '',
    name: '',
    quantity_available: '',
    price_tokens: '',
    unit_price_fcfa: '',
    category: '',
    image: null,
  });
  const [editItem, setEditItem] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const navigate = useNavigate();

  // Récupérer le token JWT depuis localStorage
  const token = localStorage.getItem('token'); // Assure-toi que le token est stocké ici après login

  // Configurer axios avec le token
  const api = axios.create({
    baseURL: 'http://127.0.0.1:5000',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

  // Charger les stocks au montage
  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      const response = await api.get('/admin/stock');
      setStock(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des stocks:', error);
    }
  };

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
    if (file) {
      if (editItem) {
        setEditItem({ ...editItem, image: file });
      } else {
        setNewItem({ ...newItem, image: file });
      }
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('reward_id', newItem.reward_id);
    formData.append('name', newItem.name);
    formData.append('quantity_available', newItem.quantity_available);
    formData.append('price_tokens', newItem.price_tokens);
    formData.append('unit_price_fcfa', newItem.unit_price_fcfa);
    formData.append('category', newItem.category || '');
    if (newItem.image) formData.append('image', newItem.image);

    try {
      const response = await api.post('/admin/stock', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStock([...stock, response.data]);
      setIsAdding(false);
      setNewItem({
        reward_id: '',
        name: '',
        quantity_available: '',
        price_tokens: '',
        unit_price_fcfa: '',
        category: '',
        image: null,
      });
      setImagePreview(null);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du stock:', error);
    }
  };

  const handleEditItem = (item) => {
    setEditItem({ ...item, image: null });
    setImagePreview(null);
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;

    const formData = new FormData();
    formData.append('reward_id', editItem.reward_id);
    formData.append('name', editItem.name);
    formData.append('quantity_available', editItem.quantity_available);
    formData.append('price_tokens', editItem.price_tokens);
    formData.append('unit_price_fcfa', editItem.unit_price_fcfa);
    formData.append('category', editItem.category || '');
    if (editItem.image) formData.append('image', editItem.image);

    try {
      const response = await api.put(`/admin/stock/${editItem.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStock(stock.map(item => (item.id === editItem.id ? response.data : item)));
      setEditItem(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du stock:', error);
    }
  };

  const handleDeleteItem = async (stockId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      try {
        await api.delete(`/admin/stock/${stockId}`);
        setStock(stock.filter(item => item.id !== stockId));
      } catch (error) {
        console.error('Erreur lors de la suppression du stock:', error);
      }
    }
  };

  const downloadCSV = () => {
    const headers = ['ID, Reward ID, Nom, Quantité, Prix (jetons), Prix unitaire (FCFA), Catégorie, Image URL'];
    const rows = stock.map(item =>
      `${item.id}, ${item.reward_id}, "${item.name}", ${item.quantity_available}, ${item.price_tokens}, ${item.unit_price_fcfa}, "${item.category || ''}", "${item.image_url || ''}"`
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stock.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStock = stock.slice(startIndex, endIndex);
  const totalPages = Math.ceil(stock.length / itemsPerPage);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Gestion des stocks</h1>

      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-6 py-2 bg-[#5c669a] text-white rounded hover:bg-[#262e55] transition duration-200"
        >
          Ajouter un article
        </button>
        <button
          onClick={downloadCSV}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-200"
        >
          Télécharger CSV
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddItem} className="bg-white p-6 rounded-lg shadow-lg mb-6" encType="multipart/form-data">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Ajouter un nouvel article</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">ID de la récompense</label>
              <input
                type="number"
                name="reward_id"
                placeholder="ID de la récompense"
                value={newItem.reward_id}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Nom de l'article</label>
              <input
                type="text"
                name="name"
                placeholder="Nom de l'article"
                value={newItem.name}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Quantité</label>
              <input
                type="number"
                name="quantity_available"
                placeholder="Quantité"
                value={newItem.quantity_available}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Prix (jetons)</label>
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
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Prix unitaire (FCFA)</label>
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
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Catégorie (optionnel)</label>
              <input
                type="text"
                name="category"
                placeholder="Catégorie"
                value={newItem.category}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Image</label>
              <input
                type="file"
                name="image"
                accept="image/png, image/jpeg, image/gif"
                onChange={handleImageChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {imagePreview && (
                <div className="mt-2">
                  <img src={imagePreview} alt="Aperçu" className="h-20 w-20 object-cover rounded" />
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
            >
              <Plus size={18} className="mr-2" />
              Ajouter
            </button>
          </div>
        </form>
      )}

      
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
                      <div>
                        <input
                          type="file"
                          name="image"
                          accept="image/png, image/jpeg, image/gif"
                          onChange={handleImageChange}
                          className="p-2 border rounded"
                        />
                        {imagePreview && (
                          <div className="mt-2">
                            <img src={imagePreview} alt="Aperçu" className="h-10 w-10 object-cover rounded" />
                          </div>
                        )}
                      </div>
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
                        className="p-2 border rounded w-full"
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
                        className="p-2 border rounded w-full"
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
                        className="p-2 border rounded w-full"
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
                        className="p-2 border rounded w-full"
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
                        className="p-2 border rounded w-full"
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