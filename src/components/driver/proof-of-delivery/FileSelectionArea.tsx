
import React, { useRef } from 'react';
import { Camera } from 'lucide-react';

interface FileSelectionAreaProps {
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileSelectionArea: React.FC<FileSelectionAreaProps> = ({ onFileSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">
          Tap to take a photo or select from gallery
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Maximum file size: 10MB
        </p>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default FileSelectionArea;
