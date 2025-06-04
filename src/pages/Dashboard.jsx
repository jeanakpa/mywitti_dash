// Dashboard.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Users, Award, ShoppingCart, Gift } from 'lucide-react';
import axios from 'axios';
import StatsCard from '../components/dashboard/StatsCard';
import { useLocation } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_customers: 0,
    top_customer_tokens: 'N/A',
    pending_orders: 0,
    cancelled_orders: 0,
    validated_orders: 0,
    most_visited_pages: 'Aucune donnée',
    most_purchased_reward: 'N/A',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);
  const pieChartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const pieChartInstanceRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching stats...');

        const admin = JSON.parse(localStorage.getItem('admin'));
        if (!admin || !admin.token) {
          throw new Error('Token manquant. Veuillez vous reconnecter.');
        }
        console.log('Admin token found:', !!admin.token);

        const response = await axios.get('http://localhost:5000/admin/stats', {
          headers: {
            Authorization: `Bearer ${admin.token}`,
            'Content-Type': 'application/json',
          },
        });
        console.log('API response:', response.data);
        setStats(response.data);
      } catch (err) {
        console.error('Erreur lors de la récupération des statistiques:', err);
        if (err.message.includes('Failed to fetch')) {
          setError('Impossible de se connecter au serveur. Vérifiez si le serveur est en cours d\'exécution sur http://localhost:5000.');
        } else {
          setError(`Erreur: ${err.response?.data?.error || err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [location.pathname]);

  useEffect(() => {
    console.log('Chart.js check:', !!window.Chart);
    const { Chart } = window;
    if (!Chart || loading || error || !chartRef.current || !pieChartRef.current) {
      console.log('Chart not initialized:', { Chart, loading, error, chartRef: chartRef.current, pieChartRef: pieChartRef.current });
      return;
    }

    if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    if (pieChartInstanceRef.current) pieChartInstanceRef.current.destroy();

    chartInstanceRef.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: ['En attente', 'Annulées', 'Validées'],
        datasets: [{
          label: 'Nombre de commandes',
          data: [stats.pending_orders, stats.cancelled_orders, stats.validated_orders],
          backgroundColor: ['#3B82F6', '#EF4444', '#10B981'],
          borderColor: '#fff',
          borderWidth: 1,
        }],
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Nombre', color: '#1F2937', font: { size: 14 } } },
          x: { title: { display: true, text: 'Statut des commandes', color: '#1F2937', font: { size: 14 } } },
        },
        plugins: {
          legend: { labels: { color: '#1F2937', font: { size: 12 } } },
        },
      },
    });

    pieChartInstanceRef.current = new Chart(pieChartRef.current, {
      type: 'doughnut',
      data: {
        labels: ['En attente', 'Annulées', 'Validées'],
        datasets: [{
          data: [stats.pending_orders, stats.cancelled_orders, stats.validated_orders],
          backgroundColor: ['#3B82F6', '#EF4444', '#10B981'],
          borderColor: '#fff',
          borderWidth: 1,
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top', labels: { color: '#1F2937', font: { size: 12 } } },
          title: { display: true, text: 'Répartition des commandes', color: '#1F2937', font: { size: 16 } },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
      if (pieChartInstanceRef.current) {
        pieChartInstanceRef.current.destroy();
        pieChartInstanceRef.current = null;
      }
    };
  }, [loading, error, stats]);

  const getPageTitle = () => {
    const pathMap = {
      '/': 'Accueil',
      '/notifications': 'Notifications',
      '/users': 'Gestion des clients',
      '/surveys': 'Système de sondage',
      '/orders': 'Gestion des commandes',
      '/stock': 'Gestion des stocks',
      '/faqs': 'Gestion des FAQs',
      '/referrals': 'Gestion des parrainages',
      '/admins': 'Gestion des administrateurs',
    };
    return pathMap[location.pathname] || 'Accueil';
  };

  const statsCards = [
    { title: 'Nombre total de clients', value: stats.total_customers, icon: <Users size={20} color="#3B82F6" />, bgColor: 'hover:bg-blue-50' },
    { title: 'Client avec le plus de jetons', value: stats.top_customer_tokens, icon: <Award size={20} color="#8B5CF6" />, bgColor: 'hover:bg-purple-50' },
    { title: 'Commandes en attente', value: stats.pending_orders, icon: <ShoppingCart size={20} color="#F59E0B" />, bgColor: 'hover:bg-yellow-50' },
    { title: 'Commandes annulées', value: stats.cancelled_orders, icon: <ShoppingCart size={20} color="#EF4444" />, bgColor: 'hover:bg-red-50' },
    { title: 'Commandes validées', value: stats.validated_orders, icon: <ShoppingCart size={20} color="#10B981" />, bgColor: 'hover:bg-green-50' },
    { title: 'Pages les plus visitées', value: stats.most_visited_pages, icon: <Gift size={20} color="#6B7280" />, bgColor: 'hover:bg-gray-50' },
    { title: 'Récompense la plus achetée', value: stats.most_purchased_reward, icon: <Gift size={20} color="#D97706" />, bgColor: 'hover:bg-amber-50' },
  ];

  return (
    <div className="flex">
      {/* <Sidebar /> <!-- Déplacé dans Layout.jsx --> */}
      <div className="flex-1 min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8 text-center tracking-tight">
          {getPageTitle()}
        </h1>

        {loading ? (
          <div className="text-center text-gray-600 text-lg animate-pulse">Chargement des données...</div>
        ) : error ? (
          <div className="text-center text-red-600 text-lg">{error}</div>
        ) : (
          <div className="space-y-10">
            {location.pathname === '/' ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {statsCards.map((card, idx) => (
                    <StatsCard
                      key={idx}
                      title={card.title}
                      value={card.value}
                      icon={card.icon}
                      bgColor={card.bgColor}
                    />
                  ))}
                </div>
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                    Visualisations des données
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-800 mb-4 text-center">Commandes par statut</h3>
                      <canvas ref={chartRef} />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-800 mb-4 text-center">Répartition des commandes</h3>
                      <canvas ref={pieChartRef} />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-600 text-lg">
                Cette page est en développement. Contenu à venir pour {getPageTitle()}.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;