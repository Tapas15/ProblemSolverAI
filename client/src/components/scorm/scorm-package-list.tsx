import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PackageIcon, Trash2, Clock, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getScormPackages, deleteScormPackage, ScormPackage } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface ScormPackageListProps {
  onRefreshNeeded?: () => void;
}

export function ScormPackageList({ onRefreshNeeded }: ScormPackageListProps) {
  const [packages, setPackages] = useState<ScormPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [packageToDelete, setPackageToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPackages = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getScormPackages();
      setPackages(data);
    } catch (err: any) {
      console.error("Error fetching SCORM packages:", err);
      setError(err.message || "Failed to fetch SCORM packages");
      
      toast({
        title: "Error",
        description: "Failed to load SCORM packages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleDelete = async (name: string) => {
    try {
      await deleteScormPackage(name);
      
      toast({
        title: "Package Deleted",
        description: "SCORM package has been successfully deleted",
      });
      
      // Refresh the list
      fetchPackages();
      
      // Notify parent if needed
      if (onRefreshNeeded) {
        onRefreshNeeded();
      }
    } catch (err: any) {
      console.error("Error deleting SCORM package:", err);
      
      toast({
        title: "Error",
        description: err.message || "Failed to delete SCORM package",
        variant: "destructive",
      });
    }
    
    // Close dialog
    setPackageToDelete(null);
  };

  const confirmDelete = (name: string) => {
    setPackageToDelete(name);
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">SCORM Packages</CardTitle>
          <CardDescription>
            Manage uploaded SCORM packages
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : error ? (
            <div className="text-center py-4 text-destructive">
              <p>{error}</p>
              <Button variant="outline" onClick={fetchPackages} className="mt-2">
                Retry
              </Button>
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <PackageIcon className="mx-auto h-10 w-10 mb-3 opacity-50" />
              <p>No SCORM packages have been uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {packages.map((pkg) => (
                <div
                  key={pkg.name}
                  className="flex items-center gap-3 p-4 border rounded-md hover:bg-secondary/10 transition-colors"
                >
                  <PackageIcon className="h-8 w-8 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium truncate">{pkg.name}</h4>
                      {pkg.isValid ? (
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        Uploaded {format(new Date(pkg.uploadedAt), "MMM d, yyyy h:mm a")}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => confirmDelete(pkg.name)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={packageToDelete !== null}
        onOpenChange={(open) => !open && setPackageToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the SCORM package from the server. 
              Any modules linked to this package will no longer have access to it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => packageToDelete && handleDelete(packageToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default ScormPackageList;