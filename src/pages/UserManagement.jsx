import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit, Check } from 'lucide-react';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newUser, setNewUser] = useState({
    code_client: '',
    name: '',
    country: '',
    phone: '',
    tokens: '',
    category: '',
    gender: '',
    birth_date: '',
    neighborhood: '',
  });
  const [editUser, setEditUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Mapper les données API aux champs du tableau
  const mapApiData = (apiData) => {
    console.log('Données brutes de l\'API:', apiData);
    return apiData.map((user) => ({
      id: user.id,
      code_client: user.customer_code || 'N/A',
      name: `${user.short_name || ''} ${user.first_name || ''}`.trim() || 'N/A',
      country: user.street ? user.street.split(', ')[1] || 'N/A' : 'N/A',
      phone: user.phone_number || 'N/A',
      tokens: user.solde || 0,
      category: user.total > 1000 ? 'Executive' : 'FirstClass', // Exemple basé sur total
      status: user.total > 0 ? 'Actif' : 'Inactif', // Statut basé sur total
      last_connection: '2025-05-01', // Placeholder, à remplacer par une date réelle de l'API
      gender: user.gender || 'N/A',
      birth_date: user.birth_date || 'N/A',
      neighborhood: user.street ? user.street.split(', ')[0] || 'N/A' : 'N/A',
    }));
  };

  // Récupérer les utilisateurs depuis l'API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const admin = JSON.parse(localStorage.getItem('admin'));
        console.log('Données admin dans localStorage:', admin);
        if (!admin) {
          throw new Error('Aucune donnée admin trouvée dans localStorage. Veuillez vous reconnecter.');
        }
        if (!admin.token) {
          throw new Error('Token manquant dans localStorage. Veuillez vous reconnecter.');
        }

        const response = await axios.get('http://localhost:5000/admin/customers', {
          headers: {
            Authorization: `Bearer ${admin.token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Réponse de l\'API:', response.data);
        if (!Array.isArray(response.data)) {
          throw new Error('Les données de l\'API ne sont pas un tableau.');
        }

        const mappedUsers = mapApiData(response.data);
        setUsers(mappedUsers);
      } catch (err) {
        console.error('Erreur complète:', err);
        if (err.message === 'Network Error') {
          setError('Erreur réseau. Vérifiez si le serveur Flask est démarré sur http://localhost:5000.');
        } else if (err.response) {
          if (err.response.status === 403) {
            setError('Accès interdit. Vérifiez vos permissions ou reconnectez-vous.');
          } else if (err.response.status === 404) {
            setError('Endpoint non trouvé. Vérifiez l\'URL de l\'API.');
          } else {
            setError(`Erreur ${err.response.status}: ${err.response.data?.message || 'Erreur inconnue.'}`);
          }
        } else {
          setError(err.message || 'Impossible de charger les utilisateurs. Vérifiez le serveur ou votre connexion.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedUsers = users.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(users.length / itemsPerPage);

  // Fonction d'ajout (désactivée)
  const handleAddUser = (e) => {
    e.preventDefault();
    setError('Ajout d\'utilisateur non pris en charge par l\'API actuelle.');
  };

  // Fonction d'édition (désactivée)
  const handleEditUser = (user) => {
    setError('Modification non prise en charge par l\'API actuelle.');
  };

  const handleSaveEdit = () => {
    setError('Modification non prise en charge par l\'API actuelle.');
    setEditUser(null);
  };

  // Fonction de suppression (désactivée)
  const handleDeleteUser = (id) => {
    setError('Suppression non prise en charge par l\'API actuelle.');
  };

  // Fonction de téléchargement CSV
  const downloadCSV = () => {
    const headers = ['Code client, Nom, Pays, Téléphone, Jetons, Catégorie, Statut, Dernière connexion, Genre, Date anniversaire, Quartier'];
    const rows = users.map((user) =>
      `${user.code_client}, ${user.name}, ${user.country}, ${user.phone}, ${user.tokens}, ${user.category}, ${user.status}, ${user.last_connection}, ${user.gender}, ${user.birth_date}, ${user.neighborhood}`
    ).join('\n');
    const csv = headers.join('\n') + '\n' + rows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Fonctions utilitaires (simplifiées)
  const getStatus = (lastConnection) => (lastConnection ? 'Actif' : 'Inactif');
  const getNextCategory = (tokens, maxReachedAt) => (tokens > 100 ? 'Executive' : 'FirstClass');

  const statusColors = {
    Actif: 'bg-green-100 text-green-800',
    Inactif: 'bg-red-100 text-red-800',
  };

  if (loading) return <div className="p-6 text-center text-gray-600">Chargement...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-photoshop-jaune">Gestion des utilisateurs</h1>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-6 py-2 bg-[#5c669a] text-white rounded hover:bg-[#262e55] cursor-not-allowed opacity-50"
          disabled
        >
          Ajouter un utilisateur
        </button>
        <button
          onClick={downloadCSV}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Télécharger CSV
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddUser} className="bg-white p-6 rounded-lg shadow-lg mt-6 space-y-4 opacity-50">
          <input
            type="text"
            name="code_client"
            placeholder="Code client"
            value={newUser.code_client}
            onChange={(e) => setNewUser((prev) => ({ ...prev, code_client: e.target.value }))}
            className="w-full p-3 border rounded-lg"
            disabled
          />
          <input
            type="text"
            name="name"
            placeholder="Nom"
            value={newUser.name}
            onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full p-3 border rounded-lg"
            disabled
          />
          <input
            type="text"
            name="country"
            placeholder="Pays"
            value={newUser.country}
            onChange={(e) => setNewUser((prev) => ({ ...prev, country: e.target.value }))}
            className="w-full p-3 border rounded-lg"
            disabled
          />
          <input
            type="text"
            name="phone"
            placeholder="Téléphone"
            value={newUser.phone}
            onChange={(e) => setNewUser((prev) => ({ ...prev, phone: e.target.value }))}
            className="w-full p-3 border rounded-lg"
            disabled
          />
          <input
            type="number"
            name="tokens"
            placeholder="Jetons"
            value={newUser.tokens}
            onChange={(e) => setNewUser((prev) => ({ ...prev, tokens: e.target.value }))}
            className="w-full p-3 border rounded-lg"
            disabled
          />
          <input
            type="text"
            name="category"
            placeholder="Catégorie"
            value={newUser.category}
            onChange={(e) => setNewUser((prev) => ({ ...prev, category: e.target.value }))}
            className="w-full p-3 border rounded-lg"
            disabled
          />
          <input
            type="text"
            name="gender"
            placeholder="Genre"
            value={newUser.gender}
            onChange={(e) => setNewUser((prev) => ({ ...prev, gender: e.target.value }))}
            className="w-full p-3 border rounded-lg"
            disabled
          />
          <input
            type="date"
            name="birth_date"
            placeholder="Date anniversaire"
            value={newUser.birth_date}
            onChange={(e) => setNewUser((prev) => ({ ...prev, birth_date: e.target.value }))}
            className="w-full p-3 border rounded-lg"
            disabled
          />
          <input
            type="text"
            name="neighborhood"
            placeholder="Quartier"
            value={newUser.neighborhood}
            onChange={(e) => setNewUser((prev) => ({ ...prev, neighborhood: e.target.value }))}
            className="w-full p-3 border rounded-lg"
            disabled
          />
          <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 opacity-50 cursor-not-allowed" disabled>
            <Plus size={18} className="inline-block mr-2" />
            Ajouter
          </button>
        </form>
      )}

      <div className="mt-6 bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Code client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Pays</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Téléphone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Jetons</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Catégorie</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Dernière connexion</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Genre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date anniversaire</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Quartier</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.code_client}</div>
                </td>
                {['name', 'country', 'phone', 'tokens', 'category', 'status', 'last_connection', 'gender', 'birth_date', 'neighborhood'].map((field, idx) => (
                  <td key={idx} className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user[field]}</div>
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button className="text-gray-400 cursor-not-allowed" disabled>
                    <Edit size={18} />
                  </button>
                  <button className="text-gray-400 cursor-not-allowed" disabled>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-600">
          Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, users.length)} sur {users.length} utilisateurs
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1 || users.length === 0}
            className="px-3 py-1 border rounded-md text-sm font-medium text-gray-700 disabled:opacity-50"
          >
            Précédent
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages || users.length === 0}
            className="px-3 py-1 border rounded-md text-sm font-medium text-gray-700 disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;