
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export const TrackingSearch = ({ onSearch }: { onSearch: (trackingId: string) => void }) => {
  const [trackingId, setTrackingId] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingId.trim()) {
      onSearch(trackingId.trim());
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
        <Button type="submit">Track</Button>
      </form>
    </div>
  );
};

export default TrackingSearch;
