
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
  error: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ error }) => {
  return (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm flex items-center">
      <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
      {error}
    </div>
  );
};

export default ErrorAlert;
