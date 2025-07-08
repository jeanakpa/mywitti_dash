import React, { useEffect, useState } from 'react';
import { FileQuestion, Edit, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/api';
import PageHeader from '../components/common/PageHeader';
import ModernTable from '../components/common/ModernTable';
import ModernModal from '../components/common/ModernModal';

const FAQManagement = () => {
  const { token } = useAuth();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState(null);
  const [form, setForm] = useState({ question: '', answer: '' });

  useEffect(() => { fetchFaqs(); }, [token]);

  const fetchFaqs = async () => {
    setLoading(true); setError('');
    try {
      const data = await apiFetch('/admin/faqs', { token });
      setFaqs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.data?.msg || err?.data?.error || err?.message || 'Erreur lors du chargement.');
    } finally { setLoading(false); }
  };

  const openAdd = () => { setIsEditing(false); setForm({ question: '', answer: '' }); setShowModal(true); };
  const openEdit = (faq) => { setIsEditing(true); setCurrent(faq); setForm({ ...faq }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setCurrent(null); setForm({ question: '', answer: '' }); };

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await apiFetch(`/admin/faqs/${current.id}`, { method: 'PUT', token, body: form });
      } else {
        await apiFetch('/admin/faqs', { method: 'POST', token, body: form });
      }
      closeModal();
      fetchFaqs();
    } catch (err) {
      setError(err?.data?.msg || err?.data?.error || err?.message || 'Erreur lors de la soumission.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette FAQ ?')) return;
    try {
      await apiFetch(`/admin/faqs/${id}`, { method: 'DELETE', token });
      fetchFaqs();
    } catch (err) {
      setError(err?.data?.msg || err?.data?.error || err?.message || 'Erreur lors de la suppression.');
    }
  };

  // Recherche et pagination
  const filtered = faqs.filter(faq =>
    faq.question?.toLowerCase().includes(search.toLowerCase()) ||
    faq.answer?.toLowerCase().includes(search.toLowerCase())
  );
  const itemsPerPage = 8;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="max-w-4xl mx-auto w-full animate-fade-in-up">
      <PageHeader
        title="Gestion des FAQs"
        description="Ajoutez, modifiez ou supprimez les questions fréquentes."
        icon={FileQuestion}
        gradient="from-purple-500 to-indigo-600"
      >
        <button
          onClick={openAdd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold shadow flex items-center gap-2"
        >
          <Plus size={18} /> Ajouter
        </button>
      </PageHeader>
      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-2">
        <input
          type="text"
          placeholder="Rechercher une question..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full md:w-72 px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
      <ModernTable
        headers={["Question", "Réponse", "Actions"]}
        loading={loading}
        emptyMessage="Aucune FAQ trouvée."
      >
        {paginated.map(faq => (
          <tr key={faq.id}>
            <td className="px-6 py-4 font-semibold">{faq.question}</td>
            <td className="px-6 py-4">{faq.answer}</td>
            <td className="px-6 py-4 flex gap-2">
              <button onClick={() => openEdit(faq)} className="text-blue-600 hover:underline"><Edit size={18} /></button>
              <button onClick={() => handleDelete(faq.id)} className="text-red-600 hover:underline"><Trash2 size={18} /></button>
            </td>
          </tr>
        ))}
      </ModernTable>
      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <ModernModal
        isOpen={showModal}
        onClose={closeModal}
        title={isEditing ? 'Modifier la FAQ' : 'Ajouter une FAQ'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="question" value={form.question} onChange={handleChange} placeholder="Question" className="px-3 py-2 border rounded-lg w-full" required />
          <textarea name="answer" value={form.answer} onChange={handleChange} placeholder="Réponse" className="px-3 py-2 border rounded-lg w-full" required rows={4} />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Annuler</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg">{isEditing ? 'Enregistrer' : 'Créer'}</button>
          </div>
        </form>
      </ModernModal>
    </div>
  );
};

export default FAQManagement; 