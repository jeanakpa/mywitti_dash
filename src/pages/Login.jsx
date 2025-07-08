import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/api';
import { useAuth } from '../context/AuthContext';
import wittiLogo from '../assets/witti_logo.png';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiFetch('/admin/login', {
        method: 'POST',
        body: form,
      });
      login({
        token: data.access_token,
        role: data.role,
        name: data.name,
        email: data.email,
      });
      navigate('/');
    } catch (err) {
      setError(err?.data?.message || err?.data?.error || 'Erreur de connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#262e55] via-[#5c669a] to-[#f7fafc]">
      <div className="w-full max-w-md mx-auto p-8 rounded-3xl shadow-2xl bg-white/90 backdrop-blur-md animate-fade-in-up relative">
        <div className="flex flex-col items-center mb-6">
          <img src={wittiLogo} alt="Logo MyWitti" className="w-28 h-28 object-contain drop-shadow-lg animate-bounce-slow" />
          <h2 className="text-3xl font-extrabold text-[#262e55] mt-4 tracking-tight">Connexion Admin</h2>
        </div>
        {error && <div className="text-red-600 text-center mb-2 animate-shake">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 font-medium text-[#262e55]">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-[#5c669a] px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#262e55] focus:outline-none transition"
              required
              autoFocus
              placeholder="admin@witti.com"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-[#262e55]">Mot de passe</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border border-[#5c669a] px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#262e55] focus:outline-none transition"
              required
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#262e55] to-[#5c669a] text-white py-2 rounded-lg font-semibold shadow-md hover:scale-105 transition-transform duration-200 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-32 h-2 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 rounded-full blur-sm opacity-70 animate-pulse"></div>
      </div>
      <style>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.7s cubic-bezier(.39,.575,.565,1.000) both;
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-bounce-slow {
          animation: bounce 2.5s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-shake {
          animation: shake 0.3s linear;
        }
        @keyframes shake {
          10%, 90% { transform: translateX(-2px); }
          20%, 80% { transform: translateX(4px); }
          30%, 50%, 70% { transform: translateX(-8px); }
          40%, 60% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
};

export default Login; 