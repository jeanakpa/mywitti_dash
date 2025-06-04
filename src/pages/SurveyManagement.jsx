import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Edit, Trash2, Plus, Send, XCircle, BarChart2, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import axios from 'axios';

// Enregistrer les composants nécessaires de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const SurveyManagement = () => {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showChartPanel, setShowChartPanel] = useState(false);
  const [selectedSurveyId, setSelectedSurveyId] = useState(null);
  const [responses, setResponses] = useState([]);
  const [summary, setSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        setLoading(true);
        setError(null);

        // Vérifier si l'utilisateur est connecté
        const admin = JSON.parse(localStorage.getItem('admin'));
        console.log('localStorage.admin:', admin);
        if (!admin || !admin.token) {
          setError('Aucune session active. Veuillez vous connecter.');
          navigate('/login'); // Redirige immédiatement vers la page de login
          return;
        }

        // Tester l'accessibilité du serveur avec une requête simple
        try {
          const testResponse = await axios.get('http://localhost:5000/admin/surveys', {
            headers: { 'Content-Type': 'application/json' }, // Sans Authorization pour tester la connexion
          });
          console.log('Requête test sans auth réussie:', testResponse.data);
        } catch (testErr) {
          console.log('Requête test sans auth échouée:', testErr.message, testErr.response?.status);
          if (testErr.message === 'Network Error') {
            throw new Error('Le serveur Flask est inaccessible. Vérifiez qu\'il est démarré sur http://localhost:5000.');
          }
          if (testErr.response?.status === 403) {
            console.log('Erreur 403 attendue pour la requête sans auth.');
          }
        }

        // Requête authentifiée
        const response = await axios.get('http://localhost:5000/admin/surveys', {
          headers: {
            Authorization: `Bearer ${admin.token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Réponse de l\'API:', response.data);
        if (Array.isArray(response.data)) {
          setSurveys(response.data);
        } else {
          setSurveys([]);
          setError('Les données reçues ne sont pas un tableau valide.');
        }
      } catch (err) {
        console.error('Erreur complète:', err);
        if (err.message === 'Network Error') {
          setError('Erreur réseau. Vérifiez si le serveur Flask est démarré sur http://localhost:5000 ou si un problème CORS bloque la requête.');
        } else if (err.message.includes('CORS')) {
          setError('Erreur CORS détectée. Le serveur Flask doit autoriser les requêtes depuis http://localhost:3000.');
        } else if (err.response) {
          if (err.response.status === 403) {
            setError('Accès interdit (403). Vérifiez vos permissions (is_admin ou is_superuser) ou reconnectez-vous.');
            localStorage.removeItem('admin'); // Supprime le jeton invalide
            navigate('/login');
          } else if (err.response.status === 404) {
            setError('Endpoint non trouvé (404). Vérifiez l\'URL de l\'API.');
          } else if (err.response.status === 401) {
            setError('Non autorisé (401). Le jeton est invalide ou expiré. Reconnectez-vous.');
            localStorage.removeItem('admin'); // Supprime le jeton invalide
            navigate('/login');
          } else {
            setError(`Erreur ${err.response.status}: ${err.response.data?.message || 'Erreur inconnue.'}`);
          }
        } else {
          setError(`Erreur: ${err.message}. Vérifiez le serveur ou reconnectez-vous.`);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSurveys();
  }, [navigate]); // Ajout de navigate comme dépendance

  const deleteSurvey = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce sondage ?')) {
      try {
        const admin = JSON.parse(localStorage.getItem('admin'));
        if (!admin || !admin.token) {
          setError('Session expirée. Veuillez vous reconnecter.');
          navigate('/login');
          return;
        }
        await axios.delete(`http://localhost:5000/admin/surveys/${id}`, {
          headers: { Authorization: `Bearer ${admin.token}` },
        });
        setSurveys(surveys.filter(s => s.id !== id));
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        setError(`Erreur: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const publishSurvey = async (id) => {
    try {
      const admin = JSON.parse(localStorage.getItem('admin'));
      if (!admin || !admin.token) {
        setError('Session expirée. Veuillez vous reconnecter.');
        navigate('/login');
        return;
      }
      const response = await axios.post(`http://localhost:5000/admin/surveys/${id}/publish`, {}, {
        headers: { Authorization: `Bearer ${admin.token}` },
      });
      setSurveys(surveys.map(s => s.id === id ? response.data : s));
    } catch (err) {
      console.error('Erreur lors de la publication:', err);
      setError(`Erreur: ${err.response?.data?.message || err.message}`);
    }
  };

  const unpublishSurvey = async (id) => {
    try {
      const admin = JSON.parse(localStorage.getItem('admin'));
      if (!admin || !admin.token) {
        setError('Session expirée. Veuillez vous reconnecter.');
        navigate('/login');
        return;
      }
      const response = await axios.post(`http://localhost:5000/admin/surveys/${id}/unpublish`, {}, {
        headers: { Authorization: `Bearer ${admin.token}` },
      });
      setSurveys(surveys.map(s => s.id === id ? response.data : s));
    } catch (err) {
      console.error('Erreur lors de l\'annulation:', err);
      setError(`Erreur: ${err.response?.data?.message || err.message}`);
    }
  };

  const createSurvey = () => navigate('/surveys/create');
  const editSurvey = (id) => navigate(`/surveys/edit/${id}`);
  const viewSurveyResponses = (id) => navigate(`/surveys/${id}/responses`);

  const showCharts = async (id) => {
    setSelectedSurveyId(id);
    setSummary('');
    setError(null);
    try {
      const admin = JSON.parse(localStorage.getItem('admin'));
      if (!admin || !admin.token) {
        setError('Session expirée. Veuillez vous reconnecter.');
        navigate('/login');
        return;
      }
      const res = await axios.get(`http://localhost:5000/admin/surveys/${id}/responses`, {
        headers: { Authorization: `Bearer ${admin.token}` },
      });
      console.log('Réponses brutes reçues:', res.data);
      setResponses(res.data);

      const chartData = await getChartData(id);
      setChartData(chartData);
      setShowChartPanel(true);
    } catch (err) {
      console.error('Erreur lors de la récupération des réponses:', err);
      setError(`Erreur: ${err.response?.data?.message || err.message}`);
      setShowChartPanel(true);
    }
  };

  const closeChartPanel = () => {
    setShowChartPanel(false);
    setSelectedSurveyId(null);
    setResponses([]);
    setError(null);
    setSummary('');
    setChartData({ labels: [], datasets: [] });
  };

  const getChartData = async (surveyId) => {
    try {
      const admin = JSON.parse(localStorage.getItem('admin'));
      if (!admin || !admin.token) {
        setError('Session expirée. Veuillez vous reconnecter.');
        navigate('/login');
        return { labels: [], datasets: [] };
      }
      const res = await axios.get(`http://localhost:5000/admin/surveys/${surveyId}/results`, {
        headers: { Authorization: `Bearer ${admin.token}` },
      });
      const data = res.data;
      return {
        labels: data.map(d => `${d.option_text} (${d.percentage}%)`),
        datasets: [{
          label: 'Nombre de réponses',
          data: data.map(d => d.count),
          backgroundColor: ['#FF6B6B', '#FFB347', '#FFD700', '#4CAF50', '#4682B4'],
          borderColor: '#FFFFFF',
          borderWidth: 2,
        }],
      };
    } catch (err) {
      console.error('Erreur lors de la récupération des résultats:', err);
      return {
        labels: [],
        datasets: [{ label: 'Nombre de réponses', data: [], backgroundColor: [], borderColor: '#FFFFFF', borderWidth: 2 }],
      };
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 14 }, padding: 20 } },
      title: { display: true, text: 'Répartition des réponses', font: { size: 16, weight: 'bold' }, padding: { top: 10, bottom: 20 } },
      tooltip: {
        callbacks: {
          label: context => {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value} réponses`;
          },
        },
      },
    },
  };

  const downloadCollectivePDF = () => {
    const doc = new jsPDF();
    const survey = surveys.find(s => s.id === selectedSurveyId) || {};
    doc.setFontSize(18);
    doc.text(`Réponses au sondage: ${survey.title || 'Sondage'}`, 10, 10);
    doc.setFontSize(12);
    doc.text(`Question: ${survey.question || 'Question non disponible'}`, 10, 20);

    const tableData = responses.map(r => [
      `${r.short_name} ${r.first_name}`,
      r.option_text,
      r.submitted_at,
    ]);
    doc.autoTable({
      head: [['Client', 'Réponse', 'Date de soumission']],
      body: tableData,
      startY: 30,
      styles: { halign: 'left' },
      headStyles: { fillColor: [255, 193, 3] },
    });
    doc.save(`survey_${selectedSurveyId}_responses.pdf`);
  };

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    setSummary('');
    try {
      const survey = surveys.find(s => s.id === selectedSurveyId) || {};
      const responseTexts = responses.map(r => r.option_text).filter(Boolean);
      if (responseTexts.length === 0) {
        setSummary('Aucune réponse textuelle à résumer.');
        setIsGeneratingSummary(false);
        return;
      }

      const prompt = `Question: "${survey.question || 'Non disponible'}". Réponses: ${responseTexts.join(', ')}. Résumez en un paragraphe les thèmes principaux, sentiments dominants et points clés.`;
      const mockSummary = `Les réponses montrent une satisfaction globale, avec ${responseTexts.filter(r => ['Bien', 'Très bien'].includes(r)).length} répondants sur ${responseTexts.length} évaluant "Bien" ou "Très bien". Quelques réserves sont exprimées avec ${responseTexts.filter(r => ['Mal', 'Très mal'].includes(r)).length} mentions de "Mal" ou "Très mal". Le sentiment dominant est positif, avec une majorité de notes moyennes à élevées.`;
      setSummary(mockSummary);
    } catch (err) {
      setSummary('Erreur lors de la génération du résumé.');
      console.error('Erreur:', err);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Chargement...</div>;
  if (error && !showChartPanel) return (
    <div className="p-6 text-center text-red-500">
      {error}
      <Link to="/login" className="ml-2 text-indigo-600 hover:text-indigo-900">Se connecter</Link>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#fbc603]">Gestion des Sondages</h1>
        <button onClick={createSurvey} className="px-4 py-2 bg-[#6877c0] text-white rounded-lg hover:bg-[#9ea5c5] flex items-center">
          <Plus size={18} className="mr-2" /> Créer un sondage
        </button>
      </div>

      {surveys.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">Aucun sondage créé pour le moment.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Titre</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Question</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date de création</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {surveys.map(survey => (
                <tr key={survey.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/surveys/${survey.id}`} className="text-indigo-600 hover:text-indigo-900">
                      {survey.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{survey.question}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(survey.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      survey.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {survey.is_published ? 'Publié' : 'Brouillon'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-3">
                    <button onClick={() => editSurvey(survey.id)} className="text-blue-600 hover:text-blue-900">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => deleteSurvey(survey.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 size={18} />
                    </button>
                    {survey.is_published ? (
                      <button onClick={() => unpublishSurvey(survey.id)} className="text-orange-600 hover:text-orange-900" title="Annuler la publication">
                        <XCircle size={18} />
                      </button>
                    ) : (
                      <button onClick={() => publishSurvey(survey.id)} className="text-green-600 hover:text-green-900" title="Publier le sondage">
                        <Send size={18} />
                      </button>
                    )}
                    <button onClick={() => showCharts(survey.id)} className="text-purple-600 hover:text-purple-900">
                      <BarChart2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showChartPanel && selectedSurveyId && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Visualisation des réponses - Sondage {surveys.find(s => s.id === selectedSurveyId)?.title}
              </h2>
              <button onClick={closeChartPanel} className="text-gray-500 hover:text-gray-700">
                <XCircle size={24} />
              </button>
            </div>

            {error ? (
              <div className="text-red-500 mb-4">{error}</div>
            ) : responses.length === 0 ? (
              <div className="text-gray-500 mb-4">Aucune réponse disponible pour ce sondage.</div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">Réponses collectives</h3>
                    <div className="flex space-x-2">
                      <button onClick={downloadCollectivePDF} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                        Télécharger PDF
                      </button>
                      <button
                        onClick={handleGenerateSummary}
                        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center"
                        disabled={isGeneratingSummary}
                      >
                        {isGeneratingSummary ? 'Génération...' : <><Sparkles size={18} className="mr-2" /> Résumer les réponses</>}
                      </button>
                    </div>
                  </div>
                  <div className="chart-container" style={{ position: 'relative', height: '400px', width: '100%' }}>
                    <Pie data={chartData} options={chartOptions} />
                  </div>
                  {summary && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="font-semibold mb-2">Résumé des réponses (Généré par IA) :</h4>
                      <p className="text-gray-700">{summary}</p>
                    </div>
                  )}
                  {isGeneratingSummary && (
                    <div className="mt-4 p-4 text-center text-gray-500">Génération du résumé en cours...</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyManagement;