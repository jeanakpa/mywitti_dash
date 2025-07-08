import React from 'react';
import PropTypes from 'prop-types';

const ModernTable = ({ 
  headers, 
  children, 
  className = "",
  emptyMessage = "Aucune donnée disponible",
  loading = false
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              {headers.map((header, index) => (
                <th 
                  key={index}
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {children}
          </tbody>
        </table>
        {!children || (Array.isArray(children) && children.length === 0) ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

ModernTable.propTypes = {
  headers: PropTypes.arrayOf(PropTypes.string).isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
  emptyMessage: PropTypes.string,
  loading: PropTypes.bool
};

export default ModernTable; 