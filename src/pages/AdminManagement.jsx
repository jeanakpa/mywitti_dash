import React, { useEffect, useState } from 'react';
import { Shield, Edit, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/api';
import PageHeader from '../components/common/PageHeader';
import ModernTable from '../components/common/ModernTable';
import ModernModal from '../components/common/ModernModal';

const AdminManagement = () => {
  const { token } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: '' });

  useEffect(() => { fetchAdmins(); }, [token]);

  const fetchAdmins = async () => {
    setLoading(true); setError('');
    try {
      const data = await apiFetch('/admin/admins', { token });
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.data?.msg || err?.data?.error || err?.message || 'Erreur lors du chargement.');
    } finally { setLoading(false); }
  };

  const openAdd = () => { setIsEditing(false); setForm({ name: '', email: '', role: '' }); setShowModal(true); };
  const openEdit = (admin) => { setIsEditing(true); setCurrent(admin); setForm({ ...admin }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setCurrent(null); setForm({ name: '', email: '', role: '' }); };

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await apiFetch(`/admin/admins/${current.id}`, { method: 'PUT', token, body: form });
      } else {
        await apiFetch('/admin/admins', { method: 'POST', token, body: form });
      }
      closeModal();
      fetchAdmins();
    } catch (err) {
      setError(err?.data?.msg || err?.data?.error || err?.message || 'Erreur lors de la soumission.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet administrateur ?')) return;
    try {
      await apiFetch(`/admin/admins/${id}`, { method: 'DELETE', token });
      fetchAdmins();
    } catch (err) {
      setError(err?.data?.msg || err?.data?.error || err?.message || 'Erreur lors de la suppression.');
    }
  };

  // Recherche et pagination
  const filtered = admins.filter(admin =>
    admin.name?.toLowerCase().includes(search.toLowerCase()) ||
    admin.email?.toLowerCase().includes(search.toLowerCase()) ||
    admin.role?.toLowerCase().includes(search.toLowerCase())
  );
  const itemsPerPage = 8;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="max-w-4xl mx-auto w-full animate-fade-in-up">
      <PageHeader
        title="Gestion des administrateurs"
        description="Ajoutez, modifiez ou supprimez les administrateurs."
        icon={Shield}
        gradient="from-blue-700 to-blue-900"
      >
        
      </PageHeader>
      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-2">
        <input
          type="text"
          placeholder="Rechercher un administrateur..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full md:w-72 px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-700 focus:outline-none"
        />
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
      <ModernTable
        headers={["Nom", "Email", "Rôle", "Actions"]}
        loading={loading}
        emptyMessage="Aucun administrateur trouvé."
      >
        {paginated.map(admin => (
          <tr key={admin.id}>
            <td className="px-6 py-4 font-semibold">{admin.name}</td>
            <td className="px-6 py-4">{admin.email}</td>
            <td className="px-6 py-4">{admin.role}</td>
            <td className="px-6 py-4 flex gap-2">
              <button onClick={() => openEdit(admin)} className="text-blue-600 hover:underline"><Edit size={18} /></button>
              <button onClick={() => handleDelete(admin.id)} className="text-red-600 hover:underline"><Trash2 size={18} /></button>
            </td>
          </tr>
        ))}
      </ModernTable>
      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <ModernModal
        isOpen={showModal}
        onClose={closeModal}
        title={isEditing ? 'Modifier l\'administrateur' : 'Ajouter un administrateur'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Nom" className="px-3 py-2 border rounded-lg w-full" required />
          <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" className="px-3 py-2 border rounded-lg w-full" required />
          <input type="text" name="role" value={form.role} onChange={handleChange} placeholder="Rôle" className="px-3 py-2 border rounded-lg w-full" required />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Annuler</button>
            <button type="submit" className="px-4 py-2 bg-blue-700 text-white hover:bg-blue-800 rounded-lg">{isEditing ? 'Enregistrer' : 'Créer'}</button>
          </div>
        </form>
      </ModernModal>
    </div>
  );
};

export default AdminManagement; 