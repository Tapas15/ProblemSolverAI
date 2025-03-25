import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Camera, MapPin, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CameraCapture } from '@/components/mobile/camera-capture';
import { LocationFinder } from '@/components/mobile/location-finder';
import { isNativePlatform, getPlatform } from '@/lib/capacitor';
import { useLocation, Link } from 'wouter';

export default function MobileFeaturesPage() {
  const [_, navigate] = useLocation();
  const platformName = getPlatform();
  const isNative = isNativePlatform();

  return (
    <div className="container max-w-4xl px-4 py-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          className="mr-2 p-2" 
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Mobile Features</h1>
        <Badge 
          variant="outline" 
          className="ml-3"
        >
          <Smartphone className="h-3 w-3 mr-1" />
          {platformName}
        </Badge>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Native Device Capabilities</CardTitle>
          <CardDescription>
            QuestionPro AI uses your device's features to enhance your learning experience.
            {!isNative && (
              <span className="block mt-2 text-orange-500">
                ⚠️ You are currently viewing this in a web browser. Native features are only available when using the iOS or Android app.
              </span>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="camera" className="mb-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="camera" className="flex items-center">
            <Camera className="h-4 w-4 mr-2" />
            Camera
          </TabsTrigger>
          <TabsTrigger value="location" className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            Location
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="camera" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Camera Integration</CardTitle>
              <CardDescription>
                Document your progress by capturing images related to your learning journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CameraCapture 
                onCapture={(imagePath) => {
                  console.log("Image captured:", imagePath);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="location" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Location Services</CardTitle>
              <CardDescription>
                Track your learning location to build a geographic history of your journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LocationFinder 
                onLocationFound={(position) => {
                  console.log("Location found:", position);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Why Use Native Features?</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start">
              <div className="bg-blue-100 rounded-full p-1 mr-2 mt-0.5">
                <Camera className="h-4 w-4 text-primary" />
              </div>
              <span className="flex-1">
                <strong>Camera:</strong> Capture real-world examples of business challenges and solutions to enhance your learning.
              </span>
            </li>
            <li className="flex items-start">
              <div className="bg-blue-100 rounded-full p-1 mr-2 mt-0.5">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <span className="flex-1">
                <strong>Location:</strong> Record where your learning takes place to build a personal geography of your problem-solving journey.
              </span>
            </li>
            <li className="flex items-start mt-4">
              <div className="bg-blue-100 rounded-full p-1 mr-2 mt-0.5">
                <Smartphone className="h-4 w-4 text-primary" />
              </div>
              <span className="flex-1">
                <strong>Offline Learning:</strong> Native apps provide better offline experience with cached content allowing you to learn anywhere, anytime.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}