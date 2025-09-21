import React from 'react';

interface TICKETRLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const TICKETRLogo: React.FC<TICKETRLogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
    xl: 'text-5xl'
  };

  return (
    <div className={`font-bold uppercase tracking-wider ${sizeClasses[size]} ${className}`}>
      <span className="text-blue-600">TICKET</span>
      <span className="relative text-blue-600">
        R
        <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-600"></span>
      </span>
    </div>
  );
};

export default TICKETRLogo;
