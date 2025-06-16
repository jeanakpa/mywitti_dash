import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const admin = JSON.parse(localStorage.getItem('admin'));
        if (!admin || !admin.token) {
          throw new Error('Token manquant ou données admin non trouvées. Veuillez vous reconnecter.');
        }

        const response = await axios.get('http://localhost:5000/admin/profile', {
          headers: {
            Authorization: `Bearer ${admin.token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Profil récupéré:', response.data);
        setProfile(response.data);
      } catch (err) {
        console.error('Erreur lors de la récupération du profil:', err);
        setError(
          err.message === 'Network Error'
            ? 'Erreur réseau. Vérifiez si le serveur Flask est démarré sur http://localhost:5000.'
            : err.response?.status === 403
            ? 'Accès interdit. Vérifiez vos permissions ou reconnectez-vous.'
            : `Erreur: ${err.message || 'Impossible de charger le profil.'}`
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="p-6 text-center text-gray-600">Chargement...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold text-yellow-600 mb-6">Mon profil</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">ID</label>
            <p className="text-lg font-medium text-gray-900">{profile.id}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Prénom</label>
            <p className="text-lg font-medium text-gray-900">{profile.first_name || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Nom</label>
            <p className="text-lg font-medium text-gray-900">{profile.last_name || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Email</label>
            <p className="text-lg font-medium text-gray-900">{profile.email || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Identifiant</label>
            <p className="text-lg font-medium text-gray-900">{profile.identifiant}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Rôle</label>
            <p className="text-lg font-medium text-gray-900">
              {profile.is_superuser ? 'Super Admin' : profile.is_admin ? 'Admin' : 'Utilisateur'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Date d'inscription</label>
            <p className="text-lg font-medium text-gray-900">{new Date(profile.date_joined).toLocaleString('fr-FR')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Dernière connexion</label>
            <p className="text-lg font-medium text-gray-900">{new Date(profile.last_login).toLocaleString('fr-FR')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;