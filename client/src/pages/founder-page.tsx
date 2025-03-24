import React from 'react';
import { Link, useLocation } from 'wouter';
import { SiLinkedin, SiInstagram } from 'react-icons/si';
import { ArrowLeft, Award, Globe, Briefcase, BookOpen, Menu, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

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
                src="/images/manas-kumar.jpg" 
                alt="Manas Kumar Mahanandia" 
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-md object-cover"
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
                  Award-winning Career Coach
                </Badge>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-4 font-header text-primary">About Manas</h2>
                <div className="prose prose-sm sm:prose max-w-none text-gray-700">
                  <p>
                    Manas Kumar is an award-winning Career Coach, L&D Specialist, and Entrepreneur, 
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
                      <span className="text-sm">Career Coach & L&D Specialist</span>
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