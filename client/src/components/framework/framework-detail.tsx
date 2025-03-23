import React, { useState } from 'react';
import { useParams } from 'wouter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Framework, Module } from '@shared/schema';
import { getFramework, getModules, updateModuleCompletion } from '@/lib/api';
import { Check, ChevronDown, ChevronUp, Clock, GraduationCap, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { askAi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

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
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const toggleModule = (moduleId: number) => {
    if (expandedModule === moduleId) {
      setExpandedModule(null);
    } else {
      setExpandedModule(moduleId);
    }
  };
  
  const completeModuleMutation = useMutation({
    mutationFn: ({ moduleId, completed }: { moduleId: number; completed: boolean }) => 
      updateModuleCompletion(moduleId, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/progress'] });
      if (framework) {
        queryClient.invalidateQueries({ queryKey: [`/api/frameworks/${framework.id}/modules`] });
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
  
  const handleModuleStatusChange = (moduleId: number, completed: boolean) => {
    completeModuleMutation.mutate({ moduleId, completed });
  };
  
  const handleAiQuestion = async () => {
    if (!aiQuestion.trim()) return;
    
    if (!user?.apiKey) {
      toast({
        title: "AI Integration Not Set Up",
        description: "Please set up your AI integration in your account settings first.",
        variant: "destructive",
      });
      return;
    }
    
    setIsAiLoading(true);
    try {
      const response = await askAi(aiQuestion, framework?.id);
      setAiResponse(response.answer);
    } catch (error) {
      toast({
        title: "AI Assistant Error",
        description: error instanceof Error ? error.message : "Failed to get response from AI",
        variant: "destructive",
      });
    } finally {
      setIsAiLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center overflow-y-auto">
      <div className="bg-white w-full md:w-4/5 md:mx-auto md:my-8 md:rounded-lg overflow-hidden flex flex-col shadow-xl max-h-[90vh]">
        <div className="p-5 bg-primary text-white flex justify-between items-center">
          <h2 className="text-xl font-bold font-header">
            {isLoading ? <Skeleton className="h-6 w-40 bg-gray-700" /> : framework?.name}
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
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <>
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
                        <Skeleton className="h-6 w-40" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {modules.map((module) => (
                    <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div 
                        className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
                        onClick={() => toggleModule(module.id)}
                      >
                        <div className="flex items-center">
                          <div className={`h-6 w-6 rounded-full ${
                            module.completed ? 'bg-green-500 text-white' : 'bg-gray-300 text-white'
                          } flex items-center justify-center mr-3`}>
                            {module.completed ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                          </div>
                          <h4 className="font-medium">{module.name}</h4>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          {expandedModule === module.id ? <ChevronUp /> : <ChevronDown />}
                        </button>
                      </div>
                      
                      {expandedModule === module.id && (
                        <div className="p-4">
                          <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge className="bg-gray-100 text-gray-800">{framework?.level}</Badge>
                            <Badge className="bg-gray-100 text-gray-800">Concepts</Badge>
                            <Badge className="bg-gray-100 text-gray-800">Theory</Badge>
                          </div>
                          
                          {module.content && (
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
                          
                          <div className="flex justify-end items-center mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className={module.completed ? "text-green-600 border-green-600" : ""}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleModuleStatusChange(module.id, !module.completed);
                              }}
                            >
                              {module.completed ? "Mark as Incomplete" : "Mark as Complete"}
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
                <h3 className="text-lg font-semibold font-header text-primary mb-4">Practical Application</h3>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
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
              </div>
            )}
            
            {/* Case Studies section */}
            {!isLoading && framework && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold font-header text-primary mb-4">Case Studies</h3>
                
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-4">
                      <h4 className="font-medium mb-2">Retail Profitability Analysis</h4>
                      <p className="text-sm text-gray-600 mb-3">How a major retail chain used {framework.name} to analyze and improve store profitability across their network.</p>
                      <Button variant="link" className="text-sm font-medium text-secondary p-0 h-auto">
                        View Case Study
                      </Button>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-4">
                      <h4 className="font-medium mb-2">Healthcare Operations Optimization</h4>
                      <p className="text-sm text-gray-600 mb-3">A case study on how a hospital network applied {framework.name} to streamline patient care workflows and reduce wait times.</p>
                      <Button variant="link" className="text-sm font-medium text-secondary p-0 h-auto">
                        View Case Study
                      </Button>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-4">
                      <h4 className="font-medium mb-2">Tech Startup Market Entry</h4>
                      <p className="text-sm text-gray-600 mb-3">How a SaaS startup used {framework.name} to evaluate and prioritize market entry strategies for international expansion.</p>
                      <Button variant="link" className="text-sm font-medium text-secondary p-0 h-auto">
                        View Case Study
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-4">
                      <h4 className="font-medium mb-2">Customer Satisfaction Framework</h4>
                      <p className="text-sm text-gray-600 mb-3">Creating a structured approach to analyze and address customer satisfaction issues in a service business.</p>
                      <Button variant="link" className="text-sm font-medium text-secondary p-0 h-auto">
                        View Case Study
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* AI Assistant section */}
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-5">
              <h3 className="text-lg font-semibold font-header text-primary mb-3">
                Get AI Assistance with This Framework
              </h3>
              <p className="text-gray-600 mb-4">
                Ask specific questions about applying the {framework?.name || ''} framework to your unique business challenges.
              </p>
              
              <Textarea 
                rows={3} 
                placeholder={`Example: How can I use ${framework?.name || 'this framework'} to analyze our declining customer retention?`}
                className="w-full rounded-md border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-secondary focus:border-secondary"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
              />
              
              {aiResponse && (
                <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <p className="text-sm font-medium text-gray-500 mb-2">AI response:</p>
                  <div className="text-sm text-gray-700 whitespace-pre-line">
                    {aiResponse}
                  </div>
                </div>
              )}
              
              <div className="mt-3 flex justify-end">
                <Button 
                  className="bg-secondary hover:bg-secondary/90 text-white font-medium"
                  size="sm"
                  onClick={handleAiQuestion}
                  disabled={isAiLoading || !aiQuestion.trim()}
                >
                  {isAiLoading ? "Processing..." : "Get AI Guidance"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrameworkDetail;
