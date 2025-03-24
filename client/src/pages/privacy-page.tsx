import React from 'react';
import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent } from '@/components/ui/card';

const PrivacyPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-primary">Privacy Policy</h1>
          
          <Card className="border-0 shadow-md bg-white mb-8">
            <CardContent className="pt-6">
              <p className="text-gray-600 mb-4">Last Updated: March 24, 2025</p>
              
              <p className="text-gray-700 mb-6">
                This Privacy Policy describes how QuestionPro AI ("we", "us", or "our") collects, uses, and discloses your 
                information when you use our mobile application and related services (collectively, the "Services").
              </p>
              
              <p className="text-gray-700 mb-6">
                We are committed to protecting your privacy and ensuring you have a positive experience when using our Services. 
                This policy outlines our data collection and use practices. By using our Services, you agree to the terms of this 
                Privacy Policy.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4 text-primary">Information We Collect</h2>
              
              <h3 className="text-xl font-medium mb-2 text-secondary">1. Personal Information</h3>
              <p className="text-gray-700 mb-4">
                We collect information that you provide directly to us when you:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Create an account (name, email address, password)</li>
                <li>Complete your profile (professional information, education, etc.)</li>
                <li>Use our AI assistant (questions, prompts, and conversations)</li>
                <li>Submit exercise solutions and quiz responses</li>
                <li>Contact us or participate in surveys</li>
              </ul>
              
              <h3 className="text-xl font-medium mb-2 text-secondary">2. Usage Information</h3>
              <p className="text-gray-700 mb-4">
                We automatically collect certain information about your device and how you interact with our Services:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Device information (device type, operating system, unique device identifiers)</li>
                <li>Log information (IP address, access dates and times, app features used)</li>
                <li>Learning progress and performance metrics</li>
                <li>Usage patterns and preferences</li>
              </ul>
              
              <h3 className="text-xl font-medium mb-2 text-secondary">3. API Keys</h3>
              <p className="text-gray-700 mb-6">
                If you choose to use your own API keys for third-party AI services (such as OpenAI), we collect and store 
                these keys securely. These keys are used solely for the purpose of enabling the AI features within our application 
                on your behalf.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4 text-primary">How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Provide, maintain, and improve our Services</li>
                <li>Process and complete transactions</li>
                <li>Send you technical notices, updates, and administrative messages</li>
                <li>Respond to your comments, questions, and support requests</li>
                <li>Personalize your learning experience</li>
                <li>Track your progress and issue certificates</li>
                <li>Develop new products and services</li>
                <li>Monitor and analyze usage trends</li>
                <li>Protect against, identify, and prevent fraud and other illegal activity</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mb-4 text-primary">Information Sharing and Disclosure</h2>
              <p className="text-gray-700 mb-4">
                We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>With third-party service providers who perform services on our behalf</li>
                <li>With third-party AI providers when you use our AI features (using your own API keys)</li>
                <li>In response to legal process or government requests</li>
                <li>To protect our rights, privacy, safety, or property</li>
                <li>In connection with a merger, acquisition, or sale of assets</li>
              </ul>
              <p className="text-gray-700 mb-6">
                We do not sell your personal information to third parties.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4 text-primary">Data Security</h2>
              <p className="text-gray-700 mb-6">
                We implement appropriate security measures to protect your personal information from unauthorized access, 
                alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic 
                storage is 100% secure, so we cannot guarantee absolute security.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4 text-primary">Your Rights and Choices</h2>
              <p className="text-gray-700 mb-4">
                You have several rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Access and update your profile information through your account settings</li>
                <li>Opt-out of marketing communications by following unsubscribe instructions</li>
                <li>Request deletion of your account and personal information</li>
                <li>Control notification settings within the app</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mb-4 text-primary">Children's Privacy</h2>
              <p className="text-gray-700 mb-6">
                Our Services are not directed to children under 16. We do not knowingly collect personal information from 
                children under 16. If we learn that we have collected personal information from a child under 16, we will 
                delete that information promptly.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4 text-primary">Changes to this Privacy Policy</h2>
              <p className="text-gray-700 mb-6">
                We may update this Privacy Policy from time to time. If we make material changes, we will notify you through 
                the Services or by other means. Your continued use of the Services after the changes are made constitutes 
                acceptance of the updated Privacy Policy.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4 text-primary">Contact Us</h2>
              <p className="text-gray-700 mb-6">
                If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at 
                privacy@questionpro.ai.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default PrivacyPage;