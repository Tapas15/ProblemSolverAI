import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { SiLinkedin, SiInstagram } from 'react-icons/si';
import { ArrowLeft, Award, Globe, Briefcase, BookOpen, Menu, ChevronDown, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import MainLayout from '@/components/layout/main-layout';
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
    <MainLayout>
      <div className="bg-gray-50 py-8">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 h-32 sm:h-48"></div>
            
            <div className="relative px-6 sm:px-8 pb-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-20 mb-6">
                <img 
                  src="/images/manas-profile.jpg"
                  alt="Manas Kumar" 
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-md object-cover"
                />
                
                <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left flex-1">
                  <div className="flex flex-col sm:flex-row items-center sm:items-end">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dr. Manas Kumar</h1>
                      <p className="text-sm sm:text-base text-gray-600 mt-1">Founder of QuestionPro AI</p>
                      <div className="flex items-center justify-center sm:justify-start mt-2 space-x-2">
                        <Badge variant="outline" className="bg-primary/5 text-xs">Business Strategy</Badge>
                        <Badge variant="outline" className="bg-primary/5 text-xs">Career Development</Badge>
                        <Badge variant="outline" className="bg-primary/5 text-xs">Leadership</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="col-span-2">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                        <Award className="h-5 w-5 mr-2 text-primary" />
                        About Me
                      </h2>
                      <Separator className="my-3" />
                      <p className="mt-3 text-gray-700">
                        With over 8 years of experience as a business coach and mentor, I have helped thousands of professionals
                        transform their careers and businesses. My expertise spans across strategic planning, leadership development,
                        and performance optimization. I believe in a structured approach to problem-solving using proven frameworks
                        that have been refined through years of real-world application.
                      </p>
                      <p className="mt-4 text-gray-700">
                        My philosophy is that success comes from a combination of analytical thinking, creative problem-solving,
                        and effective implementation. I'm passionate about helping professionals like you develop these skills
                        to achieve extraordinary results in your careers and businesses.
                      </p>
                    </div>
                    
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                        <Briefcase className="h-5 w-5 mr-2 text-primary" />
                        Professional Background
                      </h2>
                      <Separator className="my-3" />
                      <ul className="mt-3 space-y-3">
                        <li className="flex items-start">
                          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 mr-3">
                            <span className="text-primary text-xs">✓</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Founder</span> - QuestionPro AI
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 mr-3">
                            <span className="text-primary text-xs">✓</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Business Strategy Advisor</span> - Fortune 500 Companies
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 mr-3">
                            <span className="text-primary text-xs">✓</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">International Speaker</span> - Business Strategy & Career Development
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 mr-3">
                            <span className="text-primary text-xs">✓</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Author</span> - Published works on strategic frameworks and career development
                          </div>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                        <BookOpen className="h-5 w-5 mr-2 text-primary" />
                        My Approach to Problem-Solving
                      </h2>
                      <Separator className="my-3" />
                      <p className="mt-3 text-gray-700">
                        I've dedicated my career to developing and refining strategic frameworks that make complex business
                        challenges manageable. The frameworks featured in QuestionPro AI represent the culmination of this work,
                        providing structured approaches to common business problems faced by modern professionals.
                      </p>
                      <p className="mt-4 text-gray-700">
                        Each framework is designed to break down complex problems into clear, actionable steps. Whether you're
                        analyzing a market opportunity, developing a new product, or optimizing your team's performance,
                        these tools will help you think more clearly and make better decisions.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="col-span-1">
                  <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Connect & Consult</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Social Media</h4>
                        <div className="flex space-x-3">
                          <a 
                            href="https://www.linkedin.com/in/drmanaskumar" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center px-3 py-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          >
                            <SiLinkedin className="h-4 w-4 mr-2" />
                            LinkedIn
                          </a>
                          <a 
                            href="https://www.instagram.com/official_manaskumar" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center px-3 py-2 rounded-md bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors"
                          >
                            <SiInstagram className="h-4 w-4 mr-2" />
                            Instagram
                          </a>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Consultation Options</h4>
                        <div className="space-y-2">
                          <div className="bg-white p-3 rounded-lg border border-gray-200 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer">
                            <div className="font-medium text-gray-900">One-on-One Coaching</div>
                            <p className="text-sm text-gray-600 mt-1">Personalized guidance for your specific challenges</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-gray-200 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer">
                            <div className="font-medium text-gray-900">Team Workshops</div>
                            <p className="text-sm text-gray-600 mt-1">Interactive sessions for your entire team</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-gray-200 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer">
                            <div className="font-medium text-gray-900">Speaking Engagements</div>
                            <p className="text-sm text-gray-600 mt-1">Keynotes and presentations on strategic frameworks</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <Button className="w-full">
                          Request Consultation
                        </Button>
                        <p className="text-xs text-gray-500 text-center mt-2">
                          Limited slots available each month
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FounderPage;