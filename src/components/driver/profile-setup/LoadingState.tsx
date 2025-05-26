
import React from 'react';

const LoadingState: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-blue mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold text-gray-700">Loading...</h2>
        <p className="text-gray-500">Initializing profile setup...</p>
      </div>
    </div>
  );
};

export default LoadingState;
