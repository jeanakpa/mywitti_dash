import React, { useEffect, useState } from 'react';
import { ClipboardList, Edit, Trash2, Plus, Eye, Send, Archive, BarChart3, Users, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/api';
import PageHeader from '../components/common/PageHeader';
import ModernTable from '../components/common/ModernTable';
import ModernModal from '../components/common/ModernModal';
import StatusBadge from '../components/common/StatusBadge';

const SurveyManagement = () => {
  const { token } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showResponsesModal, setShowResponsesModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    questions: [{ id: 1, text: '', type: 'multiple_choice', required: false }]
  });

  // Récupérer tous les sondages
  const fetchSurveys = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/admin/surveys', { token });
      setSurveys(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur lors du chargement des sondages:', err);
      setError(err?.data?.msg || err?.data?.error || err?.message || 'Erreur lors du chargement des sondages.');
      setSurveys([]);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les réponses d'un sondage
  const fetchSurveyResponses = async (surveyId) => {
    try {
      const data = await apiFetch(`/admin/surveys/${surveyId}/responses`, { token });
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Erreur lors du chargement des réponses:', err);
      return [];
    }
  };

  useEffect(() => {
    if (token) {
      fetchSurveys();
    }
  }, [token]);

  const openAdd = () => {
    setIsEditing(false);
    setForm({
      title: '',
      description: '',
      questions: [{ id: 1, text: '', type: 'multiple_choice', required: false }]
    });
    setShowModal(true);
  };

  const openEdit = (survey) => {
    setIsEditing(true);
    setCurrent(survey);
    setForm({
      title: survey.title,
      description: survey.description || '',
      questions: survey.questions || [{ id: 1, text: '', type: 'text', required: false }]
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrent(null);
    setForm({
      title: '',
      description: '',
      questions: [{ id: 1, text: '', type: 'multiple_choice', required: false }]
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...form.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setForm({ ...form, questions: updatedQuestions });
  };

  const addQuestion = () => {
    const newId = Math.max(...form.questions.map(q => q.id), 0) + 1;
    setForm({
      ...form,
      questions: [...form.questions, { id: newId, text: '', type: 'multiple_choice', required: false }]
    });
  };

  const removeQuestion = (index) => {
    if (form.questions.length > 1) {
      const updatedQuestions = form.questions.filter((_, i) => i !== index);
      setForm({ ...form, questions: updatedQuestions });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await apiFetch(`/admin/surveys/${current.id}`, { 
          method: 'PUT', 
          token, 
          body: form 
        });
      } else {
        await apiFetch('/admin/surveys', { 
          method: 'POST', 
          token, 
          body: form 
        });
      }
      closeModal();
      fetchSurveys(); // Recharger la liste
    } catch (err) {
      setError(err?.data?.msg || err?.data?.error || err?.message || 'Erreur lors de la sauvegarde du sondage.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce sondage ? Cette action est irréversible.')) return;
    try {
      await apiFetch(`/admin/surveys/${id}`, { method: 'DELETE', token });
      fetchSurveys(); // Recharger la liste
    } catch (err) {
      setError(err?.data?.msg || err?.data?.error || err?.message || 'Erreur lors de la suppression.');
    }
  };

  // Fonctions de publication temporairement désactivées
  // const handlePublish = async (survey) => { ... };
  // const handleUnpublish = async (survey) => { ... };
  // const handleRepublish = async (survey) => { ... };

  const openResponses = async (survey) => {
    setCurrent(survey);
    try {
      const surveyResponses = await fetchSurveyResponses(survey.id);
      setResponses(surveyResponses);
      setShowResponsesModal(true);
    } catch (err) {
      setError('Erreur lors du chargement des réponses.');
    }
  };

  const closeResponsesModal = () => {
    setShowResponsesModal(false);
    setCurrent(null);
    setResponses([]);
  };

  // Recherche et pagination
  const filtered = surveys.filter(survey =>
    survey.title?.toLowerCase().includes(search.toLowerCase()) ||
    survey.description?.toLowerCase().includes(search.toLowerCase())
  );
  const itemsPerPage = 8;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const formatDate = (dateString) => {
    if (!dateString) return 'Non publié';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSurveyResponses = (surveyId) => {
    return responses.filter(response => response.surveyId === surveyId);
  };

  return (
    <div className="max-w-6xl mx-auto w-full animate-fade-in-up">
      <PageHeader
        title="Gestion des sondages"
        description="Créez, gérez et analysez les sondages envoyés aux clients."
        icon={ClipboardList}
        gradient="from-blue-600 to-purple-600"
      >
        <button
          onClick={openAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow flex items-center gap-2"
        >
          <Plus size={18} /> Créer un sondage
        </button>
      </PageHeader>

      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-2">
        <input
          type="text"
          placeholder="Rechercher un sondage..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full md:w-72 px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

      <ModernTable
        headers={["Titre", "Questions", "Réponses", "Statut", "Date création", "Actions"]}
        loading={loading}
        emptyMessage="Aucun sondage trouvé."
      >
        {paginated.map(survey => (
          <tr key={survey.id}>
            <td className="px-6 py-4">
              <div>
                <div className="font-semibold text-gray-800">{survey.title}</div>
                {survey.description && (
                  <div className="text-sm text-gray-500 mt-1">{survey.description}</div>
                )}
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <ClipboardList size={16} className="text-gray-400" />
                <span>{survey.questions?.length || survey.options?.length || 0} questions</span>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-gray-400" />
                <span>{survey.responses || 0} réponses</span>
              </div>
            </td>
            <td className="px-6 py-4">
              <StatusBadge 
                status="Actif" 
                type="success" 
              />
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <span>{formatDate(survey.created_at)}</span>
              </div>
            </td>

            <td className="px-6 py-4">
              <div className="flex gap-2">
                <button 
                  onClick={() => openResponses(survey)} 
                  className="text-blue-600 hover:underline" 
                  title="Voir les réponses"
                >
                  <Eye size={18} />
                </button>
                <button 
                  onClick={() => openEdit(survey)} 
                  className="text-green-600 hover:underline" 
                  title="Modifier"
                >
                  <Edit size={18} />
                </button>
                {/* Actions de publication temporairement désactivées */}
                <button 
                  className="text-gray-400 cursor-not-allowed" 
                  title="Publication temporairement désactivée"
                  disabled
                >
                  <Send size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(survey.id)} 
                  className="text-red-600 hover:underline" 
                  title="Supprimer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
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

      {/* Modal pour créer/modifier un sondage */}
      <ModernModal
        isOpen={showModal}
        onClose={closeModal}
        title={isEditing ? 'Modifier le sondage' : 'Créer un nouveau sondage'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Titre du sondage"
            className="px-3 py-2 border rounded-lg w-full"
            required
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description (optionnelle)"
            className="px-3 py-2 border rounded-lg w-full"
            rows={3}
          />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-700">Questions</h4>
              <button
                type="button"
                onClick={addQuestion}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
              >
                <Plus size={14} /> Ajouter une question
              </button>
            </div>
            
            {form.questions.map((question, index) => (
              <div key={question.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Question {index + 1}</span>
                  {form.questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={question.text}
                  onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                  placeholder="Texte de la question"
                  className="px-3 py-2 border rounded-lg w-full"
                  required
                />
                <div className="flex gap-4">
                  <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                    Type: Choix multiple (fixe)
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(e) => handleQuestionChange(index, 'required', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Obligatoire</span>
                  </label>
                </div>
              </div>
            ))}
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

      {/* Modal pour voir les réponses */}
      <ModernModal
        isOpen={showResponsesModal}
        onClose={closeResponsesModal}
        title={`Réponses - ${current?.title}`}
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {current && (
            <>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Informations du sondage</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Questions:</span> {current.questions?.length || 0}
                  </div>
                  <div>
                    <span className="font-medium">Réponses:</span> {current.responses || 0}
                  </div>
                  <div>
                    <span className="font-medium">Statut:</span> 
                    <StatusBadge 
                      status="Actif" 
                      type="success" 
                    />
                  </div>
                  <div>
                    <span className="font-medium">Créé le:</span> {formatDate(current.createdAt)}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Questions et réponses</h4>
                {current.questions?.map((question, qIndex) => (
                  <div key={question.id} className="border rounded-lg p-3">
                    <h5 className="font-medium mb-2">
                      Question {qIndex + 1}: {question.text}
                    </h5>
                    <div className="text-sm text-gray-600 mb-2">
                      Type: {question.type} | Obligatoire: {question.required ? 'Oui' : 'Non'}
                    </div>
                    <div className="bg-gray-50 p-2 rounded text-sm">
                      <span className="font-medium">Réponses:</span> 
                      {getSurveyResponses(current.id).length > 0 ? (
                        <div className="mt-1 space-y-1">
                          {getSurveyResponses(current.id).map((response, rIndex) => (
                            <div key={rIndex} className="text-gray-700">
                              • {response.answers?.[qIndex] || 'Aucune réponse'}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 ml-2">Aucune réponse reçue</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </ModernModal>
    </div>
  );
};

export default SurveyManagement; 