import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, AlertCircle } from 'lucide-react';
import { getCurrentLocation, isNativePlatform } from '@/lib/capacitor';
import { Position } from '@capacitor/geolocation';

interface LocationFinderProps {
  onLocationFound?: (position: Position) => void;
  className?: string;
}

export function LocationFinder({ onLocationFound, className = '' }: LocationFinderProps) {
  const [location, setLocation] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetLocation = async () => {
    if (!isNativePlatform()) {
      setError('Location services are only available on native mobile devices');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const position = await getCurrentLocation();
      
      if (position) {
        setLocation(position);
        if (onLocationFound) {
          onLocationFound(position);
        }
      } else {
        setError('Unable to get your location');
      }
    } catch (err) {
      setError('Error getting location: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const formatCoordinate = (value: number) => {
    return value.toFixed(6);
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {location ? (
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Latitude:</span>
                <span className="font-mono">{formatCoordinate(location.coords.latitude)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Longitude:</span>
                <span className="font-mono">{formatCoordinate(location.coords.longitude)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Accuracy:</span>
                <span className="font-mono">{Math.round(location.coords.accuracy)} meters</span>
              </div>
              {location.coords.altitude !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Altitude:</span>
                  <span className="font-mono">{Math.round(location.coords.altitude)} meters</span>
                </div>
              )}
              <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                <span>Captured: {new Date(location.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : null}

      <Button 
        onClick={handleGetLocation} 
        disabled={loading}
        className="flex items-center"
        variant={location ? "outline" : "default"}
      >
        <MapPin className="mr-2 h-4 w-4" />
        {loading ? 'Getting Location...' : location ? 'Update Location' : 'Get My Location'}
      </Button>
    </div>
  );
}