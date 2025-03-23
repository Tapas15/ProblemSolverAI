import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, FileIcon, X, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadScormPackage } from "@/lib/api";
import { Module } from "@shared/schema";

interface ScormUploaderProps {
  moduleId: number;
  moduleName: string;
  onUploadSuccess?: (updatedModule: Module) => void;
}

export function ScormUploader({ moduleId, moduleName, onUploadSuccess }: ScormUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file type - should be zip
      if (!selectedFile.type.includes('zip') && !selectedFile.name.endsWith('.zip')) {
        setUploadError("Only ZIP files are allowed for SCORM packages");
        return;
      }
      
      // Check file size - limit to 50MB
      if (selectedFile.size > 50 * 1024 * 1024) {
        setUploadError("File size exceeds 50MB limit");
        return;
      }
      
      setFile(selectedFile);
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadError("Please select a file first");
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      const result = await uploadScormPackage(file, moduleId);
      
      toast({
        title: "SCORM Package Uploaded",
        description: "Your SCORM package has been successfully uploaded and linked to this module.",
      });
      
      if (onUploadSuccess) {
        onUploadSuccess(result.module);
      }
      
      // Reset the form
      setFile(null);
      const fileInput = document.getElementById('scorm-file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error: any) {
      console.error("SCORM upload error:", error);
      setUploadError(error.message || "Failed to upload SCORM package");
      
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload SCORM package",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelectedFile = () => {
    setFile(null);
    const fileInput = document.getElementById('scorm-file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Upload SCORM Package</CardTitle>
        <CardDescription>
          Upload a SCORM package (ZIP file) for module: {moduleName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="scorm-file">SCORM Package (ZIP file)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="scorm-file"
                type="file"
                accept=".zip"
                onChange={handleFileChange}
                disabled={isUploading}
                className="flex-1"
              />
              {file && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={clearSelectedFile}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {uploadError && (
              <p className="text-sm text-destructive mt-1">{uploadError}</p>
            )}
          </div>
          
          {file && (
            <div className="flex items-center gap-2 p-3 border rounded-md bg-secondary/20">
              <FileIcon className="h-5 w-5 text-primary" />
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleUpload} 
          disabled={!file || isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload SCORM Package
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ScormUploader;