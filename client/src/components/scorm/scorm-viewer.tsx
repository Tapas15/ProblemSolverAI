import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, ExternalLink, Maximize2, FileCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { scormApi } from "@/lib/api";

interface ScormViewerProps {
  moduleName: string;
  scormPath: string;
}

export function ScormViewer({ moduleName, scormPath }: ScormViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    
    async function loadScormContent() {
      try {
        setIsLoading(true);
        setIsError(false);
        
        // Load the SCORM API wrapper script
        const apiLoaded = await scormApi.loadWrapper("scorm2004");
        
        if (!apiLoaded) {
          throw new Error("Failed to load SCORM API");
        }
        
        if (mounted) {
          setIsLoading(false);
        }
      } catch (error: any) {
        console.error("Error loading SCORM content:", error);
        
        if (mounted) {
          setIsLoading(false);
          setIsError(true);
          setErrorMessage(error.message || "Failed to load SCORM content");
          
          toast({
            title: "SCORM Error",
            description: error.message || "Failed to load SCORM content",
            variant: "destructive",
          });
        }
      }
    }
    
    loadScormContent();
    
    // Initialize SCORM API when iframe content loads
    function handleIframeLoad() {
      try {
        // Initialize the SCORM session
        const initialized = scormApi.initialize();
        
        if (!initialized) {
          console.error("Failed to initialize SCORM API");
        } else {
          console.log("SCORM API initialized successfully");
          
          // Set initial values for CMI data
          scormApi.setValue("cmi.core.lesson_status", "incomplete");
          scormApi.setValue("cmi.core.student_name", "User");
          scormApi.commit();
        }
      } catch (error) {
        console.error("Error in SCORM initialization:", error);
      }
    }
    
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener("load", handleIframeLoad);
    }
    
    return () => {
      mounted = false;
      // Terminate SCORM session on component unmount
      try {
        scormApi.terminate();
      } catch (error) {
        console.error("Error terminating SCORM session:", error);
      }
      
      // Clean up event listener
      if (iframe) {
        iframe.removeEventListener("load", handleIframeLoad);
      }
    };
  }, [scormPath]);
  
  const toggleFullscreen = () => {
    if (!iframeRef.current) return;
    
    if (!isFullscreen) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };
  
  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);
  
  const openInNewTab = () => {
    window.open(scormPath, "_blank");
  };

  if (isError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {errorMessage || "Failed to load SCORM content"}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>SCORM Content: {moduleName}</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleFullscreen}
              title="Fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline"
              size="icon"
              onClick={openInNewTab}
              title="Open in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Interactive SCORM content for this module
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="relative w-full">
            <iframe
              ref={iframeRef}
              src={scormPath}
              className="w-full h-[600px] border-0 rounded-md"
              title={`SCORM Content: ${moduleName}`}
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-pointer-lock"
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <FileCode className="h-3 w-3" />
          <span>SCORM 2004 content</span>
        </div>
      </CardFooter>
    </Card>
  );
}

export default ScormViewer;