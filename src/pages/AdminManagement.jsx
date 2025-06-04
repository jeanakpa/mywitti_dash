import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Plus, Search, Trash2, X } from 'lucide-react';

const AdminManagement = () => {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentAdmin, setCurrentAdmin] = useState({
    id: 0,
    name: '',
    email: '',
    role: 'Admin',
    password: ''
  });

  const adminsPerPage = 5;

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("admin"));
    if (!admin || admin.role !== "Super Admin") {
      navigate("/admin/dashboard");
      return;
    }
    fetchAdmins(admin.token);
  }, [navigate]);

  const fetchAdmins = async (token) => {
    console.log("Fetching admins with token:", token);
    try {
      const response = await fetch('http://localhost:5000/admin/admins', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || `Erreur serveur: ${response.status}`);
      }

      const data = await response.json();
      console.log("Admins fetched:", data);
      setAdmins(Array.isArray(data.admins) ? data.admins : []);
      setErrorMessage('');
    } catch (err) {
      console.error('Erreur lors de la récupération des admins:', err);
      setErrorMessage(
        err.message === 'Failed to fetch'
          ? 'Impossible de contacter le serveur. Vérifie que le backend est bien lancé sur http://localhost:5000.'
          : err.message
      );
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleAddAdmin = () => {
    setCurrentAdmin({ id: 0, name: '', email: '', role: 'Admin', password: '' });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEditAdmin = (admin) => {
    setCurrentAdmin({ ...admin, password: '' });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSubmitAdmin = async (e) => {
    e.preventDefault();
    const admin = JSON.parse(localStorage.getItem("admin"));
    try {
      const url = isEditing
        ? `http://localhost:5000/admin/admins/${currentAdmin.id}`
        : 'http://localhost:5000/admin/admins';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${admin.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: currentAdmin.name,
          email: currentAdmin.email,
          role: currentAdmin.role,
          password: currentAdmin.password || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Erreur lors de la soumission');
      }

      const result = await response.json();
      fetchAdmins(admin.token);
      setShowModal(false);
      setErrorMessage('');
    } catch (err) {
      console.error("Erreur:", err);
      setErrorMessage(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet administrateur ?')) return;
    const admin = JSON.parse(localStorage.getItem("admin"));
    try {
      const response = await fetch(`http://localhost:5000/admin/admins/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${admin.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Erreur lors de la suppression');
      }

      fetchAdmins(admin.token);
    } catch (err) {
      console.error("Erreur de suppression :", err);
      setErrorMessage(err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentAdmin({ ...currentAdmin, [name]: value });
  };

  const downloadCSV = () => {
    const headers = ['Nom, Email, Rôle'];
    const rows = paginatedAdmins.map(admin => [
      admin.name,
      admin.email,
      admin.role
    ].join(','));
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'admins.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredAdmins = admins.filter(admin =>
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAdmins.length / adminsPerPage);
  const startIndex = (currentPage - 1) * adminsPerPage;
  const paginatedAdmins = filteredAdmins.slice(startIndex, startIndex + adminsPerPage);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des administrateurs</h1>
        <div className="space-x-2">
          <button
            onClick={handleAddAdmin}
            className="flex items-center bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            <Plus size={20} className="mr-2" /> Ajouter un admin
          </button>
          <button
            onClick={downloadCSV}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Télécharger CSV
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          {errorMessage}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          <input
            type="search"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#5c669a] focus:border-[#5c669a]"
            placeholder="Rechercher un administrateur..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedAdmins.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    Aucun administrateur trouvé.
                  </td>
                </tr>
              ) : (
                paginatedAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{admin.name}</td>
                    <td className="px-6 py-4">{admin.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                        admin.role === 'Super Admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {admin.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {admin.role !== 'Super Admin' && (
                        <>
                          <button
                            onClick={() => handleEditAdmin(admin)}
                            className="text-blue-600 hover:text-blue-800"
                            aria-label={`Modifier l'administrateur ${admin.name}`}
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(admin.id)}
                            className="text-red-600 hover:text-red-800"
                            aria-label={`Supprimer l'administrateur ${admin.name}`}
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-600">
          Affichage de {startIndex + 1} à {Math.min(startIndex + adminsPerPage, filteredAdmins.length)} sur {filteredAdmins.length} administrateurs
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Précédent
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {isEditing ? 'Modifier Administrateur' : 'Ajouter un Administrateur'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            {errorMessage && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                {errorMessage}
              </div>
            )}
            <form onSubmit={handleSubmitAdmin}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <input
                  type="text"
                  name="name"
                  value={currentAdmin.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#5c669a] focus:border-[#5c669a] p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={currentAdmin.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#5c669a] focus:border-[#5c669a] p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Rôle</label>
                <select
                  name="role"
                  value={currentAdmin.role}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#5c669a] focus:border-[#5c669a] p-2"
                  disabled={isEditing}
                >
                  <option value="Admin">Admin</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Mot de passe {isEditing ? '(laisser vide pour ne pas changer)' : ''}</label>
                <input
                  type="password"
                  name="password"
                  value={currentAdmin.password}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#5c669a] focus:border-[#5c669a] p-2"
                  required={!isEditing}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="mr-2 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  {isEditing ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;