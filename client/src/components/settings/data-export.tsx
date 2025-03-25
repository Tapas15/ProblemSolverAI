import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, DownloadCloud, FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportUserData } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function DataExport() {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [format, setFormat] = useState('json');

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await exportUserData(format);
      
      // Create a temporary link and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Data Export Complete",
        description: "Your data has been successfully exported",
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileDown className="h-5 w-5" /> Data Export
        </CardTitle>
        <CardDescription>
          Download all your personal data from the platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertTitle>Privacy Notice</AlertTitle>
          <AlertDescription>
            The export includes your profile information, learning progress, quiz attempts, and AI conversations.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="xml">XML</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleExport} 
          disabled={isExporting}
          className="flex items-center gap-2"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Exporting...
            </>
          ) : (
            <>
              <DownloadCloud className="h-4 w-4" /> Export My Data
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}