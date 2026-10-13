import React from 'react';

export const LoadingSpinner = ({ text = 'Loading...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }[size] || 'w-8 h-8 border-3';

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div
        className={`${sizeClasses} rounded-full border-neutral-800 border-t-[#FFE600] animate-spin`}
      />
      {text && (
        <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">
          {text}
        </p>
      )}
    </div>
  );
};
