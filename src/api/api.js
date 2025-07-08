// Utilitaire pour les appels API sécurisés avec JWT
// Modifie ici la base URL de l'API si besoin
const API_BASE_URL = 'http://192.168.0.200:5000/';

export async function apiFetch(endpoint, { method = 'GET', body, token, ...options } = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
    ...options,
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  if (!res.ok) {
    throw { status: res.status, data };
  }
  return data;
} 