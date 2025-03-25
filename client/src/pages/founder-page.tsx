import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { SiLinkedin, SiInstagram } from 'react-icons/si';
import { ArrowLeft, Award, Briefcase, BookOpen, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import MainLayout from '@/components/layout/main-layout';
import { MobileAppLayout } from '@/components/layout/mobile-app-layout';
import { isNativePlatform } from '@/lib/capacitor';

const FounderPage: React.FC = () => {
  const [_, navigate] = useLocation();
  const [isNative, setIsNative] = useState(false);
  
  // Check if running on native platform
  useEffect(() => {
    setIsNative(isNativePlatform());
  }, []);
  
  const Layout = isNative ? MobileAppLayout : MainLayout;
  
  return (
    <Layout>
      <div className={`native-scroll pb-8 ${isNative ? "px-4" : ""}`}>
        {!isNative && (
          /* Page Header for non-native */
          <div className="flex items-center mb-4 py-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="mr-2 h-9 w-9 rounded-full text-[#3b82f6]" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="mobile-h1 text-[#0f172a]">Founder</h1>
          </div>
        )}

      {/* Profile Header */}
      <div className="native-card p-0 overflow-hidden mb-5">
        <div className="bg-gradient-to-r from-[#0f2544] to-[#19355f] h-24 relative">
          <div className="absolute -bottom-12 left-4 ring-4 ring-white rounded-full">
            <Avatar className="h-24 w-24">
              <AvatarImage src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%233b82f6' /><text x='50%' y='50%' font-size='35' font-family='Arial' fill='white' text-anchor='middle' dominant-baseline='middle'>MK</text></svg>" alt="Dr. Manas Kumar" />
              <AvatarFallback className="bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white text-xl">MK</AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        <div className="pt-14 px-4 pb-4">
          <h2 className="text-xl font-semibold text-[#0f172a]">Dr. Manas Kumar</h2>
          <p className="text-[#64748b] text-sm">Founder of QuestionPro AI</p>
          
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline" className="badge-blue">Business Strategy</Badge>
            <Badge variant="outline" className="badge-blue">Career Development</Badge>
            <Badge variant="outline" className="badge-blue">Leadership</Badge>
          </div>
          
          <div className="flex space-x-2 mt-4">
            <a 
              href="https://www.linkedin.com/in/drmanaskumar" 
              target="_blank"
              rel="noopener noreferrer" 
              className="native-button-secondary h-9 px-3 py-2 text-xs font-medium flex items-center"
            >
              <SiLinkedin className="h-3.5 w-3.5 mr-1.5" />
              LinkedIn
            </a>
            <a 
              href="https://www.instagram.com/official_manaskumar" 
              target="_blank"
              rel="noopener noreferrer"
              className="native-button-secondary h-9 px-3 py-2 text-xs font-medium flex items-center"
            >
              <SiInstagram className="h-3.5 w-3.5 mr-1.5" />
              Instagram
            </a>
          </div>
        </div>
      </div>
      
      {/* About Section */}
      <Card className="native-card mb-5">
        <CardContent className="p-4">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
              <Award className="h-4 w-4 text-[#3b82f6]" />
            </div>
            <h3 className="mobile-h3 text-[#0f172a]">About Me</h3>
          </div>
          
          <p className="text-sm text-[#334155] mb-3">
            With over 8 years of experience as a business coach and mentor, I have helped thousands of professionals
            transform their careers and businesses. My expertise spans across strategic planning, leadership development,
            and performance optimization.
          </p>
          
          <p className="text-sm text-[#334155]">
            I believe in a structured approach to problem-solving using proven frameworks that have been refined 
            through years of real-world application.
          </p>
        </CardContent>
      </Card>
      
      {/* Professional Background */}
      <Card className="native-card mb-5">
        <CardContent className="p-4">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
              <Briefcase className="h-4 w-4 text-[#3b82f6]" />
            </div>
            <h3 className="mobile-h3 text-[#0f172a]">Professional Background</h3>
          </div>
          
          <ul className="space-y-3">
            <li className="flex items-start">
              <div className="h-5 w-5 rounded-full bg-[#3b82f6]/10 flex items-center justify-center mt-0.5 mr-3">
                <span className="text-[#3b82f6] text-xs">✓</span>
              </div>
              <div className="text-sm text-[#334155]">
                <span className="font-medium text-[#0f172a]">Founder</span> - QuestionPro AI
              </div>
            </li>
            <li className="flex items-start">
              <div className="h-5 w-5 rounded-full bg-[#3b82f6]/10 flex items-center justify-center mt-0.5 mr-3">
                <span className="text-[#3b82f6] text-xs">✓</span>
              </div>
              <div className="text-sm text-[#334155]">
                <span className="font-medium text-[#0f172a]">Business Strategy Advisor</span> - Fortune 500 Companies
              </div>
            </li>
            <li className="flex items-start">
              <div className="h-5 w-5 rounded-full bg-[#3b82f6]/10 flex items-center justify-center mt-0.5 mr-3">
                <span className="text-[#3b82f6] text-xs">✓</span>
              </div>
              <div className="text-sm text-[#334155]">
                <span className="font-medium text-[#0f172a]">International Speaker</span> - Business Strategy & Career Development
              </div>
            </li>
            <li className="flex items-start">
              <div className="h-5 w-5 rounded-full bg-[#3b82f6]/10 flex items-center justify-center mt-0.5 mr-3">
                <span className="text-[#3b82f6] text-xs">✓</span>
              </div>
              <div className="text-sm text-[#334155]">
                <span className="font-medium text-[#0f172a]">Author</span> - Published works on strategic frameworks
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
      
      {/* Approach */}
      <Card className="native-card mb-5">
        <CardContent className="p-4">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
              <BookOpen className="h-4 w-4 text-[#3b82f6]" />
            </div>
            <h3 className="mobile-h3 text-[#0f172a]">My Approach</h3>
          </div>
          
          <p className="text-sm text-[#334155] mb-3">
            I've dedicated my career to developing and refining strategic frameworks that make complex business
            challenges manageable. The frameworks featured in QuestionPro AI represent the culmination of this work.
          </p>
          
          <p className="text-sm text-[#334155]">
            Each framework is designed to break down complex problems into clear, actionable steps. Whether you're
            analyzing a market opportunity, developing a new product, or optimizing your team's performance,
            these tools will help you think more clearly and make better decisions.
          </p>
        </CardContent>
      </Card>
      
      {/* Consultation Options */}
      <h2 className="mobile-h2 mb-3 text-[#0f172a]">Consultation Options</h2>
      <div className="space-y-3 mb-5">
        <Card className="native-card touch-feedback p-4">
          <div className="flex items-start">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3 flex-shrink-0">
              <ExternalLink className="h-5 w-5 text-[#3b82f6]" />
            </div>
            <div>
              <h3 className="font-medium text-[#0f172a] mb-1">One-on-One Coaching</h3>
              <p className="text-sm text-[#64748b]">Personalized guidance for your specific challenges</p>
            </div>
          </div>
        </Card>
        
        <Card className="native-card touch-feedback p-4">
          <div className="flex items-start">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3 flex-shrink-0">
              <ExternalLink className="h-5 w-5 text-[#3b82f6]" />
            </div>
            <div>
              <h3 className="font-medium text-[#0f172a] mb-1">Team Workshops</h3>
              <p className="text-sm text-[#64748b]">Interactive sessions for your entire team</p>
            </div>
          </div>
        </Card>
        
        <Card className="native-card touch-feedback p-4">
          <div className="flex items-start">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3 flex-shrink-0">
              <ExternalLink className="h-5 w-5 text-[#3b82f6]" />
            </div>
            <div>
              <h3 className="font-medium text-[#0f172a] mb-1">Speaking Engagements</h3>
              <p className="text-sm text-[#64748b]">Keynotes and presentations on strategic frameworks</p>
            </div>
          </div>
        </Card>
      </div>
      
      <Button className="native-button w-full flex items-center justify-center mb-2">
        Request Consultation
      </Button>
      <p className="text-xs text-[#64748b] text-center">
        Limited slots available each month
      </p>
    </div>
    </Layout>
  );
};

export default FounderPage;