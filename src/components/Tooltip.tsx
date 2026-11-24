import React, { useState } from 'react';
import { HelpCircle, Info } from 'lucide-react';

interface TooltipProps {
  content: string;
  title?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, title }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-flex items-center ml-1">
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 focus:outline-none transition-colors p-0.5 rounded-full"
        aria-label="Ayuda pedagógica"
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {isVisible && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2.5 bg-slate-900 text-white dark:bg-slate-800 text-[11px] leading-relaxed rounded-xl shadow-xl z-50 border border-slate-700 pointer-events-none">
          {title && <div className="font-bold text-emerald-400 mb-0.5">{title}</div>}
          <div>{content}</div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800" />
        </div>
      )}
    </div>
  );
};
