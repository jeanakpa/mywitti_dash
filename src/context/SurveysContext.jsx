import React, { createContext, useContext, useState, useEffect } from 'react';
import { users } from '../data/users';

const SurveysContext = createContext();

export const SurveysProvider = ({ children }) => {
   const initialSurveys = [
    {
      id: 1,
      title: "Sondage Satisfaction Client",
      questions: [{ id: 1, text: "Êtes-vous satisfait de nos services ?", type: "text", required: false }],
      responses: 10,
      createdAt: "2024-01-15",
      isPublished: false,
      publishedAt: null,
      sentTo: []
    },
    {
      id: 2,
      title: "Sondage Produit",
      questions: [{ id: 1, text: "Quel produit préférez-vous ?", type: "text", required: false }],
      responses: 5,
      createdAt: "2024-02-20",
      isPublished: true,
      publishedAt: "2024-02-20",
      sentTo: users.filter(u => u.role === 'client').map(u => String(u.id))
    }
  ]; 

  const [surveys, setSurveys] = useState(() => {
    const savedSurveys = localStorage.getItem('surveys');
    return savedSurveys ? JSON.parse(savedSurveys) : initialSurveys;
  });

  const [responses, setResponses] = useState(() => {
    const savedResponses = localStorage.getItem('surveyResponses');
    return savedResponses ? JSON.parse(savedResponses) : [];
  });

  const [lastSurveyId, setLastSurveyId] = useState(() => {
    const savedSurveys = localStorage.getItem('surveys');
    const surveysToParse = savedSurveys ? JSON.parse(savedSurveys) : initialSurveys;
    return Math.max(...surveysToParse.map(s => s.id), 0);
  });

  // Persister les sondages dans localStorage à chaque mise à jour
  useEffect(() => {
    localStorage.setItem('surveys', JSON.stringify(surveys));
  }, [surveys]);

  // Persister les réponses dans localStorage à chaque mise à jour
  useEffect(() => {
    localStorage.setItem('surveyResponses', JSON.stringify(responses));
  }, [responses]);

  const addSurvey = (newSurvey) => {
    const newId = lastSurveyId + 1;
    const updatedSurveys = [...surveys, { 
      ...newSurvey, 
      id: newId, 
      responses: 0, 
      createdAt: new Date().toISOString(), 
      isPublished: false,
      publishedAt: null,
      sentTo: newSurvey.sentTo || []
    }];
    setSurveys(updatedSurveys);
    setLastSurveyId(newId);
  };

  const deleteSurvey = (id) => {
    setSurveys(surveys.filter(survey => survey.id !== id));
  };

  const updateSurvey = (id, updatedSurvey) => {
    setSurveys(surveys.map(survey => (survey.id === id ? { ...survey, ...updatedSurvey } : survey)));
  };

  const publishSurvey = (id) => {
    const clientIds = users.filter(u => u.role === 'client').map(u => String(u.id));
    setSurveys(surveys.map(survey => 
      survey.id === id ? { 
        ...survey, 
        isPublished: true, 
        publishedAt: new Date().toISOString(),
        sentTo: clientIds
      } : survey
    ));
  };

  const unpublishSurvey = (id) => {
    setSurveys(surveys.map(survey => 
      survey.id === id ? { 
        ...survey, 
        isPublished: false, 
        publishedAt: null,
        sentTo: []
      } : survey
    ));
  };

  const republishSurvey = (id) => {
    const clientIds = users.filter(u => u.role === 'client').map(u => String(u.id));
    setSurveys(surveys.map(survey => 
      survey.id === id ? { 
        ...survey, 
        publishedAt: new Date().toISOString(),
        sentTo: clientIds
      } : survey
    ));
  };

  return (
    <SurveysContext.Provider value={{ surveys, responses, setResponses, addSurvey, deleteSurvey, updateSurvey, publishSurvey, unpublishSurvey, republishSurvey }}>
      {children}
    </SurveysContext.Provider>
  );
};

export const useSurveys = () => useContext(SurveysContext);