import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const EditSurvey = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [question, setQuestion] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/admin/surveys/${id}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Erreur HTTP: ${res.status} - ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        setTitle(data.title);
        setDescription(data.description || '');
        setQuestion(data.question);
        setDeadline(data.deadline ? Math.ceil((new Date(data.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : 1);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erreur lors de la récupération du sondage:', error);
        setError(`Erreur: ${error.message}`);
        setLoading(false);
      });
  }, [id]);

  const handleUpdateSurvey = (e) => {
    e.preventDefault();
    if (!title.trim() || !question.trim()) {
      alert('Veuillez saisir un titre et une question.');
      return;
    }

    const updatedSurvey = {
      title,
      description,
      question,
      deadline: new Date(Date.now() + deadline * 24 * 60 * 60 * 1000).toISOString()
    };

    fetch(`http://localhost:5000/admin/surveys/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedSurvey)
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => {
            throw new Error(`Erreur HTTP: ${res.status} - ${err.error || res.statusText}`);
          });
        }
        return res.json();
      })
      .then(data => {
        console.log('Sondage mis à jour:', data);
        alert('Sondage mis à jour avec succès !');
        navigate('/admin/surveys');
      })
      .catch(error => {
        console.error('Erreur lors de la mise à jour:', error);
        setError(`Erreur: ${error.message}`);
      });
  };

  if (loading) return <div className="p-6 text-center">Chargement...</div>;
  if (error) return (
    <div className="p-6 text-center text-red-500">
      {error}
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <Link to="/admin/surveys" className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-[#fbc603]">Modifier le sondage</h1>
      </div>

      <form onSubmit={handleUpdateSurvey} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Titre du sondage *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ex: Satisfaction client"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Décrivez brièvement l'objectif..."
          />
        </div>

        <div>
          <label htmlFor="question" className="block text-sm font-medium text-gray-700">
            Question *
          </label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Posez votre question ici..."
            required
          />
        </div>

        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
            Durée (en jours) *
          </label>
          <input
            type="number"
            id="deadline"
            value={deadline}
            onChange={(e) => setDeadline(Math.max(1, e.target.value))}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            min="1"
            required
          />
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-[#6877c0] text-white rounded-lg hover:bg-[#9ea5c5]"
            disabled={!title.trim() || !question.trim()}
          >
            Mettre à jour
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditSurvey;