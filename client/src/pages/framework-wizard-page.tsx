import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, ArrowRight, Check, Save } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { WizardSession, WizardTemplate, Framework } from "@shared/schema";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { createPortal } from "react-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function FrameworkWizardPage() {
  const { frameworkId, sessionId } = useParams<{ frameworkId?: string; sessionId?: string }>();
  const [location, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch framework details
  const { data: framework, isLoading: isLoadingFramework } = useQuery({
    queryKey: ["/api/frameworks", parseInt(frameworkId || "0")],
    enabled: !!frameworkId && Number(frameworkId) > 0,
  });

  // Fetch wizard session if sessionId is provided
  const { data: session, isLoading: isLoadingSession } = useQuery({
    queryKey: ["/api/wizard-sessions", sessionId ? parseInt(sessionId) : null],
    enabled: !!sessionId,
  });

  // Fetch wizard templates for the framework
  const { data: templates, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ["/api/wizard-templates/framework", parseInt(frameworkId || "0")],
    enabled: !!frameworkId && Number(frameworkId) > 0,
  });

  // Fetch current step template
  const { data: currentTemplate, isLoading: isLoadingCurrentTemplate } = useQuery({
    queryKey: ["/api/wizard-templates/framework", parseInt(frameworkId || "0"), "step", currentStep],
    enabled: !!frameworkId && Number(frameworkId) > 0 && currentStep > 0,
  });

  // Create/Update session mutation
  const saveMutation = useMutation({
    mutationFn: async (sessionData: Partial<WizardSession>) => {
      if (sessionId) {
        // Update existing session
        const res = await fetch(`/api/wizard-sessions/${sessionId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sessionData),
        });
        if (!res.ok) throw new Error("Failed to update session");
        return await res.json();
      } else {
        // Create new session
        const res = await fetch("/api/wizard-sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...sessionData,
            userId: user?.id,
            frameworkId: parseInt(frameworkId || "0"),
            currentStep: currentStep,
            status: "in_progress",
          }),
        });
        if (!res.ok) throw new Error("Failed to create session");
        return await res.json();
      }
    },
    onSuccess: (data) => {
      setDirty(false);
      if (!sessionId) {
        // If it was a new session, update the URL to include the sessionId
        navigate(`/framework-wizard/${frameworkId}/${data.id}`);
      }
      
      queryClient.invalidateQueries({
        queryKey: ["/api/wizard-sessions"],
      });
      
      toast({
        title: "Progress saved",
        description: "Your work has been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Initialize from session data
  useEffect(() => {
    if (session) {
      setCurrentStep(session.currentStep || 1);
      try {
        if (session.data) {
          const sessionData = JSON.parse(session.data);
          setInputs(sessionData);
        }
      } catch (error) {
        console.error("Failed to parse session data:", error);
      }
    }
  }, [session]);

  // Update max steps when templates load
  useEffect(() => {
    if (templates?.length) {
      setMaxStep(templates.length);
    }
  }, [templates]);

  const handleInputChange = (name: string, value: string) => {
    setInputs((prev) => ({ ...prev, [name]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    saveMutation.mutate({
      id: session?.id,
      currentStep,
      data: JSON.stringify(inputs),
      status: currentStep >= maxStep ? "completed" : "in_progress",
    });
  };

  const handleNextStep = () => {
    if (currentStep < maxStep) {
      // Save current progress
      handleSave();
      // Go to next step
      setCurrentStep(currentStep + 1);
    } else {
      // If on last step, mark as complete and save
      saveMutation.mutate({
        id: session?.id,
        currentStep,
        data: JSON.stringify(inputs),
        status: "completed",
      });
      
      // Show completion message
      toast({
        title: "Wizard completed",
        description: "You've successfully completed this framework wizard!",
      });
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      // Save current progress first
      handleSave();
      // Then go back
      setCurrentStep(currentStep - 1);
    }
  };

  // Generate dynamic input component based on template field type
  const renderInputField = (field: any) => {
    switch (field.type) {
      case "text":
        return (
          <div className="mb-4" key={field.id}>
            <label htmlFor={field.id} className="block text-sm font-medium mb-1">
              {field.label}
            </label>
            <input
              id={field.id}
              type="text"
              className="w-full p-2 border rounded-md"
              value={inputs[field.id] || ""}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder || ""}
            />
            {field.helperText && (
              <p className="mt-1 text-sm text-gray-500">{field.helperText}</p>
            )}
          </div>
        );
      case "textarea":
        return (
          <div className="mb-4" key={field.id}>
            <label htmlFor={field.id} className="block text-sm font-medium mb-1">
              {field.label}
            </label>
            <textarea
              id={field.id}
              className="w-full p-2 border rounded-md min-h-[100px]"
              value={inputs[field.id] || ""}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder || ""}
            />
            {field.helperText && (
              <p className="mt-1 text-sm text-gray-500">{field.helperText}</p>
            )}
          </div>
        );
      case "select":
        return (
          <div className="mb-4" key={field.id}>
            <label htmlFor={field.id} className="block text-sm font-medium mb-1">
              {field.label}
            </label>
            <select
              id={field.id}
              className="w-full p-2 border rounded-md"
              value={inputs[field.id] || ""}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
            >
              <option value="">Select an option</option>
              {field.options?.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {field.helperText && (
              <p className="mt-1 text-sm text-gray-500">{field.helperText}</p>
            )}
          </div>
        );
      case "radio":
        return (
          <div className="mb-4" key={field.id}>
            <label className="block text-sm font-medium mb-1">{field.label}</label>
            <div className="space-y-2">
              {field.options?.map((option: any) => (
                <div key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    id={`${field.id}-${option.value}`}
                    name={field.id}
                    value={option.value}
                    checked={inputs[field.id] === option.value}
                    onChange={() => handleInputChange(field.id, option.value)}
                    className="mr-2"
                  />
                  <label htmlFor={`${field.id}-${option.value}`}>{option.label}</label>
                </div>
              ))}
            </div>
            {field.helperText && (
              <p className="mt-1 text-sm text-gray-500">{field.helperText}</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoadingFramework || isLoadingTemplates || (sessionId && isLoadingSession)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!framework) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Framework not found. Please select a valid framework.
          </AlertDescription>
        </Alert>
        <Button 
          className="mt-4" 
          onClick={() => navigate("/frameworks")}
        >
          Back to Frameworks
        </Button>
      </div>
    );
  }

  // Render portal for fixed progress bar
  const renderProgressBar = () => {
    const progressBarRoot = document.getElementById('progress-bar-root');
    if (!progressBarRoot) return null;

    const percentage = (currentStep / maxStep) * 100;
    
    return createPortal(
      <div className="fixed top-16 left-0 right-0 px-4 py-2 bg-background z-50 border-b">
        <div className="flex justify-between items-center mb-1 text-sm">
          <div>Step {currentStep} of {maxStep}</div>
          <div>{percentage.toFixed(0)}% Complete</div>
        </div>
        <Progress value={percentage} className="h-2" />
      </div>,
      progressBarRoot
    );
  };

  return (
    <div className="p-4 pt-20 relative">
      <div id="progress-bar-root" />
      {renderProgressBar()}
      
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{framework.name} Wizard</h1>
        <p className="text-gray-500">Interactive guided framework application</p>
      </div>
      
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{currentTemplate?.title || `Step ${currentStep}`}</CardTitle>
        </CardHeader>
        <CardContent>
          {currentTemplate ? (
            <div>
              {currentTemplate.description && (
                <div className="mb-6">
                  <p>{currentTemplate.description}</p>
                </div>
              )}
              
              <Separator className="my-4" />
              
              {/* Dynamic form fields */}
              {currentTemplate.fields && (
                <div className="mt-4">
                  {JSON.parse(currentTemplate.fields).map((field: any) => 
                    renderInputField(field)
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p>Loading step content...</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousStep}
            disabled={currentStep <= 1 || saveMutation.isPending}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={!dirty || saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save
            </Button>
            
            <Button
              onClick={handleNextStep}
              disabled={saveMutation.isPending}
            >
              {currentStep >= maxStep ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Complete
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Previous steps summary (collapsible) */}
      {currentStep > 1 && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4 dark:bg-gray-800">
          <h3 className="text-lg font-medium mb-2">Previous Steps Summary</h3>
          <div className="space-y-4">
            {/* We would map through previous steps here */}
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Your progress is automatically saved. You can review and edit previous steps by clicking the Previous button.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}