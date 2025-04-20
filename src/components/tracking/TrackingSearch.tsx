
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

export const TrackingSearch = ({ onSearch }: { onSearch: (trackingId: string) => void }) => {
  const [trackingId, setTrackingId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedId = trackingId.trim();
    
    if (!trimmedId) {
      toast.error('Please enter a tracking number');
      return;
    }
    
    setIsSubmitting(true);
    try {
      onSearch(trimmedId);
    } catch (error) {
      console.error('Error in tracking search:', error);
      toast.error('An error occurred while searching. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Track Your Delivery</h2>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Enter tracking number"
            className="pl-10"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Searching...' : 'Track'}
        </Button>
      </form>
    </div>
  );
};

export default TrackingSearch;
