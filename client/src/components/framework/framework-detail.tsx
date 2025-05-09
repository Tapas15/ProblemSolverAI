import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Framework, Module } from '@shared/schema';
import { 
  getFramework, 
  getModules, 
  updateModuleCompletionWithTracking, 
  trackModuleCompletion,
  trackFrameworkCompletion
} from '@/lib/api';
import { Check, ChevronDown, ChevronUp, Clock, GraduationCap, X, ClipboardCheck, FileCode } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import ScormViewer from '@/components/scorm/scorm-viewer';
import ScormUploader from '@/components/scorm/scorm-uploader';
import GradientImage from '@/components/ui/gradient-image';

interface FrameworkDetailProps {
  isOpen: boolean;
  onClose: () => void;
  framework?: Framework;
  modules?: Module[];
  isLoading?: boolean;
}

const FrameworkDetail: React.FC<FrameworkDetailProps> = ({
  isOpen,
  onClose,
  framework,
  modules = [],
  isLoading = false,
}) => {
  const [expandedModule, setExpandedModule] = useState<number | null>(0); // First module expanded by default
  // Use local state for modules to ensure UI updates immediately
  const [localModules, setLocalModules] = useState<Module[]>(modules);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [caseStudiesOpen, setCaseStudiesOpen] = useState(false); // Added case studies state
  const [practicalApplicationOpen, setPracticalApplicationOpen] = useState(false); // Added practical application state

  // Keep localModules in sync with modules prop
  useEffect(() => {
    setLocalModules(modules);
  }, [modules]);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleModule = (moduleId: number) => {
    if (expandedModule === moduleId) {
      setExpandedModule(null);
    } else {
      setExpandedModule(moduleId);

      // Scroll to the selected module
      setTimeout(() => {
        const moduleElement = document.getElementById(`module-${moduleId}`);
        if (moduleElement) {
          moduleElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start'
          });
        }
      }, 100);
    }
  };

  const completeModuleMutation = useMutation({
    mutationFn: ({ moduleId, completed, moduleName }: { moduleId: number; completed: boolean; moduleName?: string }) => 
      // Use enhanced tracking version for module completion
      updateModuleCompletionWithTracking(moduleId, completed),
    onSuccess: (updatedModule) => {
      // Invalidate all relevant queries to ensure UI updates correctly
      queryClient.invalidateQueries({ queryKey: ['/api/user/progress'] });
      queryClient.invalidateQueries({ queryKey: ['/api/all-modules-by-framework'] });

      if (framework) {
        queryClient.invalidateQueries({ queryKey: [`/api/frameworks/${framework.id}/modules`] });

        // Force module update in the local state for immediate UI update
        if (updatedModule && modules) {
          // Update modules state directly for immediate UI response
          setLocalModules((prevModules: Module[]) => 
            prevModules.map((m: Module) => 
              m.id === updatedModule.id ? {...m, completed: updatedModule.completed} : m
            )
          );

          // Apply visual changes directly to DOM for immediate feedback
          window.setTimeout(() => {
            const moduleElement = document.getElementById(`module-${updatedModule.id}`);
            if (moduleElement) {
              // Update the module element's appearance
              if (updatedModule.completed) {
                moduleElement.classList.add('module-completed');

                // Update header section
                const headerSection = moduleElement.querySelector('.bg-gray-50');
                if (headerSection) {
                  headerSection.className = headerSection.className.replace('bg-gray-50', 'bg-green-50');
                }

                // Update module number badge
                const badge = moduleElement.querySelector('.bg-gray-300');
                if (badge) {
                  badge.className = badge.className.replace('bg-gray-300', 'bg-green-500');
                }

                // Update the module title
                const title = moduleElement.querySelector('h4');
                if (title && !title.className.includes('text-green-700')) {
                  title.className += ' text-green-700';
                }

                // Update the border
                moduleElement.className = moduleElement.className.replace('border-gray-200', 'border-green-300');
              } else {
                moduleElement.classList.remove('module-completed');

                // Revert all green styling
                const headerSection = moduleElement.querySelector('.bg-green-50');
                if (headerSection) {
                  headerSection.className = headerSection.className.replace('bg-green-50', 'bg-gray-50');
                }

                const badge = moduleElement.querySelector('.bg-green-500');
                if (badge) {
                  badge.className = badge.className.replace('bg-green-500', 'bg-gray-300');
                }

                const title = moduleElement.querySelector('.text-green-700');
                if (title) {
                  title.className = title.className.replace('text-green-700', '');
                }

                moduleElement.className = moduleElement.className.replace('border-green-300', 'border-gray-200');
              }
            }
          }, 50);
        }

        // Track module completion with xAPI if the module was completed
        if (updatedModule.completed) {
          // Track additional xAPI event
          trackModuleCompletion(
            updatedModule.id,
            updatedModule.name,
            updatedModule.frameworkId
          ).catch(error => {
            console.error("Error tracking module completion:", error);
            // Continue even if tracking fails
          });

          // Check if all modules are completed to track framework completion
          const allModules = localModules || [];
          const completedModulesCount = allModules.filter(m => m.completed || m.id === updatedModule.id).length;

          if (completedModulesCount === allModules.length) {
            trackFrameworkCompletion(
              framework.id,
              framework.name,
              completedModulesCount,
              allModules.length
            ).catch(error => {
              console.error("Error tracking framework completion:", error);
              // Continue even if tracking fails
            });
          }
        }
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update module status",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleModuleStatusChange = (moduleId: number, completed: boolean, moduleName?: string) => {
    completeModuleMutation.mutate({ 
      moduleId, 
      completed, 
      moduleName 
    }, {
      onSuccess: (updatedModule) => {
        if (completed) {
          // Find the index of current module - use localModules for consistency
          const currentModuleIndex = localModules.findIndex(m => m.id === moduleId);

          // If there's a next module, expand it
          if (currentModuleIndex >= 0 && currentModuleIndex < localModules.length - 1) {
            const nextModule = localModules[currentModuleIndex + 1];

            // Show toast notification about success and navigating to next module
            toast({
              title: `Module completed!`,
              description: `Moving to next module: "${nextModule.name}"`,
              variant: "default",
            });

            // Set timeout to let the current module completion animation/styling finish
            setTimeout(() => {
              setExpandedModule(nextModule.id);

              // Wait for the DOM to update, then scroll to the next module
              setTimeout(() => {
                const nextModuleElement = document.getElementById(`module-${nextModule.id}`);
                if (nextModuleElement) {
                  // Smooth scroll to the next module
                  nextModuleElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start'
                  });
                }
              }, 100);
            }, 300);
          } else {
            // This was the last module
            toast({
              title: "Congratulations!",
              description: "You've completed all modules in this framework!",
              variant: "default",
            });
          }
        }
      }
    });
  };

  // AI functionality removed

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center overflow-y-auto">
      <div className="bg-white w-full md:w-4/5 md:mx-auto md:my-8 md:rounded-lg overflow-hidden flex flex-col shadow-xl max-h-[90vh]">
        <div className="p-5 bg-gradient-to-r from-[#9545ff] to-[#ff59b2] text-white flex justify-between items-center">
          <h2 className="text-xl font-bold font-header">
            {isLoading ? <Skeleton className="h-6 w-40 bg-white/30" /> : framework?.name}
          </h2>
          <button className="focus:outline-none" onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header section */}
            <div className="mb-8 pb-6 border-b border-gray-200">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-24 bg-gradient-to-r from-[#9545ff]/10 to-[#ff59b2]/10" />
                  <Skeleton className="h-4 w-full bg-gradient-to-r from-[#9545ff]/10 to-[#ff59b2]/10" />
                  <Skeleton className="h-4 w-3/4 bg-gradient-to-r from-[#9545ff]/10 to-[#ff59b2]/10" />
                </div>
              ) : (
                <>
                  <div className="mb-6 rounded-lg overflow-hidden bg-gray-100">
                    <GradientImage
                      imageUrl={framework?.image_url || undefined}
                      frameworkId={framework?.id || 1}
                      name={framework?.name || 'Framework'}
                      width="100%"
                      height="256px"
                      className="w-full h-64"
                      alt={framework?.name || 'Framework'}
                    />
                  </div>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-4 flex-wrap gap-2">
                        {framework?.status === 'completed' ? (
                          <Badge className="bg-green-100 text-green-800 mr-3">Completed</Badge>
                        ) : framework?.status === 'in_progress' ? (
                          <Badge className="bg-yellow-100 text-yellow-800 mr-3">In Progress</Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-800 mr-3">Not Started</Badge>
                        )}

                        <span className="flex items-center text-xs text-gray-500 mr-3">
                          <Clock className="mr-1 h-3 w-3" /> {framework?.duration} min
                        </span>

                        <span className="flex items-center text-xs text-gray-500">
                          <GraduationCap className="mr-1 h-3 w-3" /> {framework?.level}
                        </span>
                      </div>

                      <p className="text-gray-700">{framework?.description}</p>
                    </div>

                    {framework && (
                      <Link to={`/quizzes/${framework.id}`}>
                        <Button variant="outline" className="ml-4 border-[#9545ff]/60 text-[#9545ff] hover:bg-[#9545ff]/5">
                          <ClipboardCheck className="h-4 w-4 mr-2" />
                          Take Quizzes
                        </Button>
                      </Link>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modules section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold font-header text-primary mb-4">Learning Modules</h3>

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3">
                        <Skeleton className="h-6 w-40 bg-gradient-to-r from-[#9545ff]/10 to-[#ff59b2]/10" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Use localModules state for rendering to ensure immediate UI updates */}
                  {localModules.map((module) => (
                    <div id={`module-${module.id}`} key={module.id} className={`border ${module.completed ? 'border-green-300 shadow-sm' : 'border-gray-200'} ${expandedModule === module.id ? 'module-active' : ''} rounded-lg overflow-hidden`}>
                      <div 
                        className={`${module.completed ? 'bg-green-50' : 'bg-gray-50'} px-4 py-3 flex justify-between items-center cursor-pointer`}
                        onClick={() => toggleModule(module.id)}
                      >
                        <div className="flex items-center">
                          <div className={`h-7 w-7 rounded-full ${
                            module.completed ? 'bg-green-500 text-white shadow-sm ring-1 ring-green-200' : 'bg-gray-300 text-white'
                          } flex items-center justify-center mr-3`}>
                            <Check className={`h-4 w-4 ${module.completed ? 'opacity-100' : 'opacity-0'}`} />
                            <span className={`absolute ${module.completed ? 'opacity-0' : 'opacity-100'}`}>{module.id}</span>
                          </div>
                          <h4 className={`font-medium ${module.completed ? 'text-green-700' : ''}`}>{module.name}</h4>
                          {module.completed && (
                            <Badge className="ml-2 bg-green-100 text-green-800 text-xs">Completed</Badge>
                          )}
                        </div>
                        <div className="flex items-center">
                          {module.completed && (
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                          )}
                          <button className={`${module.completed ? 'text-green-500 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'}`}>
                            {expandedModule === module.id ? <ChevronUp /> : <ChevronDown />}
                          </button>
                        </div>
                      </div>

                      {expandedModule === module.id && (
                        <div className="p-4">
                          <div className="mb-4 rounded-lg overflow-hidden bg-gray-100">
                            <GradientImage
                              imageUrl={module.image_url || undefined}
                              frameworkId={framework?.id || 1}
                              name={module.name}
                              subtitle={framework?.name}
                              width="100%"
                              height="192px"
                              className="w-full h-48"
                              alt={module.name}
                              isModule={true}
                            />
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{module.description}</p>

                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge className="bg-gray-100 text-gray-800">{framework?.level}</Badge>
                            <Badge className="bg-gray-100 text-gray-800">Concepts</Badge>
                            <Badge className="bg-gray-100 text-gray-800">Theory</Badge>
                          </div>

                          {module.scormPath && (
                            <div className="mt-4 mb-5">
                              <div className="flex items-center gap-2 mb-2">
                                <FileCode className="h-4 w-4 text-primary" />
                                <h5 className="text-md font-semibold text-primary">Interactive SCORM Content</h5>
                              </div>
                              <ScormViewer moduleName={module.name} scormPath={module.scormPath} />
                            </div>
                          )}

                          {module.content && !module.scormPath && (
                            <div className="mt-4 mb-5">
                              <div className="module-content" dangerouslySetInnerHTML={{ __html: module.content }} />
                            </div>
                          )}

                          {module.examples && (
                            <div className="mt-4 mb-5">
                              <h5 className="text-md font-semibold text-primary mb-2">Examples</h5>
                              <div className="bg-gray-50 p-3 rounded-md text-sm whitespace-pre-line">
                                {module.examples}
                              </div>
                            </div>
                          )}

                          {module.keyTakeaways && (
                            <div className="mt-4 mb-5">
                              <h5 className="text-md font-semibold text-primary mb-2">Key Takeaways</h5>
                              <div className="bg-gray-50 p-3 rounded-md text-sm whitespace-pre-line">
                                {module.keyTakeaways}
                              </div>
                            </div>
                          )}

                          {/* SCORM Package Upload (admin only) */}
                          {user && user.username === 'admin' && (
                            <div className="mt-6 mb-4 border-t border-gray-200 pt-4">
                              <h5 className="text-md font-semibold text-primary mb-3">Admin: SCORM Package Management</h5>
                              <ScormUploader 
                                moduleId={module.id} 
                                moduleName={module.name} 
                                onUploadSuccess={(updatedModule) => {
                                  // Update the modules list to reflect the new SCORM path
                                  if (framework) {
                                    queryClient.invalidateQueries({ queryKey: [`/api/frameworks/${framework.id}/modules`] });
                                  }

                                  toast({
                                    title: "SCORM Package Uploaded",
                                    description: "SCORM package has been successfully uploaded and linked to this module.",
                                  });
                                }}
                              />
                            </div>
                          )}

                          <div className="flex justify-end items-center mt-4">
                            <Button
                              variant={module.completed ? "outline" : "default"}
                              size="sm"
                              className={module.completed 
                                ? "text-green-600 border-green-600 hover:bg-green-50" 
                                : "bg-gradient-to-r from-[#3b82f6] to-[#4f46e5] hover:from-[#3b82f6]/90 hover:to-[#4f46e5]/90 text-white"}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleModuleStatusChange(module.id, !module.completed, module.name);
                              }}
                            >
                              {module.completed ? (
                                <span className="flex items-center">
                                  <Check className="h-4 w-4 mr-1" />
                                  Completed
                                </span>
                              ) : (
                                <span className="flex items-center">
                                  Mark as Complete
                                  {localModules[localModules.findIndex(m => m.id === module.id) + 1] && (
                                    <ChevronDown className="h-4 w-4 ml-1" />
                                  )}
                                </span>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Practical Application section */}
            {!isLoading && framework && (
              <div className="mb-8">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => setPracticalApplicationOpen(!practicalApplicationOpen)}>
                    <h3 className="text-lg font-semibold font-header text-primary">Practical Application</h3>
                    <button>
                      {practicalApplicationOpen ? <ChevronUp/> : <ChevronDown />}
                    </button>
                  </div>
                  {practicalApplicationOpen && (
                    <div className="p-5">
                      <h4 className="font-medium mb-3">Steps to Apply the {framework.name}</h4>

                      <ol className="text-gray-700 space-y-4 ml-5 list-decimal">
                        <li>
                          <p className="font-medium">Define the problem clearly</p>
                          <p className="text-sm text-gray-600 mt-1">Ensure you have a precise understanding of what you're trying to solve before attempting categorization.</p>
                        </li>
                        <li>
                          <p className="font-medium">Identify main categories</p>
                          <p className="text-sm text-gray-600 mt-1">Create top-level categories that don't overlap but cover all aspects of the problem.</p>
                        </li>
                        <li>
                          <p className="font-medium">Test for mutual exclusivity</p>
                          <p className="text-sm text-gray-600 mt-1">Verify that each element belongs to exactly one category without overlap.</p>
                        </li>
                        <li>
                          <p className="font-medium">Test for collective exhaustiveness</p>
                          <p className="text-sm text-gray-600 mt-1">Confirm that your categories cover all possible aspects of the problem with no gaps.</p>
                        </li>
                        <li>
                          <p className="font-medium">Iterate if necessary</p>
                          <p className="text-sm text-gray-600 mt-1">Refine your categories until they satisfy both MECE criteria.</p>
                        </li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Case Studies section */}
            {!isLoading && framework && (
              <div className="mb-8">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => setCaseStudiesOpen(!caseStudiesOpen)}>
                    <h3 className="text-lg font-semibold font-header text-primary">Case Studies</h3>
                    <button>
                      {caseStudiesOpen ? <ChevronUp/> : <ChevronDown />}
                    </button>
                  </div>
                  {caseStudiesOpen && (
                    <div className="p-4">
                      <div className="prose prose-sm max-w-none">
                        {framework.case_studies && (
                          <div dangerouslySetInnerHTML={{ __html: framework.case_studies }} />
                        )}
                        {!framework.case_studies && (
                          <p>No case studies available for this framework.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}


            {/* AI Assistant section removed */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrameworkDetail;