// components/PlaceOrder.jsx
import React, { useState, useEffect } from 'react';

const PlaceOrder = () => {
  const [rewards, setRewards] = useState([]);
  const [cart, setCart] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedReward, setSelectedReward] = useState('');
  const [message, setMessage] = useState('');

  // Fetch available rewards
  const fetchRewards = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) {
        setMessage('Vous devez être connecté pour voir les récompenses');
        return;
      }

      const response = await fetch('http://localhost:5000/reward/', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (response.ok) {
        setRewards(data);
      } else {
        setMessage(data.msg || 'Erreur lors du chargement des récompenses');
      }
    } catch (err) {
      setMessage('Erreur réseau: ' + err.message);
    }
  };

  // Fetch cart items
  const fetchCart = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) {
        setMessage('Vous devez être connecté pour voir le panier');
        return;
      }

      const response = await fetch('http://localhost:5000/reward/cart', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (response.ok) {
        setCart(data.transactions || []);
      } else {
        setMessage(data.msg || 'Erreur lors du chargement du panier');
      }
    } catch (err) {
      setMessage('Erreur réseau: ' + err.message);
    }
  };

  // Add to cart
  const handleAddToCart = async () => {
    if (!selectedReward) {
      setMessage('Veuillez sélectionner une récompense');
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) {
        setMessage('Vous devez être connecté pour ajouter au panier');
        return;
      }

      const response = await fetch('http://localhost:5000/reward/cart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reward_id: parseInt(selectedReward), quantity })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Récompense ajoutée au panier');
        fetchCart(); // Refresh cart
      } else {
        setMessage(data.msg || 'Erreur lors de l\'ajout au panier');
      }
    } catch (err) {
      setMessage('Erreur réseau: ' + err.message);
    }
  };

  // Place order from cart
  const handlePlaceOrder = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) {
        setMessage('Vous devez être connecté pour passer une commande');
        return;
      }

      const response = await fetch('http://localhost:5000/reward/place-order', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Commande passée avec succès');
        setCart([]); // Clear local cart
      } else {
        setMessage(data.msg || 'Erreur lors de la création de la commande');
      }
    } catch (err) {
      setMessage('Erreur réseau: ' + err.message);
    }
  };

  useEffect(() => {
    fetchRewards();
    fetchCart();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Passer une commande</h2>

      {/* Add to Cart Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Ajouter une récompense au panier</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="reward" className="block text-sm font-medium text-gray-700">Récompense</label>
            <select
              id="reward"
              value={selectedReward}
              onChange={(e) => setSelectedReward(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            >
              <option value="">Sélectionner une récompense</option>
              {rewards.map(reward => (
                <option key={reward.id} value={reward.id}>
                  {reward.title} ({reward.tokens_required} jetons)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantité</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
              min="1"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
          </div>
          <button
            onClick={handleAddToCart}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Ajouter au panier
          </button>
        </div>
      </div>

      {/* Cart Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Votre panier</h3>
        {cart.length === 0 ? (
          <p className="text-gray-600">Votre panier est vide</p>
        ) : (
          <div>
            <ul className="space-y-2">
              {cart.map(item => (
                <li key={item.id} className="flex justify-between items-center border-b py-2">
                  <span>{item.quantity} x {item.title}</span>
                  <span>{item.total_tokens} jetons</span>
                </li>
              ))}
            </ul>
            <button
              onClick={handlePlaceOrder}
              className="mt-4 w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
            >
              Passer la commande
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className={`mt-4 p-3 rounded ${message.includes('Erreur') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default PlaceOrder;