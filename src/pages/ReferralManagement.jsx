// src/pages/ReferralManagement.jsx
import React, { useEffect, useState } from 'react';
import { Gift, Edit, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/api';
import PageHeader from '../components/common/PageHeader';
import ModernTable from '../components/common/ModernTable';
import ModernModal from '../components/common/ModernModal';

const ReferralManagement = () => {
  const { token } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState(null);
  const [form, setForm] = useState({ referrer: '', referred: '', status: '' });

  useEffect(() => { fetchReferrals(); }, [token]);

  const fetchReferrals = async () => {
    setLoading(true); setError('');
    try {
      const data = await apiFetch('/admin/referrals', { token });
      setReferrals(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.data?.msg || err?.data?.error || err?.message || 'Erreur lors du chargement.');
    } finally { setLoading(false); }
  };

  const openAdd = () => { setIsEditing(false); setForm({ referrer: '', referred: '', status: '' }); setShowModal(true); };
  const openEdit = (ref) => { setIsEditing(true); setCurrent(ref); setForm({ ...ref }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setCurrent(null); setForm({ referrer: '', referred: '', status: '' }); };

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await apiFetch(`/admin/referrals/${current.id}`, { method: 'PUT', token, body: form });
      } else {
        await apiFetch('/admin/referrals', { method: 'POST', token, body: form });
      }
      closeModal();
      fetchReferrals();
    } catch (err) {
      setError(err?.data?.msg || err?.data?.error || err?.message || 'Erreur lors de la soumission.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce parrainage ?')) return;
    try {
      await apiFetch(`/admin/referrals/${id}`, { method: 'DELETE', token });
      fetchReferrals();
    } catch (err) {
      setError(err?.data?.msg || err?.data?.error || err?.message || 'Erreur lors de la suppression.');
    }
  };

  // Recherche et pagination
  const filtered = referrals.filter(ref =>
    ref.referrer?.toLowerCase().includes(search.toLowerCase()) ||
    ref.referred?.toLowerCase().includes(search.toLowerCase()) ||
    ref.status?.toLowerCase().includes(search.toLowerCase())
  );
  const itemsPerPage = 8;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="max-w-4xl mx-auto w-full animate-fade-in-up">
      <PageHeader
        title="Gestion des parrainages"
        description="Ajoutez, modifiez ou supprimez les parrainages."
        icon={Gift}
        gradient="from-pink-500 to-yellow-500"
      >
      </PageHeader>
      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-2">
        <input
          type="text"
          placeholder="Rechercher un parrainage..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full md:w-72 px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
        />
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
      <ModernTable
        headers={["Parrain", "Filleul", "Lien", "Statut", "Date de création","Actions"]}
        loading={loading}
        emptyMessage="Aucun parrainage trouvé."
      >
        {paginated.map(ref => (
          <tr key={ref.id}>
            <td className="px-6 py-4 font-semibold">{ref.referrer_email}</td>
            <td className="px-6 py-4">{ref.referred_email}</td>
              <td className="px-6 py-4">{ref.referral_link}</td>
              <td className="px-6 py-4">{ref.status}</td>
              <td className="px-6 py-4">{ref.created_at}</td>
            <td className="px-6 py-4 flex align-center">
              <button onClick={() => handleDelete(ref.id)} className="text-red-600 hover:underline"><Trash2 size={18} /></button>
            </td>
          </tr>
        ))}
      </ModernTable>
      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <ModernModal
        isOpen={showModal}
        onClose={closeModal}
        title={isEditing ? 'Modifier le parrainage' : 'Ajouter un parrainage'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="referrer" value={form.referrer} onChange={handleChange} placeholder="Parrain" className="px-3 py-2 border rounded-lg w-full" required />
          <input type="text" name="referred" value={form.referred} onChange={handleChange} placeholder="Filleul" className="px-3 py-2 border rounded-lg w-full" required />
          <input type="text" name="status" value={form.status} onChange={handleChange} placeholder="Statut" className="px-3 py-2 border rounded-lg w-full" required />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Annuler</button>
            <button type="submit" className="px-4 py-2 bg-pink-600 text-white hover:bg-pink-700 rounded-lg">{isEditing ? 'Enregistrer' : 'Créer'}</button>
          </div>
        </form>
      </ModernModal>
    </div>
  );
};

export default ReferralManagement;