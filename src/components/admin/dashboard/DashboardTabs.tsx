
import React from 'react';

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DashboardTabs = ({ activeTab, onTabChange }: DashboardTabsProps) => {
  const handleTabClick = (tab: string) => {
    console.log('DashboardTabs: Clicked tab', tab);
    onTabChange(tab);
  };

  return (
    <div className="flex mb-8 border-b">
      <button 
        type="button"
        onClick={() => handleTabClick("requests")}
        className={`px-6 py-3 font-medium text-sm transition-colors ${
          activeTab === "requests" 
            ? "border-b-2 border-blue-600 text-blue-600" 
            : "text-gray-600 hover:text-blue-600"
        }`}
      >
        Delivery Requests
      </button>
      <button 
        type="button"
        onClick={() => handleTabClick("drivers")}
        className={`px-6 py-3 font-medium text-sm transition-colors ${
          activeTab === "drivers" 
            ? "border-b-2 border-blue-600 text-blue-600" 
            : "text-gray-600 hover:text-blue-600"
        }`}
      >
        Manage Drivers
      </button>
    </div>
  );
};

export default DashboardTabs;
