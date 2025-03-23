import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Redirect } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ScormPackageList } from '@/components/scorm/scorm-package-list';
import { getFrameworks, getModules } from '@/lib/api';
import { Framework, Module } from '@shared/schema';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileCode, Book, Home } from 'lucide-react';
import { Link } from 'wouter';

export default function ScormAdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<number | null>(null);
  
  const { data: frameworks, isLoading: frameworksLoading } = useQuery({
    queryKey: ['/api/frameworks'],
    queryFn: () => getFrameworks(),
    enabled: !!user,
  });
  
  const { data: modules, isLoading: modulesLoading } = useQuery({
    queryKey: ['/api/frameworks', selectedFrameworkId, 'modules'],
    queryFn: () => selectedFrameworkId ? getModules(selectedFrameworkId) : Promise.resolve([]),
    enabled: !!selectedFrameworkId,
  });
  
  const isAdmin = user && user.username === 'admin';
  
  // Loading state
  if (authLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col space-y-8">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  // Redirect non-admin users
  if (!isAdmin) {
    return <Redirect to="/" />;
  }
  
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">SCORM Package Administration</h1>
            <p className="text-muted-foreground mt-1">
              Manage SCORM packages for learning modules
            </p>
          </div>
          
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Frameworks</CardTitle>
                <CardDescription>
                  Select a framework to view its modules
                </CardDescription>
              </CardHeader>
              <CardContent>
                {frameworksLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {frameworks?.map((framework: Framework) => (
                      <Button
                        key={framework.id}
                        variant={selectedFrameworkId === framework.id ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => setSelectedFrameworkId(framework.id)}
                      >
                        <Book className="h-4 w-4 mr-2" />
                        {framework.name}
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-9">
            <Tabs defaultValue="packages">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="packages">All Packages</TabsTrigger>
                  <TabsTrigger value="modules" disabled={!selectedFrameworkId}>
                    Framework Modules
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="packages" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>SCORM Packages</CardTitle>
                    <CardDescription>
                      All SCORM packages uploaded to the platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScormPackageList />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="modules" className="mt-0">
                {!selectedFrameworkId ? (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-center text-muted-foreground">
                        Please select a framework to view its modules
                      </p>
                    </CardContent>
                  </Card>
                ) : modulesLoading ? (
                  <Card>
                    <CardHeader>
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-72" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        Modules for {frameworks?.find(f => f.id === selectedFrameworkId)?.name}
                      </CardTitle>
                      <CardDescription>
                        Associate SCORM packages with specific modules
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {modules?.map((module: Module) => (
                          <div key={module.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h3 className="font-medium">{module.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {module.description}
                                </p>
                              </div>
                              
                              {module.scormPath ? (
                                <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                                  <FileCode className="h-3 w-3" />
                                  SCORM Enabled
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-muted-foreground flex items-center gap-1">
                                  <FileCode className="h-3 w-3" />
                                  No SCORM Content
                                </Badge>
                              )}
                            </div>
                            
                            <div className="text-sm text-muted-foreground mb-3">
                              <span className="font-medium">Module ID:</span> {module.id}
                              {module.scormPath && (
                                <>
                                  <br />
                                  <span className="font-medium">SCORM Path:</span> {module.scormPath}
                                </>
                              )}
                            </div>
                            
                            <Link href={`/frameworks/${selectedFrameworkId}`}>
                              <Button variant="outline" size="sm">
                                Go to Module
                              </Button>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}