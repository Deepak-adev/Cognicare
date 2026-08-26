import React from 'react';
import '../styles/theme.css';

export const Card = ({ children, className = '' }) => {
  return (
    <div className={`card ${className}`}>
      {children}
    </div>
  );
};

export const Button = ({ children, onClick, variant = 'primary', icon: Icon, className = '' }) => {
  return (
    <button 
      className={`btn-large ${variant === 'accent' ? 'accent' : ''} ${className}`}
      onClick={onClick}
    >
      {Icon && <Icon size={48} />}
      <span>{children}</span>
    </button>
  );
};
