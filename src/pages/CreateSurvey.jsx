import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const CreateSurvey = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [question, setQuestion] = useState('');
  const [deadline, setDeadline] = useState(1);
  const [error, setError] = useState(null);

  const handleSaveSurvey = (e) => {
    e.preventDefault();
    if (!title.trim() || !question.trim()) {
      alert('Veuillez saisir un titre et une question.');
      return;
    }

    const newSurvey = {
      title,
      description,
      question,
      deadline: new Date(Date.now() + deadline * 24 * 60 * 60 * 1000).toISOString()
    };

    fetch('http://localhost:5000/admin/surveys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSurvey)
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
        console.log('Sondage créé:', data);
        alert('Sondage créé avec succès !');
        navigate('/admin/surveys');
      })
      .catch(error => {
        console.error('Erreur lors de la création:', error);
        setError(`Erreur: ${error.message}. Vérifiez si le serveur est en marche sur http://localhost:5000.`);
      });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <Link to="/admin/surveys" className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-[#fbc603]">Créer un nouveau sondage</h1>
      </div>

      <form onSubmit={handleSaveSurvey} className="bg-white rounded-lg shadow-md p-6 space-y-6">
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
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSurvey;