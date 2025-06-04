import React, { useState } from 'react';
import { Save, User, Bell, Lock, Globe, Database, Mail } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  
  const tabs = [
    { id: 'general', name: 'Général', icon: <Globe size={18} /> },
    { id: 'account', name: 'Compte', icon: <User size={18} /> },
    { id: 'security', name: 'Sécurité', icon: <Lock size={18} /> },
    { id: 'notifications', name: 'Notifications', icon: <Bell size={18} /> },
    { id: 'database', name: 'Base de données', icon: <Database size={18} /> },
    { id: 'emails', name: 'Emails', icon: <Mail size={18} /> },
  ];

  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Witti Admin',
    siteDescription: 'Plateforme de gestion Witti',
    timezone: 'Afrique/Abidjan',
    dateFormat: 'DD/MM/YYYY',
    language: 'fr',
  });

  const handleGeneralSettingsChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings({ ...generalSettings, [name]: value });
  };

  const saveSettings = (e) => {
    e.preventDefault();
    alert('Paramètres enregistrés avec succès !');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Paramètres</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200">
            <nav className="p-4 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#5c669a] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 p-6">
            {activeTab === 'general' && (
              <form onSubmit={saveSettings}>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Paramètres généraux</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nom du site
                    </label>
                    <input
                      type="text"
                      id="siteName"
                      name="siteName"
                      value={generalSettings.siteName}
                      onChange={handleGeneralSettingsChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="siteDescription"
                      name="siteDescription"
                      rows={3}
                      value={generalSettings.siteDescription}
                      onChange={handleGeneralSettingsChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                        Langue
                      </label>
                      <select
                        id="language"
                        name="language"
                        value={generalSettings.language}
                        onChange={handleGeneralSettingsChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
                        Fuseau horaire
                      </label>
                      <select
                        id="timezone"
                        name="timezone"
                        value={generalSettings.timezone}
                        onChange={handleGeneralSettingsChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="Afrique/Abidjan">Afrique/Abidjan</option>
                        <option value="Europe/Paris">Europe/Paris</option>
                        <option value="Amerique/New_York">Amérique/New_York</option>
                        <option value="Asie/Tokyo">Asie/Tokyo</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700 mb-1">
                      Format de date
                    </label>
                    <select
                      id="dateFormat"
                      name="dateFormat"
                      value={generalSettings.dateFormat}
                      onChange={handleGeneralSettingsChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#262e55] hover:bg-[#5c669a] focus:outline-none"
                  >
                    <Save size={16} className="mr-2" />
                    Enregistrer les paramètres
                  </button>
                </div>
              </form>
            )}
            
            {activeTab === 'account' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Paramètres du compte</h2>
                <p className="text-gray-500">Modifier les informations de votre compte utilisateur.</p>
              </div>
            )}
            
            {activeTab === 'security' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Paramètres de sécurité</h2>
                <p className="text-gray-500">Configurer les options de sécurité et d'authentification.</p>
              </div>
            )}
            
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Paramètres de notifications</h2>
                <p className="text-gray-500">Configurer les préférences de notifications et d'alertes.</p>
              </div>
            )}
            
            {activeTab === 'database' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Paramètres de base de données</h2>
                <p className="text-gray-500">Configurer les options de connexion à la base de données.</p>
              </div>
            )}
            
            {activeTab === 'emails' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Paramètres d'emails</h2>
                <p className="text-gray-500">Configurer les modèles d'emails et les options d'envoi.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;