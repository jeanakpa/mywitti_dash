import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FaqCreate = () => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(null);

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
      console.log('Envoi de la requête POST pour créer une FAQ:', { question, answer });
      const response = await axios.post('http://localhost:5000/admin/faqs', { question, answer }, {
        headers: {
          Authorization: `Bearer ${admin.token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Réponse de création:', response.data);
      navigate('/faqs');
    } catch (err) {
      console.error('Erreur lors de la création:', err);
      if (err.response) {
        if (err.response.status === 403) {
          setError('Accès interdit (403). Seuls les super admins peuvent créer des FAQs.');
          localStorage.removeItem('admin');
          navigate('/login');
        } else if (err.response.status === 401) {
          setError('Non autorisé (401). Le jeton est invalide ou expiré. Reconnectez-vous.');
          localStorage.removeItem('admin');
          navigate('/login');
        } else {
          setError(`Erreur ${err.response.status}: ${err.response.data?.message || 'Échec de la création.'}`);
        }
      } else {
        setError(`Erreur: ${err.message}. Vérifiez le serveur ou vos permissions.`);
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#fbc603] mb-6">Créer une FAQ</h1>
      {error && <div className="p-4 text-center text-red-500 bg-red-100 rounded-lg mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">Question</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Réponse</label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-[#6877c0] text-white rounded-lg hover:bg-[#9ea5c5]">
          Créer
        </button>
      </form>
    </div>
  );
};

export default FaqCreate;