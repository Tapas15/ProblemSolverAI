import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, 
  Camera, 
  MapPin, 
  ArrowLeft, 
  Share2, 
  Download, 
  Save, 
  Battery, 
  Wifi, 
  Moon, 
  Check 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CameraCapture } from '@/components/mobile/camera-capture';
import { LocationFinder } from '@/components/mobile/location-finder';
import { isNativePlatform, getPlatform, storeData, getData } from '@/lib/capacitor';
import { useLocation, Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export default function MobileFeaturesPage() {
  const [_, navigate] = useLocation();
  const platformName = getPlatform();
  const isNative = isNativePlatform();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('camera');
  const [isSaved, setIsSaved] = useState(false);

  const handleSavePreference = async () => {
    if (isNative) {
      await storeData('preferred_feature', activeTab);
      setIsSaved(true);
      toast({
        title: "Preference Saved",
        description: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} is now your default mobile feature.`,
        className: "mobile-toast"
      });
      
      // Reset saved state after 2 seconds
      setTimeout(() => setIsSaved(false), 2000);
    } else {
      toast({
        title: "Native Feature Required",
        description: "Saving preferences requires the native app.",
        variant: "destructive",
        className: "mobile-toast"
      });
    }
  };

  return (
    <div className="native-scroll pb-4">
      {/* Page Header */}
      <div className="flex items-center mb-4 py-2">
        {/* Back button removed as requested */}
        <h1 className="mobile-h1 text-[#0f172a]">Mobile Features</h1>
        <Badge 
          variant="outline" 
          className={`ml-auto ${isNative ? 'badge-blue' : 'badge-orange'}`}
        >
          <Smartphone className="h-3 w-3 mr-1" />
          {platformName.toUpperCase()}
        </Badge>
      </div>

      {/* Platform Status Card */}
      <Card className="native-card mb-5">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-[#0f172a]">Native Capabilities</CardTitle>
              <CardDescription>
                {isNative 
                  ? "Your device features are available to enhance learning"
                  : "Some features require the native mobile app"}
              </CardDescription>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isNative ? 'bg-blue-50' : 'bg-orange-50'}`}>
              <Smartphone className={`h-6 w-6 ${isNative ? 'text-[#3b82f6]' : 'text-orange-500'}`} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className={isNative ? 'badge-blue' : 'badge-orange'}>
              <Camera className="h-3 w-3 mr-1" />
              Camera {isNative ? 'Available' : 'Limited'}
            </Badge>
            <Badge variant="outline" className={isNative ? 'badge-blue' : 'badge-orange'}>
              <MapPin className="h-3 w-3 mr-1" />
              Location {isNative ? 'Available' : 'Limited'}
            </Badge>
            <Badge variant="outline" className={isNative ? 'badge-blue' : 'badge-orange'}>
              <Wifi className="h-3 w-3 mr-1" />
              Offline {isNative ? 'Available' : 'Limited'}
            </Badge>
            <Badge variant="outline" className={isNative ? 'badge-blue' : 'badge-orange'}>
              <Battery className="h-3 w-3 mr-1" />
              Optimized {isNative ? 'Yes' : 'No'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Feature Tabs */}
      <Tabs 
        defaultValue="camera" 
        className="mb-6" 
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="segmented-control w-full mb-4">
          <TabsTrigger value="camera" className="segmented-control-option flex items-center justify-center">
            <Camera className="h-4 w-4 mr-2" />
            Camera
          </TabsTrigger>
          <TabsTrigger value="location" className="segmented-control-option flex items-center justify-center">
            <MapPin className="h-4 w-4 mr-2" />
            Location
          </TabsTrigger>
        </TabsList>
        
        {/* Camera Tab */}
        <TabsContent value="camera" className="mt-0 space-y-4">
          <Card className="native-card overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-[#0f172a] flex items-center">
                <Camera className="h-5 w-5 mr-2 text-[#3b82f6]" />
                Camera Integration
              </CardTitle>
              <CardDescription>
                Document your business problem-solving in action
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CameraCapture 
                onCapture={(imagePath) => {
                  console.log("Image captured:", imagePath);
                  toast({
                    title: "Image Captured",
                    description: "Your image was saved successfully.",
                    className: "mobile-toast"
                  });
                }}
              />
            </CardContent>
            <CardFooter className="bg-slate-50 border-t border-slate-100 flex justify-between">
              <Badge variant="outline" className="badge-blue">
                {isNative ? 'Native Camera' : 'Web Camera'}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[#3b82f6] flex items-center"
                onClick={handleSavePreference}
                disabled={isSaved}
              >
                {isSaved ? <Check className="h-4 w-4 mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                {isSaved ? 'Saved' : 'Set Default'}
              </Button>
            </CardFooter>
          </Card>

          <div className="native-card p-4 bg-blue-50 border border-blue-100">
            <h3 className="font-medium text-sm text-blue-700 mb-2">Camera Feature Benefits</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                  <Check className="h-3 w-3 text-blue-600" />
                </div>
                <span>Capture business challenges in real-time</span>
              </li>
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                  <Check className="h-3 w-3 text-blue-600" />
                </div>
                <span>Document visual evidence for case studies</span>
              </li>
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                  <Check className="h-3 w-3 text-blue-600" />
                </div>
                <span>Build a visual library of business frameworks in action</span>
              </li>
            </ul>
          </div>
        </TabsContent>
        
        {/* Location Tab */}
        <TabsContent value="location" className="mt-0 space-y-4">
          <Card className="native-card overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-[#0f172a] flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-[#3b82f6]" />
                Location Services
              </CardTitle>
              <CardDescription>
                Record where your business learning happens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LocationFinder 
                onLocationFound={(position) => {
                  console.log("Location found:", position);
                  toast({
                    title: "Location Acquired",
                    description: "Your current location was successfully recorded.",
                    className: "mobile-toast"
                  });
                }}
              />
            </CardContent>
            <CardFooter className="bg-slate-50 border-t border-slate-100 flex justify-between">
              <Badge variant="outline" className="badge-blue">
                {isNative ? 'Native GPS' : 'Web Geolocation'}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[#3b82f6] flex items-center"
                onClick={handleSavePreference}
                disabled={isSaved}
              >
                {isSaved ? <Check className="h-4 w-4 mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                {isSaved ? 'Saved' : 'Set Default'}
              </Button>
            </CardFooter>
          </Card>

          <div className="native-card p-4 bg-blue-50 border border-blue-100">
            <h3 className="font-medium text-sm text-blue-700 mb-2">Location Feature Benefits</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                  <Check className="h-3 w-3 text-blue-600" />
                </div>
                <span>Track business problem-solving across locations</span>
              </li>
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                  <Check className="h-3 w-3 text-blue-600" />
                </div>
                <span>Analyze geographical patterns in your learning</span>
              </li>
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                  <Check className="h-3 w-3 text-blue-600" />
                </div>
                <span>Perfect for consultants who work across multiple client sites</span>
              </li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>

      {/* Additional Native Features */}
      <h2 className="mobile-h2 mb-3 text-[#0f172a]">Additional Mobile Features</h2>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="native-card touch-feedback">
          <CardContent className="p-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-2">
              <Download className="h-5 w-5 text-[#3b82f6]" />
            </div>
            <h3 className="font-medium text-[#0f172a] mb-1">Offline Access</h3>
            <p className="text-sm text-slate-600">Learn anytime, anywhere without internet</p>
          </CardContent>
        </Card>
        
        <Card className="native-card touch-feedback">
          <CardContent className="p-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-2">
              <Moon className="h-5 w-5 text-[#3b82f6]" />
            </div>
            <h3 className="font-medium text-[#0f172a] mb-1">Dark Mode</h3>
            <p className="text-sm text-slate-600">Reduce eye strain in low-light conditions</p>
          </CardContent>
        </Card>
        
        <Card className="native-card touch-feedback">
          <CardContent className="p-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-2">
              <Battery className="h-5 w-5 text-[#3b82f6]" />
            </div>
            <h3 className="font-medium text-[#0f172a] mb-1">Optimized Battery</h3>
            <p className="text-sm text-slate-600">Extended usage with power saving</p>
          </CardContent>
        </Card>
        
        <Card className="native-card touch-feedback">
          <CardContent className="p-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-2">
              <Share2 className="h-5 w-5 text-[#3b82f6]" />
            </div>
            <h3 className="font-medium text-[#0f172a] mb-1">Native Sharing</h3>
            <p className="text-sm text-slate-600">Share insights via native OS sharing</p>
          </CardContent>
        </Card>
      </div>

      {/* Native App Benefits */}
      <div className="native-card overflow-hidden mb-4">
        <div className="bg-gradient-to-r from-[#0f2544] to-[#19355f] px-5 py-4">
          <h3 className="text-white font-semibold">Why Go Native?</h3>
          <p className="text-[#60a5fa] text-sm mt-1">The benefits of using QuestionPro AI's mobile app</p>
        </div>
        <CardContent className="pt-4">
          <ul className="space-y-3">
            <li className="flex items-start">
              <div className="bg-blue-50 rounded-full p-1.5 mr-3 mt-0.5">
                <Camera className="h-4 w-4 text-[#3b82f6]" />
              </div>
              <span className="flex-1 text-sm">
                <strong className="text-[#0f172a]">Camera Integration:</strong> 
                <span className="text-slate-600"> Capture real-world examples of business challenges and solutions to enhance your learning.</span>
              </span>
            </li>
            <li className="flex items-start">
              <div className="bg-blue-50 rounded-full p-1.5 mr-3 mt-0.5">
                <MapPin className="h-4 w-4 text-[#3b82f6]" />
              </div>
              <span className="flex-1 text-sm">
                <strong className="text-[#0f172a]">Location Tracking:</strong> 
                <span className="text-slate-600"> Record where your learning takes place to build a personal geography of your problem-solving journey.</span>
              </span>
            </li>
            <li className="flex items-start">
              <div className="bg-blue-50 rounded-full p-1.5 mr-3 mt-0.5">
                <Smartphone className="h-4 w-4 text-[#3b82f6]" />
              </div>
              <span className="flex-1 text-sm">
                <strong className="text-[#0f172a]">Offline Learning:</strong> 
                <span className="text-slate-600"> Native apps provide better offline experience with cached content allowing you to learn anywhere, anytime.</span>
              </span>
            </li>
          </ul>
        </CardContent>
      </div>

      {!isNative && (
        <Button className="native-button w-full flex items-center justify-center" onClick={() => window.open('https://questionpro.ai/download', '_blank')}>
          <Download className="mr-2 h-4 w-4" />
          Download Native App
        </Button>
      )}
    </div>
  );
}