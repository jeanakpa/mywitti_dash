//pages/RepondSurvey.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSurveys } from '../context/SurveysContext';
import { users } from '../data/users';

const RespondSurvey = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { surveys, responses, setResponses, updateSurvey } = useSurveys();

  console.log('Valeur de useSurveys au niveau supérieur :', { surveys, responses, setResponses, updateSurvey });
  console.log('setResponses est une fonction ?', typeof setResponses === 'function');

  const surveyId = parseInt(id, 10);
  console.log('ID depuis useParams:', id);
  console.log('surveyId après parseInt:', surveyId);
  console.log('Liste des sondages (surveys):', surveys);
  console.log('IDs des sondages:', surveys.map(s => s.id));

  const survey = surveys.find(s => s.id === surveyId);
  console.log('Sondage trouvé:', survey);

  if (!survey) {
    return (
      <div className="p-6 text-red-500">
        <h2 className="text-2xl font-bold">Sondage non trouvé</h2>
        <p className="mt-2">Le sondage que vous cherchez n'existe pas ou a été supprimé.</p>
        <button
          onClick={() => navigate('/surveys')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Retour à la liste des sondages
        </button>
      </div>
    );
  }

  if (!survey.isPublished) {
    return (
      <div className="p-6 text-yellow-500">
        <h2 className="text-2xl font-bold">Sondage non publié</h2>
        <p className="mt-2">Ce sondage n'est pas encore disponible pour les réponses.</p>
        <button
          onClick={() => navigate('/surveys')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Retour à la liste des sondages
        </button>
      </div>
    );
  }

  const [selectedUserId, setSelectedUserId] = useState(() => {
    const firstClient = users.find(user => user.role === 'client');
    return firstClient ? firstClient.id : '';
  });
  const [userResponses, setUserResponses] = useState(
    survey.questions.map(q => ({
      questionId: q.id,
      option: '',
    })) || []
  );

  const isExpired = survey.deadline ? new Date(survey.deadline) < new Date() : false;
  const canRespond = survey.sentTo.includes(String(selectedUserId));

  console.log('Sondage :', survey);
  console.log('isExpired :', isExpired);
  console.log('selectedUserId :', selectedUserId);
  console.log('canRespond :', canRespond);
  console.log('sentTo :', survey.sentTo);

  const handleResponseChange = (questionId, value) => {
    setUserResponses(prev =>
      prev.map(resp =>
        resp.questionId === questionId ? { ...resp, option: value } : resp
      )
    );
  };

  const handleSubmit = () => {
    if (!selectedUserId) {
      alert('Veuillez sélectionner un utilisateur.');
      return;
    }

    if (isExpired) {
      alert('Ce sondage est expiré.');
      return;
    }

    if (!canRespond) {
      alert('Cet utilisateur n’est pas autorisé à répondre à ce sondage.');
      return;
    }

    const requiredQuestions = survey.questions.filter(q => q.required);
    const unansweredRequired = requiredQuestions.some(
      q => !userResponses.find(r => r.questionId === q.id)?.option
    );
    if (unansweredRequired) {
      alert('Veuillez répondre à toutes les questions obligatoires.');
      return;
    }

    const newResponses = userResponses.map(response => ({
      surveyId: survey.id,
      questionId: response.questionId,
      userId: selectedUserId,
      userName: users.find(u => u.id === selectedUserId)?.name || 'Utilisateur inconnu',
      option: response.option,
      respondedAt: new Date().toISOString(),
    }));

    const updatedResponses = [...responses, ...newResponses];
    setResponses(updatedResponses);
    localStorage.setItem('surveyResponses', JSON.stringify(updatedResponses));

    const updatedSurvey = {
      ...survey,
      responses: survey.responses + 1,
    };
    updateSurvey(survey.id, updatedSurvey);

    alert('Réponses enregistrées avec succès !');
    navigate('/surveys');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-8">
      <div className="w-full max-w-2xl">
        {/* En-tête du formulaire */}
        <div className="bg-white rounded-t-lg shadow-md border-t-4 border-indigo-600">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900">{survey.title}</h1>
            {survey.description && (
              <p className="mt-2 text-gray-600">{survey.description}</p>
            )}
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-b-lg shadow-md p-6 space-y-6">
          {/* Sélection de l'utilisateur */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Sélectionner un utilisateur (client) *
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            >
              <option value="">Choisir un utilisateur</option>
              {users
                .filter(user => user.role === 'client')
                .map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
            </select>
            {!selectedUserId && (
              <p className="text-sm text-red-500">
                Veuillez sélectionner un utilisateur pour répondre au sondage.
              </p>
            )}
          </div>

          {isExpired ? (
            <div className="text-red-500 text-center">
              Ce sondage est expiré. Vous ne pouvez plus répondre.
            </div>
          ) : !canRespond && selectedUserId ? (
            <div className="text-red-500 text-center">
              Cet utilisateur n’est pas autorisé à répondre à ce sondage.
            </div>
          ) : (
            <>
              {/* Questions */}
              {survey.questions.map((question, index) => (
                <div
                  key={question.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {question.text}
                      {question.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </h3>
                    <span className="text-sm text-gray-500">
                      Question {index + 1} sur {survey.questions.length}
                    </span>
                  </div>

                  {question.type === 'multiple' && (
                    <div className="space-y-3">
                      {question.options.map(option => (
                        <label
                          key={option.id}
                          className="flex items-center space-x-3 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option.text}
                            checked={
                              userResponses.find(r => r.questionId === question.id)?.option ===
                              option.text
                            }
                            onChange={(e) => handleResponseChange(question.id, e.target.value)}
                            className="h-5 w-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                            disabled={isExpired || !canRespond}
                          />
                          <span className="text-gray-700">{option.text}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {question.type === 'rating' && question.scale && (
                    <div className="space-y-3">
                      <div className="flex space-x-4 justify-center">
                        {[...Array(question.scale.max - question.scale.min + 1)].map((_, i) => {
                          const value = question.scale.min + i;
                          return (
                            <label
                              key={value}
                              className="flex flex-col items-center space-y-1"
                            >
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={value}
                                checked={
                                  userResponses.find(r => r.questionId === question.id)?.option ===
                                  value.toString()
                                }
                                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                                className="h-5 w-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                disabled={isExpired || !canRespond}
                              />
                              <span className="text-sm text-gray-600">{value}</span>
                            </label>
                          );
                        })}
                      </div>
                      {(question.scale.minLabel || question.scale.maxLabel) && (
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{question.scale.minLabel || ''}</span>
                          <span>{question.scale.maxLabel || ''}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {question.type === 'text' && (
                    <textarea
                      value={userResponses.find(r => r.questionId === question.id)?.option || ''}
                      onChange={(e) => handleResponseChange(question.id, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="Saisissez votre réponse..."
                      rows={4}
                      disabled={isExpired || !canRespond}
                    />
                  )}
                </div>
              ))}

              {/* Bouton de soumission */}
              <div className="flex justify-end mt-8">
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
                  disabled={isExpired || !canRespond || !selectedUserId}
                >
                  Soumettre
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RespondSurvey;