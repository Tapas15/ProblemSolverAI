import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Loader2, PlusCircle, Trash2, Play, FileEdit } from "lucide-react";
import { WizardSession, Framework } from "@shared/schema";
import { useLocation } from "wouter";

interface FrameworkWizardListProps {
  frameworkId: number;
}

export function FrameworkWizardList({ frameworkId }: FrameworkWizardListProps) {
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<number | null>(null);

  // Fetch framework details
  const { data: framework, isLoading: isLoadingFramework } = useQuery({
    queryKey: ["/api/frameworks", frameworkId],
  });

  // Fetch wizard sessions for this framework
  const { 
    data: sessions = [], 
    isLoading: isLoadingSessions,
    refetch: refetchSessions
  } = useQuery({
    queryKey: ["/api/wizard-sessions/framework", frameworkId],
    queryFn: async () => {
      if (!user || !frameworkId) return [];
      try {
        const response = await fetch(`/api/wizard-sessions/framework/${frameworkId}`);
        if (!response.ok) {
          // If the server isn't ready for this feature yet, return an empty array
          console.warn("Failed to fetch wizard sessions:", response.statusText);
          return [];
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching wizard sessions:", error);
        return [];
      }
    },
    enabled: !!user && !!frameworkId,
  });

  // Create new session mutation
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      // Create a default session based on the schema requirements
      const sessionData = {
        userId: user?.id,
        frameworkId,
        title: `${framework?.name || 'Framework'} Session`,
        problemStatement: 'Working on my business problem...',
        currentStep: 1,
        totalSteps: 5, // Default value, will be updated based on template
        data: JSON.stringify({}),
        isCompleted: false,
        isShared: false,
        shareLink: null
      };
      
      const res = await fetch("/api/wizard-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData),
      });
      
      if (!res.ok) throw new Error("Failed to create wizard session");
      return await res.json();
    },
    onSuccess: (data) => {
      setIsCreateDialogOpen(false);
      navigate(`/framework-wizard/${frameworkId}/${data.id}`);
      queryClient.invalidateQueries({
        queryKey: ["/api/wizard-sessions"],
      });
      toast({
        title: "Success",
        description: "New wizard session created. Let's get started!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create session",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      const res = await fetch(`/api/wizard-sessions/${sessionId}`, {
        method: "DELETE",
      });
      
      if (!res.ok) throw new Error("Failed to delete wizard session");
      return sessionId;
    },
    onSuccess: () => {
      setSessionToDelete(null);
      queryClient.invalidateQueries({
        queryKey: ["/api/wizard-sessions"],
      });
      toast({
        title: "Success",
        description: "Wizard session deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete session",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStartNewSession = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCreateSession = () => {
    createSessionMutation.mutate();
  };

  const handleContinueSession = (sessionId: number) => {
    navigate(`/framework-wizard/${frameworkId}/${sessionId}`);
  };

  const handleDeleteSession = (sessionId: number) => {
    setSessionToDelete(sessionId);
  };

  const confirmDeleteSession = () => {
    if (sessionToDelete) {
      deleteSessionMutation.mutate(sessionToDelete);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (session: WizardSession) => {
    // Use isCompleted field instead of status
    if (session.isCompleted) {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Completed</Badge>;
    } else {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">In Progress</Badge>;
    }
  };

  if (isLoadingFramework || isLoadingSessions) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-full max-w-[250px]" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex justify-end w-full gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {framework?.name} Wizard Sessions
        </h2>
        <Button onClick={handleStartNewSession}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Start New Session
        </Button>
      </div>

      {sessions && sessions.length > 0 ? (
        <div className="space-y-4">
          {sessions.map((session: WizardSession) => (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    Session #{session.id}
                  </CardTitle>
                  {getStatusBadge(session)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm text-gray-500">
                  <div>
                    Step {session.currentStep} of {session.totalSteps}
                  </div>
                  <div>
                    Last updated: {session.updatedAt ? new Date(session.updatedAt).toLocaleString() : "N/A"}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex justify-end w-full gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteSession(session.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleContinueSession(session.id)}
                  >
                    {session.isCompleted ? (
                      <>
                        <FileEdit className="mr-2 h-4 w-4" />
                        View/Edit
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Continue
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="mb-4 text-gray-500">
              You haven't started any wizard sessions for this framework yet.
            </p>
            <Button onClick={handleStartNewSession}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Start New Session
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create New Session Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Wizard Session</DialogTitle>
            <DialogDescription>
              You're about to start a new guided session for the {framework?.name} framework.
              This will help you apply this framework step by step to solve your business problems.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500">
              Each session is saved automatically, so you can pause and resume whenever you need to.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateSession}
              disabled={createSessionMutation.isPending}
            >
              {createSessionMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Start New Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={sessionToDelete !== null} 
        onOpenChange={(open) => !open && setSessionToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this wizard session and all of its data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteSession}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteSessionMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}