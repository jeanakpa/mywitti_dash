import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/api';
import PageHeader from '../components/common/PageHeader';
import ModernTable from '../components/common/ModernTable';
import ModernModal from '../components/common/ModernModal';
import StatusBadge from '../components/common/StatusBadge';

const UserManagement = () => {
  const { token } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState(null);
  const [form, setForm] = useState({
    customer_code: '', short_name: '', first_name: '', gender: '', birth_date: '', phone_number: '', street: '', 
    jetons: '', category_name: '', user_email: '', numero_compte: '', agence: '', pays_agence: '', 
    date_ouverture_compte: '', working_balance: '', libelle_compte: '', date_ouverture_client: '', nombre_jours: ''
  });

  useEffect(() => { fetchClients(); }, [token]);

  const fetchClients = async () => {
    setLoading(true); setError('');
    try {
      const data = await apiFetch('/admin/customers', { token });
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.data?.msg || err?.data?.error || err?.message || 'Erreur lors du chargement.');
    } finally { setLoading(false); }
  };

  const openAdd = () => { /* Désactivé car création interdite */ };
  const openEdit = (client) => { setIsEditing(true); setCurrent(client); setForm({ ...client }); setShowModal(true); };
  const closeModal = () => { 
    setShowModal(false); 
    setCurrent(null); 
    setForm({ 
      customer_code: '', short_name: '', first_name: '', gender: '', birth_date: '', phone_number: '', street: '', 
      jetons: '', category_name: '', user_email: '', numero_compte: '', agence: '', pays_agence: '', 
      date_ouverture_compte: '', working_balance: '', libelle_compte: '', date_ouverture_client: '', nombre_jours: '' 
    }); 
  };

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await apiFetch('/admin/customers', { method: 'PUT', token, body: { ...form, id: current.id } });
      } else {
        await apiFetch('/admin/customers', { method: 'POST', token, body: form });
      }
      closeModal();
      fetchClients();
    } catch (err) {
      setError(err?.data?.msg || err?.data?.error || err?.message || 'Erreur lors de la soumission.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce client ?')) return;
    try {
      await apiFetch(`/admin/customers/${id}`, { method: 'DELETE', token });
      fetchClients();
    } catch (err) {
      setError(err?.data?.msg || err?.data?.error || err?.message || 'Erreur lors de la suppression.');
    }
  };

  // Recherche et pagination
  const filtered = clients.filter(c =>
    c.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.short_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.user_email?.toLowerCase().includes(search.toLowerCase()) ||
    c.customer_code?.toLowerCase().includes(search.toLowerCase()) ||
    c.numero_compte?.toLowerCase().includes(search.toLowerCase()) ||
    c.pays_agence?.toLowerCase().includes(search.toLowerCase()) ||
    c.agence?.toLowerCase().includes(search.toLowerCase()) ||
    c.category_name?.toLowerCase().includes(search.toLowerCase())
  );
  const itemsPerPage = 8;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto w-full animate-fade-in-up">
      <PageHeader
        title="Gestion des clients"
        description="Ajoutez, modifiez ou supprimez les clients de la plateforme."
        icon={Users}
        gradient="from-gray-700 to-gray-900"
      >
        {/* Bouton d'ajout retiré */}
      </PageHeader>
      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-2">
        <input
          type="text"
          placeholder="Rechercher par nom, code, email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full md:w-72 px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
      <ModernTable
        headers={["Code", "Nom", "Email", "Catégorie", "Jetons", "N° Compte", "Agence", "Solde", "Actions"]}
        loading={loading}
        emptyMessage="Aucun client trouvé."
      >
        {paginated.map(client => (
          <tr key={client.id}>
            <td className="px-6 py-4 font-semibold">{client.customer_code}</td>
            <td className="px-6 py-4">{client.short_name} {client.first_name}</td>
            <td className="px-6 py-4">{client.user_email}</td>
            <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{client.category_name}</span></td>
            <td className="px-6 py-4 font-semibold text-green-600">{client.jetons}</td>
            <td className="px-6 py-4">{client.numero_compte}</td>
            <td className="px-6 py-4">{client.agence}</td>
            <td className="px-6 py-4 font-semibold">{client.working_balance?.toLocaleString()} FCFA</td>
            <td className="px-6 py-4 flex gap-2">
              <button onClick={() => openEdit(client)} className="text-blue-600 hover:underline"><Edit size={18} /></button>
              <button onClick={() => handleDelete(client.id)} className="text-red-600 hover:underline"><Trash2 size={18} /></button>
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
        title={isEditing ? 'Modifier le client' : 'Ajouter un client'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <input type="text" name="customer_code" value={form.customer_code} onChange={handleChange} placeholder="Code client" className="px-3 py-2 border rounded-lg w-full" required />
            <input type="text" name="short_name" value={form.short_name} onChange={handleChange} placeholder="Nom court" className="px-3 py-2 border rounded-lg w-full" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" name="first_name" value={form.first_name} onChange={handleChange} placeholder="Prénom" className="px-3 py-2 border rounded-lg w-full" required />
            <input type="text" name="gender" value={form.gender} onChange={handleChange} placeholder="Genre (M/F)" className="px-3 py-2 border rounded-lg w-full" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="date" name="birth_date" value={form.birth_date} onChange={handleChange} placeholder="Date de naissance" className="px-3 py-2 border rounded-lg w-full" required />
            <input type="text" name="phone_number" value={form.phone_number} onChange={handleChange} placeholder="Téléphone" className="px-3 py-2 border rounded-lg w-full" required />
          </div>
          <input type="text" name="street" value={form.street} onChange={handleChange} placeholder="Adresse" className="px-3 py-2 border rounded-lg w-full" required />
          <div className="grid grid-cols-2 gap-4">
            <input type="email" name="user_email" value={form.user_email} onChange={handleChange} placeholder="Email" className="px-3 py-2 border rounded-lg w-full" />
            <input type="text" name="category_name" value={form.category_name} onChange={handleChange} placeholder="Catégorie" className="px-3 py-2 border rounded-lg w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="number" name="jetons" value={form.jetons} onChange={handleChange} placeholder="Jetons" className="px-3 py-2 border rounded-lg w-full" />
            <input type="text" name="numero_compte" value={form.numero_compte} onChange={handleChange} placeholder="Numéro de compte" className="px-3 py-2 border rounded-lg w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" name="agence" value={form.agence} onChange={handleChange} placeholder="Agence" className="px-3 py-2 border rounded-lg w-full" />
            <input type="text" name="pays_agence" value={form.pays_agence} onChange={handleChange} placeholder="Pays de l'agence" className="px-3 py-2 border rounded-lg w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="date" name="date_ouverture_compte" value={form.date_ouverture_compte} onChange={handleChange} placeholder="Date ouverture compte" className="px-3 py-2 border rounded-lg w-full" />
            <input type="date" name="date_ouverture_client" value={form.date_ouverture_client} onChange={handleChange} placeholder="Date ouverture client" className="px-3 py-2 border rounded-lg w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="number" name="working_balance" value={form.working_balance} onChange={handleChange} placeholder="Solde de travail" className="px-3 py-2 border rounded-lg w-full" />
            <input type="text" name="libelle_compte" value={form.libelle_compte} onChange={handleChange} placeholder="Libellé du compte" className="px-3 py-2 border rounded-lg w-full" />
          </div>
          <input type="number" name="nombre_jours" value={form.nombre_jours} onChange={handleChange} placeholder="Nombre de jours" className="px-3 py-2 border rounded-lg w-full" />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Annuler</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg">Enregistrer</button>
          </div>
        </form>
      </ModernModal>
    </div>
  );
};

export default UserManagement; 