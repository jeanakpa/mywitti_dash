import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white/80 backdrop-blur-xl border-t border-white/20 py-4 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">MyWitti Dashboard</p>
            <p className="text-xs text-gray-500">Administration Panel v1.0</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-green-500 rounded-full animate-pulse"></div>
            <span>Système opérationnel</span>
          </div>
          
          <div className="text-sm text-gray-500">
            © 2024 MyWitti. Tous droits réservés.
          </div>
        </div>
      </div>
      
      {/* Effet de bordure lumineuse */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />
    </footer>
  );
};

export default Footer;