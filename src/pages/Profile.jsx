import React, { useState } from 'react';
import { User, Edit, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/common/PageHeader';

const Profile = () => {
  const { user, token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // Ici tu peux ajouter l'appel API pour sauvegarder les modifications
    setIsEditing(false);
  };

  const handleCancel = () => {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto w-full animate-fade-in-up">
      <PageHeader
        title="Mon Profil"
        description="Consultez et modifiez vos informations personnelles."
        icon={User}
        gradient="from-green-500 to-blue-600"
      />
      
      <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Informations du profil</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit size={18} /> Modifier
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save size={18} /> Sauvegarder
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <X size={18} /> Annuler
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">{user?.name || 'Non renseigné'}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">{user?.email || 'Non renseigné'}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
              {isEditing ? (
                <input
                  type="text"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">{user?.role || 'Non renseigné'}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <div className="px-3 py-2 bg-green-50 text-green-700 rounded-lg font-medium">
                Connecté
              </div>
            </div>
          </div>

          {!isEditing && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations système</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Dernière connexion :</span> Aujourd'hui
                </div>
                <div>
                  <span className="font-medium">Permissions :</span> Accès complet
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 