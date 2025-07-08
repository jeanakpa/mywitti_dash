import React from 'react';
import PropTypes from 'prop-types';

const PageHeader = ({ 
  title, 
  description, 
  children,
  icon: Icon,
  gradient = 'from-blue-600 to-purple-600'
}) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          {Icon && (
            <div className={`p-3 bg-gradient-to-r ${gradient} rounded-xl shadow-lg`}>
              <Icon size={24} className="text-white" />
            </div>
          )}
          <div>
            <h1 className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-2`}>
              {title}
            </h1>
            <p className="text-gray-600 text-lg">
              {description}
            </p>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
          {children}
        </div>
      </div>
    </div>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  children: PropTypes.node,
  icon: PropTypes.elementType,
  gradient: PropTypes.string
};

export default PageHeader; 