import React, { useState, useEffect } from 'react';
import { ClipboardList, Send, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/api';

const SurveyResponse = () => {
  const { token } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [currentSurvey, setCurrentSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Récupérer tous les sondages
  const fetchPublishedSurveys = async () => {
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

  useEffect(() => {
    if (token) {
      fetchPublishedSurveys();
    }
  }, [token]);

  const startSurvey = (survey) => {
    setCurrentSurvey(survey);
    setAnswers({});
    setSubmitted(false);
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vérifier les questions obligatoires
    const requiredQuestions = currentSurvey.questions.filter(q => q.required);
    const missingRequired = requiredQuestions.some(q => !answers[q.id]);
    
    if (missingRequired) {
      alert('Veuillez répondre à toutes les questions obligatoires.');
      return;
    }

    try {
      // Sauvegarder la réponse via API
      await apiFetch(`/surveys/${currentSurvey.id}/responses`, { 
        method: 'POST', 
        token, 
        body: {
          answers: currentSurvey.questions.map(q => answers[q.id] || ''),
          submittedAt: new Date().toISOString()
        }
      });
      
      setSubmitted(true);
    } catch (err) {
      setError(err?.data?.msg || err?.data?.error || err?.message || 'Erreur lors de la soumission de la réponse.');
    }
  };

  const resetSurvey = () => {
    setCurrentSurvey(null);
    setAnswers({});
    setSubmitted(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des sondages...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Merci !</h2>
          <p className="text-gray-600 mb-6">Votre réponse a été enregistrée avec succès.</p>
          <button
            onClick={resetSurvey}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Retour aux sondages
          </button>
        </div>
      </div>
    );
  }

  if (currentSurvey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <ClipboardList size={24} className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{currentSurvey.title}</h1>
                {currentSurvey.description && (
                  <p className="text-gray-600 mt-1">{currentSurvey.description}</p>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {currentSurvey.questions?.map((question, index) => (
                <div key={question.id} className="space-y-3">
                  <label className="block">
                    <span className="text-lg font-semibold text-gray-800">
                      Question {index + 1}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </span>
                    <p className="text-gray-600 mt-1">{question.text}</p>
                  </label>

                  {question.type === 'text' && (
                    <textarea
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                      rows={3}
                      placeholder="Votre réponse..."
                      required={question.required}
                    />
                  )}

                  {question.type === 'rating' && (
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(rating => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => handleAnswerChange(question.id, rating.toString())}
                          className={`w-12 h-12 rounded-lg border-2 font-semibold transition-colors ${
                            answers[question.id] === rating.toString()
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  )}

                  {question.type === 'single_choice' && (
                    <div className="space-y-2">
                      {['Option 1', 'Option 2', 'Option 3', 'Option 4'].map((option, optIndex) => (
                        <label key={optIndex} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name={`question_${question.id}`}
                            value={option}
                            checked={answers[question.id] === option}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            required={question.required}
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {question.type === 'multiple_choice' && (
                    <div className="space-y-2">
                      {['Option 1', 'Option 2', 'Option 3', 'Option 4'].map((option, optIndex) => (
                        <label key={optIndex} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            value={option}
                            checked={answers[question.id]?.includes(option) || false}
                            onChange={(e) => {
                              const currentAnswers = answers[question.id]?.split(',').filter(Boolean) || [];
                              if (e.target.checked) {
                                handleAnswerChange(question.id, [...currentAnswers, option].join(','));
                              } else {
                                handleAnswerChange(question.id, currentAnswers.filter(a => a !== option).join(','));
                              }
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="flex gap-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={resetSurvey}
                  className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  Envoyer les réponses
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList size={32} className="text-blue-600" />
          </div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">Tous les sondages</h1>
        <p className="text-gray-600">Consultez et participez aux sondages</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        {surveys.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList size={32} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Aucun sondage disponible</h2>
            <p className="text-gray-600">Il n'y a actuellement aucun sondage créé.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {surveys.map(survey => (
              <div key={survey.id} className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <ClipboardList size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{survey.title}</h3>
                      <p className="text-sm text-gray-500">{survey.questions?.length || 0} questions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Réponses</div>
                    <div className="text-lg font-semibold text-blue-600">{survey.responses || 0}</div>
                  </div>
                </div>
                
                {survey.description && (
                  <p className="text-gray-600 mb-4 line-clamp-2">{survey.description}</p>
                )}

                <button
                  onClick={() => startSurvey(survey)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  Participer au sondage
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyResponse; 