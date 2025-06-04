import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const SurveyResponses = () => {
  const { id } = useParams();
  const [responses, setResponses] = useState([]);
  const [survey, setSurvey] = useState(null);
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
        setSurvey(data);
        return fetch(`http://localhost:5000/admin/surveys/${id}/responses`);
      })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Erreur HTTP: ${res.status} - ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        setResponses(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des réponses:', error);
        setError(`Erreur: ${error.message}`);
        setLoading(false);
      });
  }, [id]);

  const downloadCSV = () => {
    const headers = ['Réponse, Utilisateur, Date de réponse'];
    const rows = responses.map(response => [
      response.response_text,
      response.user_id || 'Anonyme',
      new Date(response.created_at).toLocaleString()
    ].join(','));
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `survey_${id}_responses.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <div className="p-6 text-center">Chargement...</div>;
  if (error) return (
    <div className="p-6 text-center text-red-500">
      {error}
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Link to="/admin/surveys" className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-[#fbc603]">
          Réponses au sondage : {survey?.title}
        </h1>
        <button
          onClick={downloadCSV}
          className="ml-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Télécharger CSV
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Question : {survey?.question}
        </h2>

        {responses.length === 0 ? (
          <p className="text-gray-500">Aucune réponse pour ce sondage pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Réponse
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date de réponse
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {responses.map(response => (
                  <tr key={response.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{response.response_text}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{response.user_id || 'Anonyme'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(response.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyResponses;