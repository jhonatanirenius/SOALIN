import React, { useState, useEffect } from 'react';
import { AlinExpression } from '../../types';
import { AlinCharacterAsset, ALIN_EXPRESSIONS_MAP } from './AlinCharacterAsset';

interface AlinAvatarProps {
  expression?: AlinExpression;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  className?: string;
  isThinking?: boolean;
}

export const AlinAvatar: React.FC<AlinAvatarProps> = ({
  expression = 'normal',
  size = 'md',
  showBadge = true,
  className = '',
  isThinking = false,
}) => {
  const activeExp: AlinExpression = isThinking ? 'thinking' : expression;
  const meta = ALIN_EXPRESSIONS_MAP[activeExp] || ALIN_EXPRESSIONS_MAP['normal'];
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [activeExp]);

  const sizeClasses = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const badgeSizeClasses = {
    xs: 'w-3.5 h-3.5 text-[8px] -bottom-0.5 -right-0.5',
    sm: 'w-4 h-4 text-[9px] -bottom-0.5 -right-0.5',
    md: 'w-5 h-5 text-[11px] -bottom-0.5 -right-0.5',
    lg: 'w-6 h-6 text-xs -bottom-1 -right-1',
    xl: 'w-7 h-7 text-sm -bottom-1 -right-1',
  };

  return (
    <div className={`relative inline-block select-none ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-950 flex items-center justify-center ${
          isThinking
            ? 'ring-2 ring-indigo-400 ring-offset-1 animate-pulse'
            : 'ring-1 ring-slate-200 dark:ring-slate-700 hover:scale-105'
        }`}
        title={`ALIN - ${meta.label}: ${meta.description}`}
      >
        <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-full">
          {!imageError ? (
            <img
              src={`/alin_expressions/${activeExp}.png`}
              alt={`ALIN - ${meta.label}`}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover rounded-full transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full p-0.5">
              <AlinCharacterAsset
                expression={activeExp}
                className="w-full h-full object-cover transition-transform duration-300"
              />
            </div>
          )}
        </div>
      </div>

      {showBadge && meta && (
        <span
          title={`${meta.label} (${meta.description})`}
          className={`absolute flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 transition-transform ${badgeSizeClasses[size]}`}
        >
          {meta.emoji}
        </span>
      )}
    </div>
  );
};
