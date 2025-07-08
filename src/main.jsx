import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { SurveysProvider } from './context/SurveysContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SurveysProvider>
        <App />
      </SurveysProvider>
    </AuthProvider>
  </StrictMode>
);