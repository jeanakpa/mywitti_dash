import React from 'react';
import { X } from 'lucide-react';
import PropTypes from 'prop-types';

const ModernModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = "max-w-md",
  showCloseButton = true
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-2xl shadow-2xl ${maxWidth} w-full max-h-[90vh] overflow-y-auto`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X size={24} />
              </button>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

ModernModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  maxWidth: PropTypes.string,
  showCloseButton: PropTypes.bool
};

export default ModernModal; 