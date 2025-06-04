import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, BarChart2 } from 'lucide-react';

const SurveyDetails = () => {
  const { id } = useParams();
  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('collective');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`http://localhost:5000/admin/surveys/${id}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
      fetch(`http://localhost:5000/admin/surveys/${id}/responses`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
    ])
      .then(([surveyRes, responsesRes]) => Promise.all([surveyRes.json(), responsesRes.json()]))
      .then(([surveyData, responsesData]) => {
        setSurvey(surveyData);
        setResponses(responsesData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des données:', error);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-6 text-center">Chargement...</div>;
  if (!survey) return <div className="p-6 text-red-500">Sondage non trouvé</div>;

  const voteSummary = responses.reduce((acc, resp) => {
    acc[resp.response] = (acc[resp.response] || 0) + 1;
    return acc;
  }, { '1-Mal': 0, '2-Pas mal': 0, '3-Moyen': 0, '4-Bien': 0, '5-Très bien': 0 });
  const totalVotes = responses.length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Link to="/admin/surveys" className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-[#fbc603]">{survey.title}</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <p className="text-gray-600 mb-4">{survey.description}</p>
          <p className="text-sm text-gray-500">Créé le : {new Date(survey.created_at).toLocaleDateString()}</p>
          <p className="text-sm text-gray-500">Statut : {survey.is_published ? 'Publié' : 'Brouillon'}</p>
          <h3 className="mt-4 font-medium text-gray-800">Question : {survey.question}</h3>
        </div>

        <div className="mb-6">
          <div className="flex space-x-4 mb-4">
            <button
              className={`px-4 py-2 ${activeTab === 'collective' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
              onClick={() => setActiveTab('collective')}
            >
              Réponses collectives
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'individual' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
              onClick={() => setActiveTab('individual')}
            >
              Réponses individuelles
            </button>
          </div>

          {activeTab === 'collective' && (
            <div>
              <h4 className="text-lg font-semibold mb-4">Graphique des réponses</h4>
              <div className="space-y-4">
                {Object.entries(voteSummary).map(([label, count]) => (
                  <div key={label} className="flex items-center">
                    <div className="w-1/4 text-sm">{label}</div>
                    <div className="w-2/4 bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-indigo-600 h-4 rounded-full"
                        style={{ width: `${(count / totalVotes || 0) * 100}%` }}
                      ></div>
                    </div>
                    <span className="w-1/4 ml-2 text-sm">{count} votes ({((count / totalVotes || 0) * 100).toFixed(1)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'individual' && (
            <div>
              <h4 className="text-lg font-semibold mb-4">Réponses individuelles</h4>
              {responses.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Utilisateur</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Réponse</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {responses.map((response, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">Utilisateur {response.user_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{response.response}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(response.responded_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500">Aucune réponse enregistrée pour ce sondage.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyDetails;