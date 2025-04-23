import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardTabsProps {
  activeTab: 'requests' | 'drivers';
  onTabChange: (tab: 'requests' | 'drivers') => void;
}

const DashboardTabs = ({ activeTab, onTabChange }: DashboardTabsProps) => {
  const handleRequestsClick = () => {
    console.log('Requests tab clicked');
    onTabChange('requests');
  };

  const handleDriversClick = () => {
    console.log('Drivers tab clicked');
    onTabChange('drivers');
  };

  return (
    <div className="relative z-20 w-full border-b bg-white pointer-events-auto">
      <div className="flex">
        <button
          type="button"
          onClick={handleRequestsClick}
          className={cn(
            "px-6 py-3 font-medium text-sm transition-colors cursor-pointer",
            activeTab === 'requests'
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-blue-600"
          )}
        >
          Delivery Requests
        </button>
        <button
          type="button"
          onClick={handleDriversClick}
          className={cn(
            "px-6 py-3 font-medium text-sm transition-colors cursor-pointer",
            activeTab === 'drivers'
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-blue-600"
          )}
        >
          Manage Drivers
        </button>
      </div>
    </div>
  );
};

export default DashboardTabs;
