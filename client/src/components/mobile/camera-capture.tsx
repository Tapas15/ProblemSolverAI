import React, { useState } from 'react';
import { takePhoto } from '@/lib/capacitor';
import { Button } from "@/components/ui/button";
import { Camera, ImageOff } from 'lucide-react';
import { isNativePlatform } from '@/lib/capacitor';

interface CameraCaptureProps {
  onCapture?: (imagePath: string) => void;
  className?: string;
}

export function CameraCapture({ onCapture, className = '' }: CameraCaptureProps) {
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTakePhoto = async () => {
    if (!isNativePlatform()) {
      setError('Camera is only available on native mobile devices');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const photoPath = await takePhoto();
      setImagePath(photoPath);
      
      if (photoPath && onCapture) {
        onCapture(photoPath);
      } else if (!photoPath) {
        setError('Failed to capture photo');
      }
    } catch (err) {
      setError('Error capturing photo: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {imagePath ? (
        <div className="relative w-full max-w-md mb-3 rounded-lg overflow-hidden">
          <img 
            src={imagePath} 
            alt="Captured" 
            className="w-full h-auto rounded-lg border border-gray-200 shadow-sm"
          />
          <Button 
            variant="outline" 
            size="sm"
            className="absolute bottom-2 right-2 bg-white"
            onClick={() => setImagePath(null)}
          >
            Remove
          </Button>
        </div>
      ) : (
        <div className="w-full max-w-md h-40 mb-3 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50">
          {error ? (
            <div className="text-center px-4">
              <ImageOff className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          ) : (
            <div className="text-center px-4">
              <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">No image captured yet</p>
            </div>
          )}
        </div>
      )}

      <Button 
        onClick={handleTakePhoto} 
        disabled={loading}
        className="flex items-center"
      >
        <Camera className="mr-2 h-4 w-4" />
        {loading ? 'Capturing...' : 'Take Photo'}
      </Button>
    </div>
  );
}