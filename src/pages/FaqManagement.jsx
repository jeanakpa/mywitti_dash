import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';
import axios from 'axios';

const FaqManagement = () => {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true);
        setError(null);

        // Vérifier si l'utilisateur est connecté
        const admin = JSON.parse(localStorage.getItem('admin'));
        console.log('localStorage.admin:', admin);
        if (!admin || !admin.token) {
          setError('Aucune session active. Veuillez vous connecter.');
          navigate('/login');
          return;
        }

        // Requête pour récupérer les FAQs
        const response = await axios.get('http://localhost:5000/admin/faqs', {
          headers: {
            Authorization: `Bearer ${admin.token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Réponse de l\'API:', response.data);
        if (Array.isArray(response.data)) {
          setFaqs(response.data);
        } else {
          setFaqs([]);
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
            localStorage.removeItem('admin');
            navigate('/login');
          } else if (err.response.status === 404) {
            setError('Endpoint non trouvé (404). Vérifiez l\'URL de l\'API.');
          } else if (err.response.status === 401) {
            setError('Non autorisé (401). Le jeton est invalide ou expiré. Reconnectez-vous.');
            localStorage.removeItem('admin');
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
    fetchFaqs();
  }, [navigate]);

  const deleteFaq = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette FAQ ?')) {
      try {
        const admin = JSON.parse(localStorage.getItem('admin'));
        if (!admin || !admin.token) {
          setError('Session expirée. Veuillez vous reconnecter.');
          navigate('/login');
          return;
        }
        console.log('Tentative de suppression de la FAQ avec ID:', id);
        const response = await axios.delete(`http://localhost:5000/admin/faqs/${id}`, {
          headers: {
            Authorization: `Bearer ${admin.token}`,
            'Content-Type': 'application/json',
          },
        });
        console.log('Réponse de suppression:', response.data);
        setFaqs(faqs.filter(f => f.id !== id));
      } catch (err) {
        console.error('Erreur complète lors de la suppression:', err);
        if (err.response) {
          if (err.response.status === 403) {
            setError('Accès interdit (403). Seuls les super admins peuvent supprimer des FAQs.');
            localStorage.removeItem('admin');
            navigate('/login');
          } else if (err.response.status === 401) {
            setError('Non autorisé (401). Le jeton est invalide ou expiré. Reconnectez-vous.');
            localStorage.removeItem('admin');
            navigate('/login');
          } else if (err.response.status === 404) {
            setError('FAQ non trouvée (404).');
          } else {
            setError(`Erreur ${err.response.status}: ${err.response.data?.message || 'Erreur inconnue.'}`);
          }
        } else {
          setError(`Erreur: ${err.message}. Vérifiez le serveur ou reconnectez-vous.`);
        }
      }
    }
  };

  const createFaq = () => navigate('/faqs/create');
  const editFaq = (id) => navigate(`/faqs/edit/${id}`);

  if (loading) return <div className="p-6 text-center">Chargement...</div>;
  if (error) return (
    <div className="p-6 text-center text-red-500">
      {error}
      <Link to="/login" className="ml-2 text-indigo-600 hover:text-indigo-900">Se connecter</Link>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#fbc603]">Gestion des FAQs</h1>
        <button onClick={createFaq} className="px-4 py-2 bg-[#6877c0] text-white rounded-lg hover:bg-[#9ea5c5] flex items-center">
          <Plus size={18} className="mr-2" /> Créer une FAQ
        </button>
      </div>

      {faqs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">Aucune FAQ créée pour le moment.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Question</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Réponse</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {faqs.map(faq => (
                <tr key={faq.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{faq.question}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{faq.answer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-3">
                    <button onClick={() => editFaq(faq.id)} className="text-blue-600 hover:text-blue-900">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => deleteFaq(faq.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FaqManagement;