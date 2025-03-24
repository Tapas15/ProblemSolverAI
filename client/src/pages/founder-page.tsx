import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { SiLinkedin, SiInstagram } from 'react-icons/si';
import { ArrowLeft, Award, Globe, Briefcase, BookOpen, Menu, ChevronDown, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const FounderPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="flex items-center text-primary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 h-32 sm:h-48"></div>
          
          <div className="relative px-6 sm:px-8 pb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-20 mb-6">
              <img 
                src={`${import.meta.env.BASE_URL}manas-profile.jpg`}
                alt="Manas Kumar" 
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-md object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4gIcSUNDX1BST0ZJTEUAAQEAAAIMbGNtcwIQAABtbnRyUkdCIFhZWiAH3AABABkAAwApADlhY3NwQVBQTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLWxjbXMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAApkZXNjAAAA/AAAAF5jcHJ0AAABXAAAAAt3dHB0AAABaAAAABRia3B0AAABfAAAABRyWFlaAAABkAAAABRnWFlaAAABpAAAABRiWFlaAAABuAAAABRyVFJDAAABzAAAAEBnVFJDAAABzAAAAEBiVFJDAAABzAAAAEBkZXNjAAAAAAAAAANjMgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB0ZXh0AAAAAElYAABYWVogAAAAAAAA9tYAAQAAAADTLVhZWiAAAAAAAAADFgAAAzMAAAKkWFlaIAAAAAAAAG+iAAA49QAAA5BYWVogAAAAAAAAYpkAALeFAAAY2lhZWiAAAAAAAAAkoAAAD4QAALbPY3VydgAAAAAAAAAaAAAAywHJA2MFkghrC/YQPxVRGzQh8SmQMhg7kkYFUXdd7WtwegWJsZp8rGm/fdPD6TD////bAIQAAgICAwMDAwQEAwUFBQUFBwYGBgYHCgcIBwgHCg8KCwoKCwoPDhEODQ4RDhgTERETGBwYFxgcIh8fIispKzg4SwECAgIDAwMDBAQDBQUFBQUHBgYGBgcKBwgHCAcKDwoLCgoLCg8OEQ4NDhEOGBMRERMYHBgXGBwiHx8iKykrODhL/8AAEQgDiAOIAwEiAAIRAQMRAf/EAB0AAQACAwEBAQEAAAAAAAAAAAAGBwMEBQECCAn/xABAEAACAQMCBAQEBQMCAwkBAAAAAQIDBBEFBiEHEjFBE1FhcQgiIoEUMkKRoRWxwdHwQ1LhFiMkMzRicoOS8f/EABsBAQADAQEBAQAAAAAAAAAAAAABAgMEBQYH/8QALxEBAAICAQQABQIFBQEAAAAAAAECAxEEEiExQQUTIlFhMoEUI3GRsUJSocHR8P/aAAwDAQACEQMRAD8A/ZgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//9k=';
                }}
              />
              
              <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-header">Manas Kumar</h1>
                <p className="text-primary-600 font-medium text-lg">Founder, Question Pro AI</p>
                
                <div className="mt-3 flex gap-2 justify-center sm:justify-start">
                  <a 
                    href="https://www.linkedin.com/in/drmanaskumar" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <SiLinkedin className="h-6 w-6" />
                  </a>
                  <a 
                    href="https://www.instagram.com/official_manaskumar" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-pink-600 hover:text-pink-700 transition-colors"
                  >
                    <SiInstagram className="h-6 w-6" />
                  </a>
                </div>
              </div>
              
              <div className="mt-4 sm:mt-0 sm:ml-auto flex items-center gap-2">
                <Badge className="bg-amber-100 text-amber-800 px-3 py-1">
                  <Award className="mr-1 h-4 w-4" />
                  Award-winning Business & Career Coach
                </Badge>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-4 font-header text-primary">About Manas</h2>
                <div className="prose prose-sm sm:prose max-w-none text-gray-700">
                  <p>
                    Manas Kumar is an award-winning Business & Career Coach, L&D Specialist, and Entrepreneur, 
                    dedicated to strategic questioning and innovation. As the founder of Question Pro AI App, 
                    he helps professionals master effective questioning for business success.
                  </p>
                  <p>
                    With extensive expertise across multiple business frameworks including MECE, Design Thinking, 
                    SWOT Analysis, First Principles, Porter's Five Forces, Jobs-To-Be-Done, Blue Ocean Strategy, 
                    SCAMPER, Problem Tree Analysis, and the Pareto Principle, Manas has developed a unique approach 
                    to problem-solving and strategic thinking.
                  </p>
                  <p>
                    Manas also leads Expert Insights and L&D Nexus, empowering individuals and organizations 
                    through AI-driven education, critical thinking, and problem-solving methodologies. His 
                    innovative approach combines traditional business frameworks with cutting-edge AI technology 
                    to create powerful learning experiences.
                  </p>
                  <p>
                    Through Question Pro AI, Manas is revolutionizing how professionals approach complex problems 
                    by teaching the art of asking the right questions at the right time—a skill he believes is 
                    fundamental to success in today's rapidly evolving business landscape.
                  </p>
                </div>
                
                <div className="mt-10">
                  <h2 className="text-xl font-semibold mb-4 font-header text-primary">Framework Expertise</h2>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-blue-100 text-blue-800">MECE Framework</Badge>
                    <Badge className="bg-purple-100 text-purple-800">Design Thinking</Badge>
                    <Badge className="bg-green-100 text-green-800">SWOT Analysis</Badge>
                    <Badge className="bg-indigo-100 text-indigo-800">First Principles</Badge>
                    <Badge className="bg-red-100 text-red-800">Porter's Five Forces</Badge>
                    <Badge className="bg-orange-100 text-orange-800">Jobs-To-Be-Done</Badge>
                    <Badge className="bg-cyan-100 text-cyan-800">Blue Ocean Strategy</Badge>
                    <Badge className="bg-teal-100 text-teal-800">SCAMPER</Badge>
                    <Badge className="bg-lime-100 text-lime-800">Problem Tree Analysis</Badge>
                    <Badge className="bg-amber-100 text-amber-800">Pareto Principle</Badge>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h2 className="text-lg font-semibold mb-4 font-header flex items-center text-primary">
                    <Briefcase className="mr-2 h-5 w-5" />
                    Professional Highlights
                  </h2>
                  
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-secondary/20 flex items-center justify-center mt-0.5 mr-2">
                        <span className="text-secondary text-xs font-bold">✓</span>
                      </div>
                      <span className="text-sm">Business & Career Coach</span>
                    </li>
                    <li className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-secondary/20 flex items-center justify-center mt-0.5 mr-2">
                        <span className="text-secondary text-xs font-bold">✓</span>
                      </div>
                      <span className="text-sm">Founder of QuestionPro AI App</span>
                    </li>
                    <li className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-secondary/20 flex items-center justify-center mt-0.5 mr-2">
                        <span className="text-secondary text-xs font-bold">✓</span>
                      </div>
                      <span className="text-sm">Leader at Expert Insights & L&D Nexus</span>
                    </li>
                    <li className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-secondary/20 flex items-center justify-center mt-0.5 mr-2">
                        <span className="text-secondary text-xs font-bold">✓</span>
                      </div>
                      <span className="text-sm">Strategic Questioning Expert</span>
                    </li>
                    <li className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-secondary/20 flex items-center justify-center mt-0.5 mr-2">
                        <span className="text-secondary text-xs font-bold">✓</span>
                      </div>
                      <span className="text-sm">AI-Driven Education Innovator</span>
                    </li>
                  </ul>
                  
                  <Separator className="my-5" />
                  
                  <h2 className="text-lg font-semibold mb-4 font-header flex items-center text-primary">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Consultation Services
                  </h2>
                  
                  <div className="space-y-3">
                    <p className="text-sm text-gray-700">
                      Manas offers direct consultation services for professionals and organizations looking to 
                      master business frameworks and improve their strategic questioning skills.
                    </p>
                    
                    <div className="pt-2">
                      <a 
                        href="https://www.linkedin.com/in/drmanaskumar" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        <SiLinkedin className="mr-2 h-4 w-4" />
                        Connect on LinkedIn
                      </a>
                    </div>
                    <div>
                      <a 
                        href="https://www.instagram.com/official_manaskumar" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                      >
                        <SiInstagram className="mr-2 h-4 w-4" />
                        Follow on Instagram
                      </a>
                    </div>
                  </div>
                  
                  <Separator className="my-5" />
                  
                  <h2 className="text-lg font-semibold mb-4 font-header flex items-center text-primary">
                    <Globe className="mr-2 h-5 w-5" />
                    Book a Session
                  </h2>
                  
                  <p className="text-sm text-gray-700 mb-4">
                    Ready to transform your approach to problem-solving and strategic thinking? 
                    Book a personalized consultation session with Manas.
                  </p>
                  
                  <a 
                    href="mailto:manas@questionpro.ai" 
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
                  >
                    Schedule a Consultation
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FounderPage;