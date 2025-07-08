import React, { useEffect, useState } from 'react';
import { Megaphone, Plus, Edit, Trash2, Eye, EyeOff, Globe, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/api';
import PageHeader from '../components/common/PageHeader';
import ModernTable from '../components/common/ModernTable';
import StatusBadge from '../components/common/StatusBadge';
import ModernModal from '../components/common/ModernModal';

const AdvertisementManagement = () => {
  const { token } = useAuth();
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    country: '',
    is_active: true
  });

  useEffect(() => { fetchAdvertisements(); }, [token]);

  const fetchAdvertisements = async () => {
    setLoading(true); setError('');
    try {
      const data = await apiFetch('/advertisement/', { token });
      setAdvertisements(Array.isArray(data.advertisements) ? data.advertisements : []);
    } catch (err) {
      setError(err?.data?.msg || err?.data?.error || err?.message || 'Erreur lors du chargement.');
    } finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/advertisement/', { 
        method: 'POST', 
        token, 
        body: formData
      });
      setShowCreateModal(false);
      setFormData({ title: '', description: '', image_url: '', country: '', is_active: true });
      fetchAdvertisements();
    } catch (err) {
      setError(err?.data?.msg || err?.data?.error || err?.message || 'Erreur lors de la création.');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await apiFetch(`/advertisement/${editingAd.id}`, { 
        method: 'PUT', 
        token, 
        body: formData
      });
      setShowEditModal(false);
      setEditingAd(null);
      setFormData({ title: '', description: '', image_url: '', country: '', is_active: true });
      fetchAdvertisements();
    } catch (err) {
      setError(err?.data?.msg || err?.data?.error || err?.message || 'Erreur lors de la modification.');
    }
  };

  const handleDelete = async (ad) => {
    if (!window.confirm('Supprimer cette publicité ?')) return;
    try {
      await apiFetch(`/advertisement/${ad.id}`, { method: 'DELETE', token });
      fetchAdvertisements();
    } catch (err) {
      setError(err?.data?.msg || err?.data?.error || err?.message || 'Erreur lors de la suppression.');
    }
  };

  const handleToggle = async (ad) => {
    try {
      await apiFetch(`/advertisement/toggle/${ad.id}`, { method: 'POST', token });
      fetchAdvertisements();
    } catch (err) {
      setError(err?.data?.msg || err?.data?.error || err?.message || 'Erreur lors du changement de statut.');
    }
  };

  const openEditModal = (ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title || '',
      description: ad.description || '',
      image_url: ad.image_url || '',
      country: ad.country || '',
      is_active: ad.is_active
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', image_url: '', country: '', is_active: true });
  };

  // Tri : publicités actives d'abord, puis par date de création
  const sortedAds = [...advertisements].sort((a, b) => {
    if (a.is_active && !b.is_active) return -1;
    if (!a.is_active && b.is_active) return 1;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  // Recherche et pagination
  const filtered = sortedAds.filter(ad =>
    ad.title?.toLowerCase().includes(search.toLowerCase()) ||
    ad.description?.toLowerCase().includes(search.toLowerCase()) ||
    ad.country?.toLowerCase().includes(search.toLowerCase())
  );
  const itemsPerPage = 8;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const activeCount = advertisements.filter(ad => ad.is_active).length;

  return (
    <div className="max-w-7xl mx-auto w-full animate-fade-in-up">
      <PageHeader
        title="Gestion des publicités"
        description="Créez et gérez les publicités affichées dans l'application mobile."
        icon={Megaphone}
        gradient="from-purple-600 to-pink-600"
      >
        <div className="flex gap-2">
          <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-sm font-semibold">
            {activeCount}/3 actives
          </div>
          <button
            onClick={() => { setRefreshing(true); fetchAdvertisements().then(() => setRefreshing(false)); }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold shadow flex items-center gap-2"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} /> Rafraîchir
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold shadow flex items-center gap-2"
          >
            <Plus size={18} /> Nouvelle publicité
          </button>
        </div>
      </PageHeader>

      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-2">
        <input
          type="text"
          placeholder="Rechercher par titre, description, pays..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full md:w-72 px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
        />
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

      <ModernTable
        headers={["Image", "Titre", "Description", "Pays", "Statut", "Date", "Actions"]}
        loading={loading}
        emptyMessage="Aucune publicité trouvée."
      >
        {paginated.map(ad => (
          <tr key={ad.id} className={!ad.is_active ? 'opacity-60' : ''}>
            <td className="px-6 py-4">
              {ad.image_url ? (
                <img 
                  src={ad.image_url} 
                  alt={ad.title}
                  className="w-16 h-12 object-cover rounded-lg shadow-sm"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
              ) : (
                <div className="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-xs">Aucune image</span>
                </div>
              )}
            </td>
            <td className="px-6 py-4 font-semibold">{ad.title}</td>
            <td className="px-6 py-4 max-w-xs truncate">{ad.description}</td>
            <td className="px-6 py-4">
              {ad.country ? (
                <span className="flex items-center gap-1">
                  <Globe size={14} />
                  {ad.country}
                </span>
              ) : (
                <span className="text-gray-500 italic">Tous les pays</span>
              )}
            </td>
            <td className="px-6 py-4">
              <StatusBadge 
                status={ad.is_active ? 'Active' : 'Inactive'} 
                type={ad.is_active ? 'success' : 'default'} 
              />
            </td>
            <td className="px-6 py-4 text-sm text-gray-600">
              {new Date(ad.created_at).toLocaleDateString('fr-FR')}
            </td>
            <td className="px-6 py-4 flex gap-2">
              <button 
                onClick={() => handleToggle(ad)} 
                className="text-blue-600 hover:underline" 
                title={ad.is_active ? 'Désactiver' : 'Activer'}
              >
                {ad.is_active ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <button 
                onClick={() => openEditModal(ad)} 
                className="text-yellow-600 hover:underline" 
                title="Modifier"
              >
                <Edit size={18} />
              </button>
              <button 
                onClick={() => handleDelete(ad)} 
                className="text-red-600 hover:underline" 
                title="Supprimer"
              >
                <Trash2 size={18} />
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
            className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Modal de création */}
      <ModernModal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); resetForm(); }}
        title="Nouvelle publicité"
        size="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Titre de la publicité"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              required
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Description de la publicité"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL de l'image *</label>
            <input
              type="url"
              required
              value={formData.image_url}
              onChange={e => setFormData({...formData, image_url: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pays cible</label>
            <input
              type="text"
              value={formData.country}
              onChange={e => setFormData({...formData, country: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Laissez vide pour tous les pays"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={e => setFormData({...formData, is_active: e.target.checked})}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
              Activer immédiatement
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => { setShowCreateModal(false); resetForm(); }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Créer
            </button>
          </div>
        </form>
      </ModernModal>

      {/* Modal d'édition */}
      <ModernModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setEditingAd(null); resetForm(); }}
        title="Modifier la publicité"
        size="lg"
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Titre de la publicité"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              required
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Description de la publicité"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL de l'image *</label>
            <input
              type="url"
              required
              value={formData.image_url}
              onChange={e => setFormData({...formData, image_url: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pays cible</label>
            <input
              type="text"
              value={formData.country}
              onChange={e => setFormData({...formData, country: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Laissez vide pour tous les pays"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="edit_is_active"
              checked={formData.is_active}
              onChange={e => setFormData({...formData, is_active: e.target.checked})}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="edit_is_active" className="ml-2 block text-sm text-gray-900">
              Activer
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => { setShowEditModal(false); setEditingAd(null); resetForm(); }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Modifier
            </button>
          </div>
        </form>
      </ModernModal>
    </div>
  );
};

export default AdvertisementManagement; 