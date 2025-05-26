import React from 'react';
import { cn } from '@/lib/utils';
import { Cog } from 'lucide-react';

interface DashboardTabsProps {
  activeTab: 'requests' | 'drivers' | 'orders' | 'dispatch' | 'billing' | 'settings';
  onTabChange: (tab: 'requests' | 'drivers' | 'orders' | 'dispatch' | 'billing' | 'settings') => void;
}

const DashboardTabs = ({ activeTab, onTabChange }: DashboardTabsProps) => {
  // Enhanced tab click handler with direct URL navigation
  const handleTabClick = (tab: 'requests' | 'drivers' | 'orders' | 'dispatch' | 'billing' | 'settings') => {
    console.log('TabClick:', tab, 'Current active:', activeTab);
    
    // First update the URL directly
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url.toString());
    
    // Then call the parent's onTabChange
    onTabChange(tab);
  };

  // Special handler just for the billing tab
  const handleBillingClick = (e: React.MouseEvent) => {
    e.preventDefault();  
    console.log('Special billing tab click handler');
    
    // Force URL update first
    const url = new URL(window.location.href);
    url.searchParams.set('tab', 'billing');
    window.history.pushState({}, '', url.toString());
    
    // Small delay before state update
    setTimeout(() => {
      onTabChange('billing');
    }, 50);
  };

  return (
    <div className="relative z-20 w-full border-b bg-white pointer-events-auto">
      <div className="flex justify-between">
        <div className="flex">
          <button
            type="button"
            onClick={() => handleTabClick('requests')}
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
            onClick={() => handleTabClick('orders')}
            className={cn(
              "px-6 py-3 font-medium text-sm transition-colors cursor-pointer",
              activeTab === 'orders'
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            )}
          >
            Order Management
          </button>
          <button
            type="button"
            onClick={() => handleTabClick('drivers')}
            className={cn(
              "px-6 py-3 font-medium text-sm transition-colors cursor-pointer",
              activeTab === 'drivers'
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            )}
          >
            Manage Drivers
          </button>
          <button
            type="button"
            onClick={() => handleTabClick('dispatch')}
            className={cn(
              "px-6 py-3 font-medium text-sm transition-colors cursor-pointer",
              activeTab === 'dispatch'
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            )}
          >
            Dispatch & Routing
          </button>
          <a
            href="?tab=billing"
            onClick={handleBillingClick}
            className={cn(
              "px-6 py-3 font-medium text-sm transition-colors cursor-pointer",
              activeTab === 'billing'
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            )}
            id="billing-tab-button"
          >
            Billing & Invoicing
          </a>
        </div>
        <div>
          <button
            type="button"
            onClick={() => handleTabClick('settings')}
            className={cn(
              "px-6 py-3 font-medium text-sm transition-colors cursor-pointer flex items-center",
              activeTab === 'settings'
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            )}
          >
            <Cog className="h-4 w-4 mr-1" /> Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardTabs;
