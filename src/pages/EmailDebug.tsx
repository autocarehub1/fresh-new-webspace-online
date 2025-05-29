
import React from 'react';
import EmailDiagnostics from '@/components/debug/EmailDiagnostics';
import Navbar from '@/components/layout/Navbar';

const EmailDebug = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Email System Debug</h1>
          <EmailDiagnostics />
        </div>
      </div>
    </div>
  );
};

export default EmailDebug;
