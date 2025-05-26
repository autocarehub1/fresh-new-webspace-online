import { create } from 'zustand';
import { toast } from 'sonner';

interface DispatchStore {
  // Auto-dispatch state
  autoDispatchEnabled: boolean;
  nextScheduledRun: Date | null;
  dispatchCount: number;
  timeUntilNextRun: string;
  debugMode: boolean; // Add debug mode
  dispatchInterval: number; // Add dispatch interval
  currentCallback: (() => Promise<void>) | null; // Add callback storage
  
  // For handling interval timer
  intervalId: number | null;
  countdownIntervalId: number | null; // Add separate ID for countdown timer
  
  // Actions
  enableAutoDispatch: (callback: () => Promise<void>) => void;
  disableAutoDispatch: () => void;
  incrementDispatchCount: () => void;
  updateTimeUntilNextRun: () => void;
  triggerManualRun: (callback: () => Promise<void>) => void; // Add manual trigger
  setDispatchInterval: (seconds: number) => void; // Add configurable interval
}

export const useDispatchStore = create<DispatchStore>((set, get) => ({
  autoDispatchEnabled: false,
  nextScheduledRun: null,
  dispatchCount: 0,
  timeUntilNextRun: '',
  intervalId: null,
  countdownIntervalId: null,
  debugMode: true, // Enable debug mode by default
  dispatchInterval: 15, // Default dispatch interval in seconds
  currentCallback: null,
  
  setDispatchInterval: (seconds) => {
    // Update the dispatch interval
    set({ dispatchInterval: seconds });
    
    // If auto-dispatch is enabled, restart it with the new interval
    if (get().autoDispatchEnabled) {
      const callback = get().currentCallback;
      if (callback) {
        get().disableAutoDispatch();
        get().enableAutoDispatch(callback);
      }
    }
  },
  
  enableAutoDispatch: (callback) => {
    // Clear any existing intervals
    const currentInterval = get().intervalId;
    const currentCountdownInterval = get().countdownIntervalId;
    
    if (currentInterval) {
      clearInterval(currentInterval);
    }
    
    if (currentCountdownInterval) {
      clearInterval(currentCountdownInterval);
    }
    
    console.log("🚀 Auto-dispatch enabled - initializing...");
    
    // Store the callback for potential restart
    set({ currentCallback: callback });
    
    // Get current dispatch interval
    const dispatchInterval = get().dispatchInterval || 15;
    
    // Set initial next run time
    const nextRun = new Date();
    nextRun.setSeconds(nextRun.getSeconds() + dispatchInterval);
    
    // Run immediately first
    console.log("🚀 Running initial auto-dispatch cycle...");
    callback().catch(e => console.error("Initial dispatch run failed:", e));
    
    // Update time until next run
    const updateTimeRemaining = () => {
      const { nextScheduledRun } = get();
      if (!nextScheduledRun) return;
      
      const now = new Date();
      const diffMs = nextScheduledRun.getTime() - now.getTime();
      
      if (diffMs <= 0) {
        set({ timeUntilNextRun: 'Now' });
        return;
      }
      
      const diffMinutes = Math.floor(diffMs / 60000);
      const diffSeconds = Math.floor((diffMs % 60000) / 1000);
      
      if (diffMinutes < 1) {
        set({ timeUntilNextRun: `${diffSeconds} sec` });
      } else if (diffMinutes < 60) {
        set({ timeUntilNextRun: `${diffMinutes} min ${diffSeconds} sec` });
      } else {
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        set({ timeUntilNextRun: `${hours}h ${minutes}m` });
      }
      
      if (get().debugMode) {
        console.log(`⏰ Next auto-dispatch in: ${get().timeUntilNextRun}`);
      }
    };
    
    // Initial time calculation
    updateTimeRemaining();
    
    // Set up 1-second interval for countdown timer (more responsive for debugging)
    const countdownInterval = setInterval(updateTimeRemaining, 1000);
    
    // Set up the dispatch interval
    const interval = setInterval(() => {
      console.log("⏰ Auto-dispatch timer triggered! Running dispatch cycle...");
      callback().then(() => {
        // Update next scheduled run time after each run
        const nextRun = new Date();
        nextRun.setSeconds(nextRun.getSeconds() + dispatchInterval);
        set({ nextScheduledRun: nextRun });
        
        // Update time until next run
        updateTimeRemaining();
        
        console.log("✅ Scheduled auto-dispatch completed successfully");
        toast.success("Auto-dispatch completed on schedule");
      }).catch(error => {
        console.error("❌ Scheduled auto-dispatch error:", error);
        toast.error("Failed to run scheduled auto-dispatch");
      });
    }, dispatchInterval * 1000);
    
    // Store both interval IDs
    set({ 
      autoDispatchEnabled: true, 
      nextScheduledRun: nextRun,
      intervalId: interval as unknown as number,
      countdownIntervalId: countdownInterval as unknown as number,
      dispatchCount: 0 // Reset dispatch count when enabling auto-dispatch
    });
    
    toast.success(`Automated dispatch enabled - will run every ${dispatchInterval} seconds`);
  },
  
  disableAutoDispatch: () => {
    const { intervalId, countdownIntervalId } = get();
    
    // Clear both intervals
    if (intervalId) {
      clearInterval(intervalId);
    }
    
    if (countdownIntervalId) {
      clearInterval(countdownIntervalId);
    }
    
    console.log("🛑 Auto-dispatch disabled");
    
    set({ 
      autoDispatchEnabled: false, 
      nextScheduledRun: null,
      intervalId: null,
      countdownIntervalId: null,
      timeUntilNextRun: '',
      currentCallback: null
    });
    
    toast.info("Automated dispatch schedule disabled");
  },
  
  incrementDispatchCount: () => {
    set(state => {
      const newCount = state.dispatchCount + 1;
      console.log(`📊 Dispatch count increased to ${newCount}`);
      return { dispatchCount: newCount };
    });
  },
  
  updateTimeUntilNextRun: () => {
    const { nextScheduledRun } = get();
    if (!nextScheduledRun) {
      set({ timeUntilNextRun: '' });
      return;
    }
    
    const now = new Date();
    const diffMs = nextScheduledRun.getTime() - now.getTime();
    
    if (diffMs <= 0) {
      set({ timeUntilNextRun: 'Now' });
      return;
    }
    
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffSeconds = Math.floor((diffMs % 60000) / 1000);
    
    if (diffMinutes < 1) {
      set({ timeUntilNextRun: `${diffSeconds} sec` });
    } else if (diffMinutes < 60) {
      set({ timeUntilNextRun: `${diffMinutes} min ${diffSeconds} sec` });
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      set({ timeUntilNextRun: `${hours}h ${minutes}m` });
    }
  },
  
  // Add function to manually trigger a dispatch run
  triggerManualRun: (callback) => {
    console.log("🔄 Manual dispatch run triggered");
    
    callback().then(() => {
      console.log("✅ Manual dispatch run completed successfully");
      toast.success("Manual dispatch run completed");
    }).catch(error => {
      console.error("❌ Manual dispatch run error:", error);
      toast.error("Failed to run manual dispatch");
    });
  }
})); 