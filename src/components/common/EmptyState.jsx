import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'Nothing Found',
  description = 'No items available at this time.',
  actionText,
  actionLink,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/30">
      <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-4 text-[#FFE600]">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-neutral-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && (
        actionLink ? (
          <Link
            to={actionLink}
            className="inline-flex items-center justify-center px-6 py-3 bg-[#FFE600] text-black font-bold uppercase tracking-widest text-xs rounded-none hover:bg-yellow-400 transition-all duration-200"
          >
            {actionText}
          </Link>
        ) : (
          <button
            onClick={onAction}
            className="inline-flex items-center justify-center px-6 py-3 bg-[#FFE600] text-black font-bold uppercase tracking-widest text-xs rounded-none hover:bg-yellow-400 transition-all duration-200"
          >
            {actionText}
          </button>
        )
      )}
    </div>
  );
};
