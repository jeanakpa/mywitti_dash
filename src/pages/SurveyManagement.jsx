import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const SurveyManagement = () => {
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [responses, setResponses] = useState([]);
  const [results, setResults] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '', is_active: true });
  const [editing, setEditing] = useState(false);
  const chartRef = useRef();

  const API_URL = '/admin/surveys'; // Adapter l’URL si nécessaire
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#d0ed57'];

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    const { data } = await axios.get(API_URL);
    setSurveys(data.surveys);
  };

  const handleCreate = async () => {
    await axios.post(API_URL, formData);
    fetchSurveys();
    setFormData({ title: '', description: '', is_active: true });
  };

  const handleUpdate = async () => {
    if (!selectedSurvey) return;
    await axios.put(`${API_URL}/${selectedSurvey.id}`, formData);
    fetchSurveys();
    setFormData({ title: '', description: '', is_active: true });
    setEditing(false);
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    fetchSurveys();
    setSelectedSurvey(null);
    setResults([]);
    setResponses([]);
  };

  const handleViewResults = async (id) => {
    const res = await axios.get(`${API_URL}/${id}/results`);
    setResults(res.data.results);
    const rep = await axios.get(`${API_URL}/${id}/responses`);
    setResponses(rep.data.responses);
    const survey = surveys.find((s) => s.id === id);
    setSelectedSurvey(survey);
  };

  const exportToPDF = async () => {
    const input = chartRef.current;
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
    pdf.save('survey_results.pdf');
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Gestion des sondages</h2>

      {/* FORMULAIRE */}
      <div className="space-y-2 mb-6">
        <input
          type="text"
          placeholder="Titre"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="border p-2 rounded w-full"
        />
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="border p-2 rounded w-full"
        />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          />
          <label>Activer ce sondage</label>
        </div>
        {editing ? (
          <button onClick={handleUpdate} className="bg-blue-500 text-white px-4 py-2 rounded">Modifier</button>
        ) : (
          <button onClick={handleCreate} className="bg-green-500 text-white px-4 py-2 rounded">Créer</button>
        )}
      </div>

      {/* LISTE */}
      <table className="w-full mb-6 border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Titre</th>
            <th className="p-2 border">Actif</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {surveys.map((survey) => (
            <tr key={survey.id}>
              <td className="p-2 border">{survey.title}</td>
              <td className="p-2 border">{survey.is_active ? 'Oui' : 'Non'}</td>
              <td className="p-2 border space-x-2">
                <button
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                  onClick={() => {
                    setSelectedSurvey(survey);
                    setFormData({
                      title: survey.title,
                      description: survey.description,
                      is_active: survey.is_active,
                    });
                    setEditing(true);
                  }}
                >
                  Modifier
                </button>
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                  onClick={() => handleViewResults(survey.id)}
                >
                  Résultats
                </button>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => handleDelete(survey.id)}
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* GRAPHIQUES & RÉPONSES */}
      {selectedSurvey && (
        <div>
          <h3 className="text-lg font-semibold mb-2">
            Résultats pour : {selectedSurvey.title}
          </h3>

          <div ref={chartRef} className="bg-white p-4 rounded shadow-md inline-block">
            <PieChart width={400} height={300}>
              <Pie
                dataKey="percentage"
                isAnimationActive={false}
                data={results}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percentage }) => `${name} (${percentage}%)`}
              >
                {results.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>

          <div className="mt-4 flex gap-4">
            <button onClick={exportToPDF} className="bg-purple-600 text-white px-4 py-2 rounded">
              Exporter en PDF
            </button>
            <CSVLink
              data={responses}
              filename="survey_responses.csv"
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Exporter en CSV
            </CSVLink>
          </div>

          <div className="mt-6">
            <h4 className="text-md font-bold mb-2">Réponses individuelles :</h4>
            <table className="w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Nom</th>
                  <th className="p-2 border">Prénom</th>
                  <th className="p-2 border">Option</th>
                  <th className="p-2 border">Date</th>
                </tr>
              </thead>
              <tbody>
                {responses.map((r, i) => (
                  <tr key={i}>
                    <td className="p-2 border">{r.first_name}</td>
                    <td className="p-2 border">{r.last_name}</td>
                    <td className="p-2 border">{r.option_text}</td>
                    <td className="p-2 border">{new Date(r.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyManagement;