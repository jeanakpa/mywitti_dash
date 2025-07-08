import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Package, AlertTriangle } from 'lucide-react';
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
    libelle: '', jetons: '', stock: '', category_id: '', image_url: ''
  });

  useEffect(() => { fetchStock(); }, [token]);

  const fetchStock = async () => {
    setLoading(true); setError('');
    try {
      const data = await apiFetch('/admin/stock', { token });
      setStock(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.data?.msg || err?.data?.error || err?.message || 'Erreur lors du chargement.');
    } finally { setLoading(false); }
  };

  const openAdd = () => { setIsEditing(false); setForm({ libelle: '', jetons: '', stock: '', category_id: '', image_url: '' }); setShowModal(true); };
  const openEdit = (item) => { setIsEditing(true); setCurrent(item); setForm({ ...item }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setCurrent(null); setForm({ libelle: '', jetons: '', stock: '', category_id: '', image_url: '' }); };

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await apiFetch(`/admin/stock/${current.id}`, { method: 'PUT', token, body: form });
      } else {
        await apiFetch('/admin/stock', { method: 'POST', token, body: form });
      }
      closeModal();
      fetchStock();
    } catch (err) {
      setError(err?.data?.msg || err?.data?.error || err?.message || 'Erreur lors de la soumission.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce lot ?')) return;
    try {
      await apiFetch(`/admin/stock/${id}`, { method: 'DELETE', token });
      fetchStock();
    } catch (err) {
      setError(err?.data?.msg || err?.data?.error || err?.message || 'Erreur lors de la suppression.');
    }
  };

  // Recherche et pagination
  const filtered = stock.filter(item =>
    item.libelle?.toLowerCase().includes(search.toLowerCase()) ||
    item.category_id?.toString().includes(search)
  );
  const itemsPerPage = 8;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto w-full animate-fade-in-up">
      <PageHeader
        title="Gestion du stock"
        description="Ajoutez, modifiez ou supprimez les lots/récompenses."
        icon={Package}
        gradient="from-gray-700 to-gray-900"
      >
        <button
          onClick={openAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow flex items-center gap-2"
        >
          <Plus size={18} /> Ajouter
        </button>
      </PageHeader>
      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-2">
        <input
          type="text"
          placeholder="Rechercher par libellé, catégorie..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full md:w-72 px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
      <ModernTable
        headers={["Image", "Libellé", "Jetons", "Stock", "Catégorie", "Actions"]}
        loading={loading}
        emptyMessage="Aucun lot trouvé."
      >
        {paginated.map(item => (
          <tr key={item.id}>
            <td className="px-6 py-4">
              {item.recompense_image || item.image ? (
                <img src={item.recompense_image || item.image} alt={item.libelle} className="h-12 w-12 object-cover rounded shadow" />
              ) : (
                <span className="text-gray-400 italic">Aucune</span>
              )}
            </td>
            <td className="px-6 py-4">{item.libelle}</td>
            <td className="px-6 py-4">{item.jetons}</td>
            <td className="px-6 py-4 flex items-center gap-2">
              <StatusBadge status={item.stock > 10 ? 'OK' : item.stock > 0 ? 'Faible' : 'Épuisé'} type={item.stock > 10 ? 'success' : item.stock > 0 ? 'warning' : 'error'} />
              <span>{item.stock}</span>
              {item.stock <= 5 && <AlertTriangle size={14} className="text-yellow-500" />}
            </td>
            <td className="px-6 py-4">{item.category || item.category_id}</td>
            <td className="px-6 py-4 flex gap-2">
              <button onClick={() => openEdit(item)} className="text-blue-600 hover:underline"><Edit size={18} /></button>
              <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline"><Trash2 size={18} /></button>
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
      <ModernModal
        isOpen={showModal}
        onClose={closeModal}
        title={isEditing ? 'Modifier le lot' : 'Ajouter un lot'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="libelle" value={form.libelle} onChange={handleChange} placeholder="Libellé" className="px-3 py-2 border rounded-lg w-full" required />
          <input type="number" name="jetons" value={form.jetons} onChange={handleChange} placeholder="Jetons" className="px-3 py-2 border rounded-lg w-full" required min="0" />
          <input type="number" name="stock" value={form.stock} onChange={handleChange} placeholder="Stock" className="px-3 py-2 border rounded-lg w-full" required min="0" />
          <input type="text" name="category_id" value={form.category_id} onChange={handleChange} placeholder="Catégorie (ID ou nom)" className="px-3 py-2 border rounded-lg w-full" />
          <input type="text" name="image_url" value={form.image_url} onChange={handleChange} placeholder="URL de l'image" className="px-3 py-2 border rounded-lg w-full" />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Annuler</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg">{isEditing ? 'Enregistrer' : 'Créer'}</button>
          </div>
        </form>
      </ModernModal>
    </div>
  );
};

export default StockManagement; 