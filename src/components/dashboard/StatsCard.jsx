// StatsCard.jsx
import React from 'react';
import PropTypes from 'prop-types';

const StatsCard = ({ title, value, icon, bgColor }) => {
  return (
    <div
      className={`rounded-lg p-4 sm:p-6 bg-white shadow-md hover:shadow-lg transition-all duration-200 ease-in-out hover:-translate-y-1 ${bgColor}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-xs sm:text-sm text-gray-600 font-medium tracking-wide mb-1">{title}</h2>
          <p className="text-lg sm:text-2xl font-bold text-gray-900">{value || 'N/A'}</p>
        </div>
        <div className="p-2 rounded-full bg-gray-100">
          {icon}
        </div>
      </div>
    </div>
  );
};

StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  icon: PropTypes.element.isRequired,
  bgColor: PropTypes.string.isRequired,
};

export default StatsCard;