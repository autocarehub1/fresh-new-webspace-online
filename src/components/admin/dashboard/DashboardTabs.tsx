
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    <Tabs value={activeTab} onValueChange={onTabChange} className="mb-8">
      <TabsList className="w-full border-b rounded-none justify-start gap-2">
        <TabsTrigger 
          value="requests" 
          className={`px-6 py-3 font-medium text-sm transition-colors ${
            activeTab === "requests" 
              ? "border-b-2 border-blue-600 text-blue-600" 
              : "text-gray-600 hover:text-blue-600"
          }`}
          onClick={() => handleTabClick("requests")}
        >
          Delivery Requests
        </TabsTrigger>
        <TabsTrigger 
          value="drivers"
          className={`px-6 py-3 font-medium text-sm transition-colors ${
            activeTab === "drivers" 
              ? "border-b-2 border-blue-600 text-blue-600" 
              : "text-gray-600 hover:text-blue-600"
          }`}
          onClick={() => handleTabClick("drivers")}
        >
          Manage Drivers
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default DashboardTabs;
