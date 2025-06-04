// Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import witti_logo from '../assets/witti_logo.png';

const InputField = ({ label, type, name, value, onChange, placeholder }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="mt-1">
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        autoComplete={type === 'email' ? 'email' : 'current-password'}
        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none"
      />
    </div>
  </div>
);

const LoginButton = () => (
  <button
    type="submit"
    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-login hover:bg-[#5c669a] focus:outline-none focus:ring-2 focus:ring-offset-2"
  >
    Se connecter
  </button>
);

const ImageSection = () => (
  <div className="md:w-1/2 bg-[#262e55] p-8 flex flex-col items-center justify-center text-white">
    <div className="w-[50%] mb-6">
      <img
        src={witti_logo}
        alt="logo witti"
        className="w-full"
      />
    </div>
    <div className="text-center">
      <span className="text-2xl md:text-3xl font-bold tracking-wide text-white drop-shadow-md">
        Bienvenue sur My Witti Admin
      </span>
    </div>
  </div>
);

const FormHeader = ({ errorMessage }) => (
  <div>
    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Connexion</h2>
    <p className="mt-2 text-sm text-gray-600">
      Accédez à votre tableau de bord My Witti
    </p>
    {errorMessage && (
      <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
    )}
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem('admin'));
    if (admin && admin.token) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setErrorMessage("Veuillez remplir tous les champs.");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Réponse de l\'API:', data);

      if (response.ok) {
        // Stocker les informations de l'admin dans localStorage
        localStorage.setItem('admin', JSON.stringify({
          token: data.access_token,
          role: data.role,
          name: data.name,
          email: data.email,
        }));
        localStorage.setItem('isAuthenticated', 'true');
        setErrorMessage('');
        navigate('/', { replace: true }); // Redirection après succès
      } else {
        setErrorMessage(data.message || "Erreur de connexion. Veuillez vérifier vos identifiants.");
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setErrorMessage("Erreur réseau, veuillez réessayer plus tard.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <ImageSection />
          <div className="md:w-1/2 p-4">
            <div className="max-w-md w-full space-y-8">
              <FormHeader errorMessage={errorMessage} />
              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <InputField
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="exemple@email.com"
                  />
                  <InputField
                    label="Mot de passe"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                  />
                </div>
                <LoginButton />
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;