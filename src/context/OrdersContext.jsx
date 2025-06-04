import React, { createContext, useContext, useState } from 'react';

const OrdersContext = createContext();

const initialOrders = [
  { 
    id: 'ORD-001',
    customer: 'Jean Dupont',
    contact: '0708978561',
    date: '2025-04-15',
    heure: '15h00',
    amount: 249.99,
    status: 'Valider',
    messages: ['Article disponible', 'Commande validée'],
  },
  { 
    id: 'ORD-002',
    customer: 'Marie Lambert',
    contact: '0708978561',
    date: '2025-04-14',
    heure: '09h00',
    amount: 125,
    status: 'En_attente',
    messages: [],
  },
  { 
    id: 'ORD-003',
    customer: 'Pierre Martin',
    contact: '0701978461',
    date: '2025-04-12',
    heure: '11h10',
    amount: 75,
    status: 'Annuler',
    messages: ['Article non disponible'],
  },
  { 
    id: 'ORD-004',
    customer: 'Sophie Bernard',
    contact: '0567089785',
    date: '2025-04-10',
    heure: '09h30',
    amount: 345,
    status: 'Valider',
    messages: ['Article disponible', 'Commande validée'],
  },
  { 
    id: 'ORD-005',
    customer: 'Thomas Petit',
    contact: '0577089785',
    date: '2025-04-08',
    heure: '14h50',
    amount: 129,
    status: 'Annuler',
    messages: ['Article non disponible'],
  },
  { 
    id: 'ORD-006',
    customer: 'Ange',
    contact: '0161708978',
    date: '2025-04-12',
    heure: '11h30',
    amount: 45,
    status: 'En_attente',
    messages: [],
  },
];

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState(initialOrders);

  const addOrder = (newOrder) => {
    setOrders([...orders, { ...newOrder, id: `ORD-${orders.length + 1}`.padStart(7, '0'), messages: [] }]);
  };

  return (
    <OrdersContext.Provider value={{ orders, setOrders, addOrder }}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => useContext(OrdersContext);