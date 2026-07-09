import React from 'react';

export default function PageSkeleton({ variant = 'card', count = 1 }) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'list':
        return (
          <div className="space-y-4">
            {[...Array(count)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 rounded-xl bg-garage-800/50 animate-pulse">
                <div className="rounded-full bg-garage-700/50 h-12 w-12"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-garage-700/50 rounded w-3/4"></div>
                  <div className="h-3 bg-garage-700/50 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'table':
        return (
          <div className="w-full bg-garage-800/50 rounded-xl overflow-hidden animate-pulse">
            <div className="h-12 bg-garage-700/30 border-b border-garage-700/50"></div>
            <div className="divide-y divide-garage-700/50">
              {[...Array(count)].map((_, i) => (
                <div key={i} className="grid grid-cols-4 gap-4 p-4">
                  <div className="h-4 bg-garage-700/50 rounded col-span-1"></div>
                  <div className="h-4 bg-garage-700/50 rounded col-span-2"></div>
                  <div className="h-4 bg-garage-700/50 rounded col-span-1"></div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'card':
      default:
        return (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(count, 3)} gap-4`}>
            {[...Array(count)].map((_, i) => (
              <div key={i} className="rounded-xl p-6 bg-garage-800/50 animate-pulse border border-garage-700/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-6 bg-garage-700/50 rounded w-1/3"></div>
                  <div className="h-8 w-8 bg-garage-700/50 rounded-full"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-garage-700/50 rounded w-3/4"></div>
                  <div className="h-4 bg-garage-700/50 rounded w-full"></div>
                  <div className="h-4 bg-garage-700/50 rounded w-5/6"></div>
                </div>
                <div className="mt-6 pt-4 border-t border-garage-700/50 flex justify-between items-center">
                   <div className="h-8 w-24 bg-garage-700/50 rounded-lg"></div>
                   <div className="h-4 w-16 bg-garage-700/50 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        );
    }
  };

  return <div className="w-full">{renderSkeleton()}</div>;
}
