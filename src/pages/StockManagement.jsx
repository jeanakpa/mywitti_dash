import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Package, AlertTriangle, Upload, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/api';
import PageHeader from '../components/common/PageHeader';
import ModernTable from '../components/common/ModernTable';
import ModernModal from '../components/common/ModernModal';
import StatusBadge from '../components/common/StatusBadge';

const StockManagement = () => {
  const { token } = useAuth();
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState(null);
  const [form, setForm] = useState({
    libelle: '',
    jetons: '',
    stock: '',
    category_id: '',
    recompense_image_url: ''
  });

  // Fonction pour déterminer automatiquement la catégorie basée sur les jetons
  const getCategoryFromTokens = (tokens) => {
    const tokensNum = parseInt(tokens);
    if (tokensNum >= 1 && tokensNum <= 99) return 'Eco Premium';
    if (tokensNum >= 100 && tokensNum <= 999) return 'Executive';
    if (tokensNum >= 1000 && tokensNum <= 3000) return 'Executive +';
    if (tokensNum > 3000) return 'First Class';
    return '';
  };

  useEffect(() => { 
    if (token) fetchStock(); 
  }, [token]);

  const fetchStock = async () => {
    setLoading(true); 
    setError('');
    try {
      const response = await apiFetch('/admin/stock', { token });
      // Selon la doc API, la réponse est { msg: "...", stock: [...] }
      const stockData = response.stock || response;
      setStock(Array.isArray(stockData) ? stockData : []);
    } catch (err) {
      console.error('Erreur fetchStock:', err);
      setError(err?.data?.msg || err?.data?.error || err?.message || 'Erreur lors du chargement du stock.');
    } finally { 
      setLoading(false); 
    }
  };

  const openAdd = () => { 
    setIsEditing(false); 
    setForm({ 
      libelle: '', 
      jetons: '', 
      stock: '', 
      category_id: '', 
      recompense_image_url: '' 
    }); 
    setShowModal(true); 
  };

  const openEdit = (item) => { 
    setIsEditing(true); 
    setCurrent(item); 
    setForm({ 
      libelle: item.libelle || item.title || '',
      jetons: item.jetons || item.tokens_required || '',
      stock: item.stock || item.quantity_available || item.current_stock || '',
      category_id: item.category_id || item.category || '',
      recompense_image_url: item.recompense_image_url || item.image_url || item.recompense_image || item.image || ''
    }); 
    setShowModal(true); 
  };

  const closeModal = () => { 
    setShowModal(false); 
    setCurrent(null); 
    setForm({ 
      libelle: '', 
      jetons: '', 
      stock: '', 
      category_id: '', 
      recompense_image_url: '' 
    }); 
  };

  const handleChange = (e) => { 
    const { name, value } = e.target;
    setForm(prev => {
      const newForm = { ...prev, [name]: value };
      
      // Mise à jour automatique de la catégorie si les jetons changent
      if (name === 'jetons' && value) {
        newForm.category_id = getCategoryFromTokens(value);
      }
      
      return newForm;
    }); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        libelle: form.libelle,
        jetons: parseInt(form.jetons),
        stock: parseInt(form.stock),
        category_id: parseInt(form.category_id) || 1
      };

      // Ajouter l'image seulement si elle est fournie
      if (form.recompense_image_url && form.recompense_image_url.trim()) {
        payload.recompense_image_url = form.recompense_image_url.trim();
      }

      if (isEditing) {
        await apiFetch(`/admin/stock/${current.id}`, { 
          method: 'PUT', 
          token, 
          body: payload 
        });
      } else {
        await apiFetch('/admin/stock', { 
          method: 'POST', 
          token, 
          body: payload 
        });
      }
      closeModal();
      fetchStock();
    } catch (err) {
      console.error('Erreur submit:', err);
      setError(err?.data?.msg || err?.data?.error || err?.message || 'Erreur lors de la sauvegarde.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit du stock ?')) return;
    try {
      await apiFetch(`/admin/stock/${id}`, { method: 'DELETE', token });
      fetchStock();
    } catch (err) {
      console.error('Erreur delete:', err);
      setError(err?.data?.msg || err?.data?.error || err?.message || 'Erreur lors de la suppression.');
    }
  };

  // Recherche et pagination
  const filtered = stock.filter(item => {
    const searchLower = search.toLowerCase();
    const libelle = (item.libelle || item.title || '').toLowerCase();
    const category = (item.category_id || item.category || '').toLowerCase();
    const jetons = (item.jetons || item.tokens_required || '').toString();
    
    return libelle.includes(searchLower) || 
           category.includes(searchLower) || 
           jetons.includes(searchLower);
  });

  const itemsPerPage = 8;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto w-full animate-fade-in-up">
      <PageHeader
        title="Gestion du stock"
        description="Ajoutez, modifiez ou supprimez les produits/récompenses disponibles."
        icon={Package}
        gradient="from-gray-700 to-gray-900"
      >
        <button
          onClick={openAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow flex items-center gap-2"
        >
          <Plus size={18} /> Ajouter un produit
        </button>
      </PageHeader>

      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-2">
        <input
          type="text"
          placeholder="Rechercher par libellé, catégorie, jetons..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full md:w-72 px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <ModernTable
        headers={["Image", "Libellé", "Jetons", "Stock", "Catégorie", "Actions"]}
        loading={loading}
        emptyMessage="Aucun produit trouvé dans le stock."
      >
        {paginated.map(item => (
          <tr key={item.id}>
            <td className="px-6 py-4">
              {item.recompense_image_url || item.image_url || item.recompense_image || item.image ? (
                <img 
                  src={item.recompense_image_url || item.image_url || item.recompense_image || item.image} 
                  alt={item.libelle || item.title} 
                  className="h-12 w-12 object-cover rounded shadow"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
              ) : (
                <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center">
                  <Package size={20} className="text-gray-400" />
                </div>
              )}
            </td>
            <td className="px-6 py-4 font-medium">
              {item.libelle || item.title}
            </td>
            <td className="px-6 py-4">
              <span className="font-semibold text-blue-600">
                {item.jetons || item.tokens_required} jetons
              </span>
            </td>
            <td className="px-6 py-4 flex items-center gap-2">
              <StatusBadge 
                status={item.stock > 10 || item.quantity_available > 10 || item.current_stock > 10 ? 'Disponible' : 
                       item.stock > 0 || item.quantity_available > 0 || item.current_stock > 0 ? 'Faible' : 'Épuisé'} 
                type={item.stock > 10 || item.quantity_available > 10 || item.current_stock > 10 ? 'success' : 
                      item.stock > 0 || item.quantity_available > 0 || item.current_stock > 0 ? 'warning' : 'error'} 
              />
              <span className="font-medium">
                {item.stock || item.quantity_available || item.current_stock}
              </span>
              {(item.stock <= 5 || item.quantity_available <= 5 || item.current_stock <= 5) && 
                <AlertTriangle size={14} className="text-yellow-500" />
              }
            </td>
            <td className="px-6 py-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                (item.category_id || item.category) === 'First Class' ? 'bg-purple-100 text-purple-800' :
                (item.category_id || item.category) === 'Executive +' ? 'bg-blue-100 text-blue-800' :
                (item.category_id || item.category) === 'Executive' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {item.category_id || item.category}
              </span>
            </td>
            <td className="px-6 py-4 flex gap-2">
              <button 
                onClick={() => openEdit(item)} 
                className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                title="Modifier"
              >
                <Edit size={16} />
              </button>
              <button 
                onClick={() => handleDelete(item.id)} 
                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                title="Supprimer"
              >
                <Trash2 size={16} />
              </button>
            </td>
          </tr>
        ))}
      </ModernTable>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded ${
                page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <ModernModal
        isOpen={showModal}
        onClose={closeModal}
        title={isEditing ? 'Modifier le produit' : 'Ajouter un produit'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Libellé du produit *
            </label>
            <input 
              type="text" 
              name="libelle" 
              value={form.libelle} 
              onChange={handleChange} 
              placeholder="Ex: Carte cadeau 5000 FCFA" 
              className="px-3 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jetons requis *
            </label>
            <input 
              type="number" 
              name="jetons" 
              value={form.jetons} 
              onChange={handleChange} 
              placeholder="Ex: 50" 
              className="px-3 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              required 
              min="1"
            />
            {form.jetons && (
              <p className="text-xs text-gray-500 mt-1">
                Catégorie automatique: {getCategoryFromTokens(form.jetons)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantité en stock *
            </label>
            <input 
              type="number" 
              name="stock" 
              value={form.stock} 
              onChange={handleChange} 
              placeholder="Ex: 100" 
              className="px-3 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              required 
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID de la catégorie
            </label>
            <input 
              type="number" 
              name="category_id" 
              value={form.category_id} 
              onChange={handleChange} 
              placeholder="Ex: 1 (sera automatiquement déterminé par les jetons)" 
              className="px-3 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50" 
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL de l'image (optionnel)
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                name="recompense_image_url" 
                value={form.recompense_image_url} 
                onChange={handleChange} 
                placeholder="https://example.com/image.jpg" 
                className="px-3 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              />
              <button 
                type="button"
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Upload d'image (à implémenter)"
              >
                <Upload size={16} />
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button 
              type="button" 
              onClick={closeModal} 
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
            >
              {isEditing ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </ModernModal>
    </div>
  );
};

export default StockManagement;