import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/api';
import { Users, ShoppingCart, CheckCircle, XCircle, Award, Gift, Package, TrendingUp, Activity, Zap, Bell, AlertTriangle, FileQuestion, ClipboardList } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import Chart from 'chart.js/auto';

const Dashboard = () => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [stock, setStock] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const rewardsChartRef = useRef(null);
  const stockChartRef = useRef(null);
  const rewardsChartInstance = useRef(null);
  const stockChartInstance = useRef(null);

  // Fonction pour calculer les récompenses populaires basées sur les commandes validées
  const calculatePopularRewardsFromValidatedOrders = (ordersData) => {
    console.log('=== DÉBUT CALCUL RÉCOMPENSES POPULAIRES ===');
    console.log('Données reçues:', ordersData);
    
    if (!Array.isArray(ordersData)) {
      console.log('Orders data is not an array:', ordersData);
      return [];
    }

    if (ordersData.length === 0) {
      console.log('Aucune commande reçue');
      return [];
    }

    // Filtrer uniquement les commandes validées
    const validatedOrders = ordersData.filter(order => order.status === 'validated');
    console.log('Commandes validées trouvées:', validatedOrders.length);
    console.log('Exemple de commande validée:', validatedOrders[0]);

    if (validatedOrders.length === 0) {
      console.log('Aucune commande validée trouvée');
      return [];
    }

    // Compter les récompenses dans les commandes validées
    const rewardCounts = {};
    
    validatedOrders.forEach((order, index) => {
      console.log(`\n--- Commande ${index + 1} ---`);
      console.log('Order:', order);
      console.log('Items:', order.items);
      
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item, itemIndex) => {
          console.log(`Item ${itemIndex + 1}:`, item);
          const rewardName = item.libelle || item.name || item.title || item.reward_name || 'Récompense inconnue';
          const quantity = item.quantity || item.qty || 1;
          
          console.log(`Nom récompense: ${rewardName}, Quantité: ${quantity}`);
          
          if (rewardCounts[rewardName]) {
            rewardCounts[rewardName] += quantity;
          } else {
            rewardCounts[rewardName] = quantity;
          }
        });
      } else {
        console.log('Pas d\'items dans cette commande ou items n\'est pas un tableau');
        
        // Essayer d'autres propriétés possibles
        if (order.reward_name || order.libelle) {
          const rewardName = order.reward_name || order.libelle || 'Récompense inconnue';
          const quantity = order.quantity || order.qty || 1;
          
          console.log(`Récompense directe: ${rewardName}, Quantité: ${quantity}`);
          
          if (rewardCounts[rewardName]) {
            rewardCounts[rewardName] += quantity;
          } else {
            rewardCounts[rewardName] = quantity;
          }
        }
      }
    });

    console.log('Comptage final des récompenses:', rewardCounts);

    // Convertir en tableau et trier par popularité
    const popularRewards = Object.entries(rewardCounts)
      .map(([name, count]) => ({ libelle: name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6); // Top 6

    console.log('Récompenses populaires calculées:', popularRewards);
    console.log('=== FIN CALCUL RÉCOMPENSES POPULAIRES ===');
    return popularRewards;
  };

  // Fonction pour obtenir les statistiques des commandes validées
  const getValidatedOrdersStats = () => {
    if (!Array.isArray(orders)) return { count: 0, totalAmount: 0, recentCount: 0 };
    
    const validatedOrders = orders.filter(order => order.status === 'validated');
    const totalAmount = validatedOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
    
    // Commandes validées des 7 derniers jours
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentValidatedOrders = validatedOrders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate >= sevenDaysAgo;
    });
    
    return {
      count: validatedOrders.length,
      totalAmount,
      recentCount: recentValidatedOrders.length
    };
  };

  // Fonction pour obtenir les statistiques des notifications
  const getNotificationsStats = () => {
    if (!Array.isArray(notifications)) return { total: 0, unread: 0, recent: 0 };
    
    const unreadCount = notifications.filter(n => !n.is_read).length;
    
    // Notifications des 7 derniers jours
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentNotifications = notifications.filter(notif => {
      const notifDate = new Date(notif.created_at || notif.date);
      return notifDate >= sevenDaysAgo;
    });
    
    return {
      total: notifications.length,
      unread: unreadCount,
      recent: recentNotifications.length
    };
  };

  // Fonction pour obtenir les statistiques des utilisateurs
  const getUsersStats = () => {
    if (!Array.isArray(users)) return { total: 0, active: 0, newThisWeek: 0 };
    
    // Utilisateurs actifs (avec des jetons > 0)
    const activeUsers = users.filter(user => (user.jetons || 0) > 0);
    
    // Nouveaux utilisateurs cette semaine
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsersThisWeek = users.filter(user => {
      const userDate = new Date(user.date_ouverture_client || user.created_at);
      return userDate >= sevenDaysAgo;
    });
    
    return {
      total: users.length,
      active: activeUsers.length,
      newThisWeek: newUsersThisWeek.length
    };
  };

  // Fonction pour obtenir les statistiques du stock
  const getStockStats = () => {
    if (!Array.isArray(stock)) return { total: 0, lowStock: 0, outOfStock: 0 };
    
    const lowStock = stock.filter(item => (item.stock || 0) <= 5 && (item.stock || 0) > 0);
    const outOfStock = stock.filter(item => (item.stock || 0) === 0);
    
    return {
      total: stock.length,
      lowStock: lowStock.length,
      outOfStock: outOfStock.length
    };
  };

  // Fonction pour obtenir les statistiques des parrainages
  const getReferralsStats = () => {
    if (!Array.isArray(referrals)) return { total: 0, active: 0, successful: 0 };
    
    const activeReferrals = referrals.filter(ref => ref.status === 'active');
    const successfulReferrals = referrals.filter(ref => ref.status === 'completed');
    
    return {
      total: referrals.length,
      active: activeReferrals.length,
      successful: successfulReferrals.length
    };
  };

  // Fonction pour obtenir les statistiques des FAQs
  const getFaqsStats = () => {
    if (!Array.isArray(faqs)) return { total: 0, published: 0 };
    
    const publishedFaqs = faqs.filter(faq => faq.is_published !== false);
    
    return {
      total: faqs.length,
      published: publishedFaqs.length
    };
  };

  // Fonction pour obtenir les statistiques des sondages
  const getSurveysStats = () => {
    // Pour l'instant, retourner des valeurs par défaut car les sondages viennent de l'API
    // Cette fonction sera mise à jour quand l'API sera disponible
    return { total: 0, published: 0, responses: 0 };
  };

  // Fonction alternative pour afficher les récompenses du stock si pas de commandes
  const getStockRewardsForChart = () => {
    if (!Array.isArray(stock) || stock.length === 0) return [];
    
    // Utiliser les données du stock pour créer un graphique de répartition
    const stockRewards = stock
      .filter(item => item.stock > 0) // Seulement les items en stock
      .map(item => ({
        libelle: item.libelle || item.name || 'Récompense',
        count: item.stock || 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
    
    return stockRewards;
  };

  // Fonction de debug pour afficher les détails du calcul
  const debugValidatedOrdersCalculation = () => {
    console.log('=== DEBUG: Calcul des récompenses populaires ===');
    console.log('Total des commandes:', orders.length);
    
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
    console.log('Répartition par statut:', statusCounts);
    
    const validatedOrders = orders.filter(order => order.status === 'validated');
    console.log('Commandes validées:', validatedOrders.length);
    
    if (validatedOrders.length > 0) {
      console.log('Exemple de commande validée:', validatedOrders[0]);
    }
    
    const popularRewards = calculatePopularRewardsFromValidatedOrders(orders);
    console.log('Résultat final - Récompenses populaires:', popularRewards);
    console.log('=== FIN DEBUG ===');
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // Récupérer les stats
        let statsData = null;
        try {
          statsData = await apiFetch('/admin/stats', { token });
        } catch (statsErr) {
          console.warn('Erreur stats:', statsErr);
        }

        // Récupérer le stock
        let stockData = [];
        try {
          const stockResponse = await apiFetch('/admin/stock', { token });
          stockData = Array.isArray(stockResponse) ? stockResponse : [];
        } catch (stockErr) {
          console.warn('Erreur stock:', stockErr);
        }

        // Récupérer les commandes pour calculer les récompenses populaires
        let ordersData = [];
        try {
          const ordersResponse = await apiFetch('/admin/orders', { token });
          ordersData = Array.isArray(ordersResponse.orders) ? ordersResponse.orders : [];
          console.log('Commandes récupérées:', ordersData.length);
        } catch (ordersErr) {
          console.warn('Erreur commandes:', ordersErr);
        }

        // Récupérer les notifications
        let notificationsData = [];
        try {
          const notificationsResponse = await apiFetch('/admin/notifications', { token });
          notificationsData = Array.isArray(notificationsResponse.notifications) ? notificationsResponse.notifications : [];
        } catch (notificationsErr) {
          console.warn('Erreur notifications:', notificationsErr);
        }

        // Récupérer les FAQs
        let faqsData = [];
        try {
          const faqsResponse = await apiFetch('/admin/faqs', { token });
          faqsData = Array.isArray(faqsResponse) ? faqsResponse : [];
        } catch (faqsErr) {
          console.warn('Erreur FAQs:', faqsErr);
        }

        // Récupérer les parrainages
        let referralsData = [];
        try {
          const referralsResponse = await apiFetch('/admin/referrals', { token });
          referralsData = Array.isArray(referralsResponse) ? referralsResponse : [];
        } catch (referralsErr) {
          console.warn('Erreur parrainages:', referralsErr);
        }

        // Récupérer les utilisateurs
        let usersData = [];
        try {
          const usersResponse = await apiFetch('/admin/customers', { token });
          usersData = Array.isArray(usersResponse) ? usersResponse : [];
        } catch (usersErr) {
          console.warn('Erreur utilisateurs:', usersErr);
        }

        setStats(statsData);
        setStock(stockData);
        setOrders(ordersData);
        setNotifications(notificationsData);
        setFaqs(faqsData);
        setReferrals(referralsData);
        setUsers(usersData);

        // Debug: afficher les détails du calcul
        if (ordersData.length > 0) {
          setTimeout(() => debugValidatedOrdersCalculation(), 1000);
        }

        if (!statsData && stockData.length === 0) {
          setError('Impossible de charger les données du dashboard. Vérifiez votre connexion.');
        }
      } catch (err) {
        console.error('Erreur Dashboard:', err);
        setError('Erreur lors du chargement du dashboard. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  // Diagramme circulaire : récompenses les plus achetées (basées sur les commandes validées)
  useEffect(() => {
    console.log('Calcul des récompenses populaires basées sur les commandes validées...');
    
    // Utiliser les commandes pour calculer les récompenses populaires
    const popularRewards = calculatePopularRewardsFromValidatedOrders(orders);
    
    if (popularRewards.length === 0) {
      console.log('Aucune récompense populaire trouvée dans les commandes validées');
      return;
    }

    const labels = popularRewards.map(r => r.libelle);
    const values = popularRewards.map(r => r.count);
    
    console.log('Labels pour le graphique:', labels);
    console.log('Values pour le graphique:', values);
    
    if (rewardsChartInstance.current) rewardsChartInstance.current.destroy();
    if (rewardsChartRef.current) {
      rewardsChartInstance.current = new Chart(rewardsChartRef.current, {
        type: 'doughnut',
      data: {
          labels,
        datasets: [{
            data: values,
            backgroundColor: [
              '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'
            ],
            borderWidth: 0,
            borderRadius: 8,
        }],
      },
      options: {
          plugins: {
            legend: { 
              position: 'bottom', 
              labels: { 
                color: '#374151', 
                font: { size: 12, weight: '600' },
                padding: 20,
                usePointStyle: true,
              } 
            },
            title: { 
              display: true, 
              text: 'Les récompenses les plus achetées', 
              color: '#1f2937', 
              font: { size: 16, weight: '700' },
              padding: { bottom: 20 }
            },
          },
          cutout: '60%',
        responsive: true,
          maintainAspectRatio: false,
      },
    });
    }
  }, [orders]);

  // Diagramme circulaire : répartition du stock
  useEffect(() => {
    if (!stock || stock.length === 0) return;
    const byCategory = stock.reduce((acc, item) => {
      acc[item.category || 'Autre'] = (acc[item.category || 'Autre'] || 0) + (item.stock || 0);
      return acc;
    }, {});
    const labels = Object.keys(byCategory);
    const values = Object.values(byCategory);
    if (stockChartInstance.current) stockChartInstance.current.destroy();
    if (stockChartRef.current) {
      stockChartInstance.current = new Chart(stockChartRef.current, {
      type: 'doughnut',
      data: {
          labels,
        datasets: [{
            data: values,
            backgroundColor: [
              '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#fa709a', '#fee140'
            ],
            borderWidth: 0,
            borderRadius: 8,
        }],
      },
      options: {
          plugins: {
            legend: { 
              position: 'bottom', 
              labels: { 
                color: '#374151', 
                font: { size: 12, weight: '600' },
                padding: 20,
                usePointStyle: true,
              } 
            },
            title: { 
              display: true, 
              text: 'Répartition du stock par catégorie', 
              color: '#1f2937', 
              font: { size: 16, weight: '700' },
              padding: { bottom: 20 }
            },
          },
          cutout: '60%',
        responsive: true,
          maintainAspectRatio: false,
      },
    });
    }
  }, [stock]);

  if (loading) {
    return (
      <div className="animate-fade-in-up">
        <PageHeader
          title="Dashboard"
          description={user ? `Bienvenue, ${user.name} !` : 'Bienvenue sur le dashboard'}
          icon={Users}
          gradient="from-purple-600 to-blue-600"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="modern-card p-8 shimmer h-32 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-in-up">
        <PageHeader
          title="Dashboard"
          description={user ? `Bienvenue, ${user.name} !` : 'Bienvenue sur le dashboard'}
          icon={Users}
          gradient="from-purple-600 to-blue-600"
        />
        <div className="modern-card p-8 mt-8 text-center">
          <div className="text-red-500 text-lg mb-4">⚠️</div>
          <p className="text-gray-700 whitespace-pre-line">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Dashboard"
        description={user ? `Bienvenue, ${user.name} !` : 'Bienvenue sur le dashboard'}
        icon={Users}
        gradient="from-purple-600 to-blue-600"
      />
      
      {stats && (
        <>
          {/* Cartes de statistiques */}
          {/*<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            <StatCard 
              label="Total Clients" 
              value={stats.total_customers} 
              icon={Users} 
              bgColor="bg-blue-50"
              iconColor="from-blue-500 to-blue-600"
              textColor="text-blue-700"
            />
            <StatCard 
              label="Top Client Jetons" 
              value={stats.top_customer_tokens} 
              icon={Award} 
              bgColor="bg-purple-50"
              iconColor="from-purple-500 to-indigo-600"
              textColor="text-purple-700"
            />
            <StatCard 
              label="Récompense populaire" 
              value={(() => {
                const popularRewards = calculatePopularRewardsFromValidatedOrders(orders);
                return popularRewards.length > 0 ? popularRewards[0]?.libelle || 'Aucune' : 'Aucune';
              })()} 
              icon={Gift} 
              bgColor="bg-pink-50"
              iconColor="from-pink-500 to-rose-500"
              textColor="text-pink-700"
            />
            <StatCard 
              label="Commandes en attente" 
              value={stats.pending_orders} 
              icon={ShoppingCart} 
              bgColor="bg-yellow-50"
              iconColor="from-yellow-500 to-orange-500"
              textColor="text-yellow-700"
            />
            <StatCard 
              label="Commandes validées" 
              value={stats.validated_orders} 
              icon={CheckCircle} 
              bgColor="bg-green-50"
              iconColor="from-green-500 to-emerald-600"
              textColor="text-green-700"
            />
            <StatCard 
              label="Commandes annulées" 
              value={stats.cancelled_orders} 
              icon={XCircle} 
              bgColor="bg-red-50"
              iconColor="from-red-500 to-pink-500"
              textColor="text-red-700"
            />
            
          </div>*/}

          {/* Section d'activité récente */}
          <div className="mt-12">
            <div className="modern-card p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Activité récente & Statistiques</h3>
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <Activity size={20} className="text-white" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Commandes */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                    <ShoppingCart size={16} className="text-blue-500" />
                    Commandes
                  </h4>
                  {(() => {
                    const validatedStats = getValidatedOrdersStats();
                    const pendingOrders = orders.filter(o => o.status === 'pending').length;
                    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
                    
                    return (
                      <div className="space-y-3">
                        <ActivityItem 
                          icon={CheckCircle}
                          title="Commandes validées"
                          description={`${validatedStats.count} total (${validatedStats.recentCount} cette semaine)`}
                          time={`${validatedStats.totalAmount} jetons`}
                          color="green"
                        />
                        <ActivityItem 
                          icon={ShoppingCart}
                          title="En attente"
                          description={`${pendingOrders} commandes à traiter`}
                          time="Action requise"
                          color="yellow"
                        />
                        <ActivityItem 
                          icon={XCircle}
                          title="Annulées"
                          description={`${cancelledOrders} commandes annulées`}
                          time="Historique"
                          color="red"
                        />
                      </div>
                    );
                  })()}
                </div>

                {/* Utilisateurs */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                    <Users size={16} className="text-purple-500" />
                    Utilisateurs
                  </h4>
                  {(() => {
                    const usersStats = getUsersStats();
                    const topUser = users.sort((a, b) => (b.jetons || 0) - (a.jetons || 0))[0];
                    
                    return (
                      <div className="space-y-3">
                        <ActivityItem 
                          icon={Users}
                          title="Total clients"
                          description={`${usersStats.total} clients enregistrés`}
                          time={`${usersStats.newThisWeek} nouveaux cette semaine`}
                          color="blue"
                        />
                        <ActivityItem 
                          icon={Award}
                          title="Clients actifs"
                          description={`${usersStats.active} avec des jetons`}
                          time="Engagement"
                          color="purple"
                        />
                        {topUser && (
                          <ActivityItem 
                            icon={Award}
                            title="Top client"
                            description={`${topUser.first_name || topUser.short_name || 'Client'}`}
                            time={`${topUser.jetons || 0} jetons`}
                            color="gold"
                          />
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Stock & Récompenses */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                    <Package size={16} className="text-green-500" />
                    Stock & Récompenses
                  </h4>
                  {(() => {
                    const stockStats = getStockStats();
                    const popularRewards = calculatePopularRewardsFromValidatedOrders(orders);
                    
                    return (
                      <div className="space-y-3">
                        <ActivityItem 
                          icon={Package}
                          title="Stock disponible"
                          description={`${stockStats.total} types de récompenses`}
                          time={`${stockStats.lowStock} en stock faible`}
                          color="blue"
                        />
                        {stockStats.outOfStock > 0 && (
                          <ActivityItem 
                            icon={AlertTriangle}
                            title="Stock épuisé"
                            description={`${stockStats.outOfStock} récompenses indisponibles`}
                            time="Action requise"
                            color="red"
                          />
                        )}
                        {popularRewards.length > 0 && (
                          <ActivityItem 
                            icon={Gift}
                            title="Récompense populaire"
                            description={`${popularRewards[0].libelle}`}
                            time={`${popularRewards[0].count} commandes validées`}
                            color="purple"
                          />
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Notifications */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                    <Bell size={16} className="text-orange-500" />
                    Notifications
                  </h4>
                  {(() => {
                    const notifStats = getNotificationsStats();
                    
                    return (
                      <div className="space-y-3">
                        <ActivityItem 
                          icon={Bell}
                          title="Total notifications"
                          description={`${notifStats.total} notifications`}
                          time={`${notifStats.recent} cette semaine`}
                          color="blue"
                        />
                        {notifStats.unread > 0 && (
                          <ActivityItem 
                            icon={Bell}
                            title="Non lues"
                            description={`${notifStats.unread} notifications en attente`}
                            time="Action requise"
                            color="orange"
                          />
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Parrainages */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                    <Gift size={16} className="text-pink-500" />
                    Parrainages
                  </h4>
                  {(() => {
                    const refStats = getReferralsStats();
                    
                    return (
                      <div className="space-y-3">
                        <ActivityItem 
                          icon={Gift}
                          title="Total parrainages"
                          description={`${refStats.total} parrainages`}
                          time={`${refStats.active} actifs`}
                          color="pink"
                        />
                        <ActivityItem 
                          icon={CheckCircle}
                          title="Parrainages réussis"
                          description={`${refStats.successful} parrainages complétés`}
                          time="Succès"
                          color="green"
                        />
                      </div>
                    );
                  })()}
                </div>

                {/* Sondages */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                    <ClipboardList size={16} className="text-blue-500" />
                    Sondages
                  </h4>
                  {(() => {
                    const surveysStats = getSurveysStats();
                    
                    return (
                      <div className="space-y-3">
                        <ActivityItem 
                          icon={ClipboardList}
                          title="Total Sondages"
                          description={`${surveysStats.total} sondages créés`}
                          time={`${surveysStats.published} publiés`}
                          color="blue"
                        />
                        <ActivityItem 
                          icon={Users}
                          title="Réponses"
                          description={`${surveysStats.responses} réponses totales`}
                          time="Tous sondages confondus"
                          color="green"
                        />
                      </div>
                    );
                  })()}
                </div>

                {/* FAQs */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                    <FileQuestion size={16} className="text-indigo-500" />
                    FAQs
                  </h4>
                  {(() => {
                    const faqsStats = getFaqsStats();
                    
                    return (
                      <div className="space-y-3">
                        <ActivityItem 
                          icon={FileQuestion}
                          title="Total FAQs"
                          description={`${faqsStats.total} questions/réponses`}
                          time={`${faqsStats.published} publiées`}
                          color="indigo"
                        />
                      </div>
                    );
                  })()}
                </div>

              </div>
            </div>
          </div>


          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
            <div className="modern-card p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Récompenses populaires</h3>
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <TrendingUp size={20} className="text-white" />
                </div>
              </div>
              <div className="h-80">
                {(() => {
                  const popularRewards = calculatePopularRewardsFromValidatedOrders(orders);
                  const stockRewards = getStockRewardsForChart();
                  
                  if (popularRewards.length === 0 && stockRewards.length === 0) {
                    return (
                      <div className="h-full flex flex-col items-center justify-center text-center">
                        <Gift size={48} className="text-gray-300 mb-4" />
                        <h4 className="text-lg font-semibold text-gray-600 mb-2">Aucune donnée disponible</h4>
                        
                        <div className="mt-4 p-2 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600">
                            Commandes validées: {orders.filter(o => o.status === 'validated').length}
                          </p>
                        </div>
                    </div>
                    );
                  }
                  
                  // Utiliser les récompenses populaires si disponibles, sinon utiliser le stock
                  const dataToShow = popularRewards.length > 0 ? popularRewards : stockRewards;
                  const isStockData = popularRewards.length === 0 && stockRewards.length > 0;
                  
                  if (isStockData) {
                    // Créer le graphique avec les données du stock
                    setTimeout(() => {
                      if (rewardsChartInstance.current) rewardsChartInstance.current.destroy();
                      if (rewardsChartRef.current) {
                        const labels = dataToShow.map(r => r.libelle);
                        const values = dataToShow.map(r => r.count);
                        
                        rewardsChartInstance.current = new Chart(rewardsChartRef.current, {
                          type: 'doughnut',
                          data: {
                            labels,
                            datasets: [{
                              data: values,
                              backgroundColor: [
                                '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'
                              ],
                              borderWidth: 0,
                              borderRadius: 8,
                            }],
                          },
                          options: {
                            plugins: {
                              legend: { 
                                position: 'bottom', 
                                labels: { 
                                  color: '#374151', 
                                  font: { size: 12, weight: '600' },
                                  padding: 20,
                                  usePointStyle: true,
                                } 
                              },
                              title: { 
                                display: true, 
                                text: 'Répartition du stock disponible', 
                                color: '#1f2937', 
                                font: { size: 16, weight: '700' },
                                padding: { bottom: 20 }
                              },
                            },
                            cutout: '60%',
                            responsive: true,
                            maintainAspectRatio: false,
                          },
                        });
                      }
                    }, 100);
                  }
                  
                  return <canvas ref={rewardsChartRef} />;
                })()}
                    </div>
                  </div>
            
            <div className="modern-card p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Répartition du stock</h3>
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Package size={20} className="text-white" />
                </div>
              </div>
              <div className="h-80">
                <canvas ref={stockChartRef} />
              </div>
            </div>
          </div>

        </>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, bgColor, iconColor, textColor }) => (
  <div className={`modern-card p-8 ${bgColor} relative overflow-hidden group hover:scale-105 transition-all duration-300 border border-gray-100`}>
    {/* Effet de brillance */}
    <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
    
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${iconColor} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon size={24} className="text-white" />
        </div>
        <div className="text-right">
          <div className={`text-sm ${textColor} font-medium`}>+12%</div>
        </div>
      </div>
      
      <div className={`text-3xl font-bold mb-2 ${textColor}`}>{value ?? '-'}</div>
      <div className={`text-sm ${textColor} font-medium`}>{label}</div>
    </div>
  </div>
);

const ActivityItem = ({ icon: Icon, title, description, time, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    gold: 'bg-yellow-500',
    pink: 'bg-pink-500',
    indigo: 'bg-indigo-500',
    yellow: 'bg-yellow-500'
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
      <div className={`w-10 h-10 ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-800">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className="text-xs text-gray-500">{time}</div>
    </div>
  );
};

export default Dashboard;