import { useEffect, useState } from 'react';
import { useDispatchStore } from '@/store/dispatchStore';
import { Clock, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AutoDispatchIndicator = () => {
  const { 
    autoDispatchEnabled, 
    nextScheduledRun, 
    timeUntilNextRun,
    dispatchCount
  } = useDispatchStore();
  
  const [showFull, setShowFull] = useState(false);
  const navigate = useNavigate();
  
  // Don't render anything if auto-dispatch is not enabled
  if (!autoDispatchEnabled) return null;
  
  // Format time for display
  const formatTime = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const handleNavigateToDispatch = () => {
    navigate('/admin');
    // Reset to collapsed view after navigating
    setShowFull(false);
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div 
        className={`bg-green-50 border border-green-200 rounded-md shadow-md transition-all duration-300 cursor-pointer ${
          showFull ? 'p-3 w-80' : 'p-2 w-auto'
        }`}
        onClick={() => setShowFull(!showFull)}
      >
        {showFull ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-green-600">
                <Zap className="h-4 w-4 mr-2" />
                <span className="font-medium">Auto-Dispatch Active</span>
              </div>
              <Badge variant="outline" className="bg-green-100 text-green-600 border-green-200">
                {dispatchCount} Delivered
              </Badge>
            </div>
            
            <div className="flex items-center text-sm text-green-600">
              <Clock className="h-4 w-4 mr-2" />
              <span>Next run: {formatTime(nextScheduledRun)} (in {timeUntilNextRun})</span>
            </div>
            
            <Button 
              size="sm" 
              className="w-full mt-2" 
              onClick={(e) => {
                e.stopPropagation();
                handleNavigateToDispatch();
              }}
            >
              Go to Dispatch Center
            </Button>
          </div>
        ) : (
          <div className="flex items-center text-green-600">
            <Zap className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">Auto-Dispatch: {timeUntilNextRun}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoDispatchIndicator; 