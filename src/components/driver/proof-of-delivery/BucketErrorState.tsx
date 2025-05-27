
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface BucketErrorStateProps {
  onRetry: () => void;
  onCancel?: () => void;
}

const BucketErrorState: React.FC<BucketErrorStateProps> = ({ onRetry, onCancel }) => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-600">
          <AlertTriangle className="h-5 w-5" />
          Storage Configuration Required
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <p className="text-sm text-orange-800 mb-4">
            The photo storage system needs to be configured by your system administrator. 
            The "proof-of-delivery" storage bucket is missing.
          </p>
          
          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={onRetry}
              className="w-full"
            >
              Try Again
            </Button>
            
            {onCancel && (
              <Button
                variant="ghost"
                onClick={onCancel}
                className="w-full"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BucketErrorState;
