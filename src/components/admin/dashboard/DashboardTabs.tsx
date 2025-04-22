
interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DashboardTabs = ({ activeTab, onTabChange }: DashboardTabsProps) => {
  return (
    <div className="flex mb-8 border-b">
      <button 
        type="button"
        onClick={() => onTabChange("requests")}
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
        onClick={() => onTabChange("drivers")}
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
