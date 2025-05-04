import React from 'react';

export default function JobCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 w-full animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="w-3/5 h-5 bg-muted rounded"></div>
        <div className="w-16 h-5 bg-muted rounded"></div>
      </div>
      <div className="w-1/3 h-4 bg-muted rounded mb-3"></div>
      <div className="space-y-2 mb-3">
        <div className="w-full h-3 bg-muted rounded"></div>
        <div className="w-full h-3 bg-muted rounded"></div>
        <div className="w-3/4 h-3 bg-muted rounded"></div>
      </div>
      <div className="flex justify-between mt-4">
        <div className="w-2/5 h-4 bg-muted rounded"></div>
        <div className="w-1/4 h-8 bg-muted rounded"></div>
      </div>
    </div>
  );
}