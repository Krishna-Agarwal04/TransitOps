import React from 'react';

export default function TableSkeleton({ rows = 4, cols = 6 }) {
  return (
    <div className="w-full space-y-4 p-6 animate-pulse">
      {/* Table Header line placeholder */}
      <div className="flex gap-4 border-b border-slate-100 pb-3">
        {Array.from({ length: cols }).map((_, idx) => (
          <div key={idx} className="h-4 bg-slate-100 rounded-md flex-1"></div>
        ))}
      </div>
      
      {/* Table Rows lines placeholders */}
      <div className="space-y-5">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <div 
                key={cIdx} 
                className={`h-3 bg-slate-50 rounded-md flex-1 ${
                  cIdx === 0 ? 'h-4 w-3/4' : ''
                }`}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
