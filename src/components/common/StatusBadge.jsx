import React from 'react';
import PropTypes from 'prop-types';

const StatusBadge = ({ 
  status, 
  type = 'default',
  size = 'sm'
}) => {
  const getStatusConfig = (statusType) => {
    const configs = {
      success: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200'
      },
      error: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200'
      },
      warning: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-200'
      },
      info: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-200'
      },
      default: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200'
      }
    };
    return configs[statusType] || configs.default;
  };

  const getSizeClasses = () => {
    const sizes = {
      xs: 'px-1.5 py-0.5 text-xs',
      sm: 'px-2.5 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-1.5 text-sm'
    };
    return sizes[size] || sizes.sm;
  };

  const config = getStatusConfig(type);
  const sizeClasses = getSizeClasses();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}>
      {status}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info', 'default']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg'])
};

export default StatusBadge; 