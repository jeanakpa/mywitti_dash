import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const FaqEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [faq, setFaq] = useState({ question: '', answer: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaq = async () => {
      try {
        setLoading(true);
        const admin = JSON.parse(localStorage.getItem('admin'));
        if (!admin || !admin.token) {
          setError('Session expirée. Veuillez vous reconnecter.');
          navigate('/login');
          return;
        }
        console.log('Récupération de la FAQ avec ID:', id);
        const response = await axios.get(`http://localhost:5000/admin/faqs/${id}`, {
          headers: {
            Authorization: `Bearer ${admin.token}`,
            'Content-Type': 'application/json',
          },
        });
        console.log('FAQ récupérée:', response.data);
        setFaq(response.data);
      } catch (err) {
        console.error('Erreur lors de la récupération:', err);
        if (err.response) {
          if (err.response.status === 403) {
            setError('Accès interdit (403). Vérifiez vos permissions (is_admin ou is_superuser) ou reconnectez-vous.');
            localStorage.removeItem('admin');
            navigate('/login');
          } else if (err.response.status === 404) {
            setError('FAQ non trouvée (404).');
          } else if (err.response.status === 401) {
            setError('Non autorisé (401). Le jeton est invalide ou expiré. Reconnectez-vous.');
            localStorage.removeItem('admin');
            navigate('/login');
          } else {
            setError(`Erreur ${err.response.status}: ${err.response.data?.message || 'Erreur inconnue.'}`);
          }
        } else {
          setError(`Erreur: ${err.message}. Vérifiez le serveur ou vos permissions.`);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchFaq();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const admin = JSON.parse(localStorage.getItem('admin'));
      if (!admin || !admin.token) {
        setError('Session expirée. Veuillez vous reconnecter.');
        navigate('/login');
        return;
      }
      console.log('Envoi de la requête PUT pour modifier la FAQ:', faq);
      const response = await axios.put(`http://localhost:5000/admin/faqs/${id}`, faq, {
        headers: {
          Authorization: `Bearer ${admin.token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Réponse de modification:', response.data);
      navigate('/faqs');
    } catch (err) {
      console.error('Erreur lors de la modification:', err);
      if (err.response) {
        if (err.response.status === 403) {
          setError('Accès interdit (403). Seuls les super admins peuvent modifier des FAQs.');
          localStorage.removeItem('admin');
          navigate('/login');
        } else if (err.response.status === 401) {
          setError('Non autorisé (401). Le jeton est invalide ou expiré. Reconnectez-vous.');
          localStorage.removeItem('admin');
          navigate('/login');
        } else if (err.response.status === 404) {
          setError('FAQ non trouvée (404).');
        } else {
          setError(`Erreur ${err.response.status}: ${err.response.data?.message || 'Échec de la modification.'}`);
        }
      } else {
        setError(`Erreur: ${err.message}. Vérifiez le serveur ou vos permissions.`);
      }
    }
  };

  if (loading) return <div className="p-6 text-center">Chargement...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#fbc603] mb-6">Modifier une FAQ</h1>
      {error && <div className="p-4 text-center text-red-500 bg-red-100 rounded-lg mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">Question</label>
          <input
            type="text"
            value={faq.question || ''} // Ajout d'une valeur par défaut pour éviter les erreurs
            onChange={(e) => setFaq({ ...faq, question: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Réponse</label>
          <textarea
            value={faq.answer || ''} // Ajout d'une valeur par défaut pour éviter les erreurs
            onChange={(e) => setFaq({ ...faq, answer: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-[#6877c0] text-white rounded-lg hover:bg-[#9ea5c5]">
          Sauvegarder
        </button>
      </form>
    </div>
  );
};

export default FaqEdit;