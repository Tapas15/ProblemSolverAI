import React from 'react';
import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'wouter';

const TermsPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-primary">Terms of Service</h1>
          
          <Card className="border-0 shadow-md bg-white mb-8">
            <CardContent className="pt-6">
              <p className="text-gray-600 mb-4">Last Updated: March 24, 2025</p>
              
              <p className="text-gray-700 mb-6">
                These Terms of Service ("Terms") govern your access to and use of the QuestionPro AI mobile application 
                and related services (collectively, the "Services") provided by QuestionPro AI ("Company," "we," "us," or "our"). 
                By accessing or using our Services, you agree to be bound by these Terms. If you disagree with any part of the Terms, 
                you may not access the Services.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4 text-primary">1. Account Registration and Security</h2>
              <p className="text-gray-700 mb-4">
                To access certain features of the Services, you must register for an account. When you register, you agree to:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Keep your password secure and confidential</li>
                <li>Notify us immediately of any unauthorized access to your account</li>
                <li>Be responsible for all activities that occur under your account</li>
              </ul>
              <p className="text-gray-700 mb-6">
                We reserve the right to disable any user account if we believe you have violated these Terms.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4 text-primary">2. User Content</h2>
              <p className="text-gray-700 mb-4">
                Our Services allow you to create, upload, submit, and share content, including but not limited to exercise 
                submissions, quiz responses, comments, and messages to our AI assistant ("User Content").
              </p>
              <p className="text-gray-700 mb-6">
                You retain all ownership rights to your User Content, but you grant us a worldwide, non-exclusive, royalty-free 
                license to use, reproduce, modify, adapt, publish, translate, and distribute your User Content in connection 
                with the Services. You represent and warrant that your User Content does not violate any third-party rights and 
                complies with these Terms.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4 text-primary">3. Intellectual Property</h2>
              <p className="text-gray-700 mb-6">
                The Services and their original content, features, and functionality are owned by QuestionPro AI and are protected 
                by international copyright, trademark, patent, trade secret, and other intellectual property laws. You may not copy, 
                modify, create derivative works, publicly display, republish, or distribute any portion of the Services without 
                prior written consent from us.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4 text-primary">4. Use of AI Features</h2>
              <p className="text-gray-700 mb-4">
                The Services include AI-powered features that may require the use of third-party AI services. When using these features:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>If you choose to use your own API keys, you are responsible for compliance with the terms and conditions of those third-party services</li>
                <li>You acknowledge that AI-generated content may not always be accurate or appropriate</li>
                <li>You agree not to use the AI features for illegal, harmful, or unethical purposes</li>
                <li>You understand that conversations with the AI assistant may be stored and used to improve our Services</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mb-4 text-primary">5. Payment Terms</h2>
              <p className="text-gray-700 mb-4">
                Some features of our Services may require payment. By subscribing to a paid tier or making a purchase:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>You agree to pay all fees in accordance with the pricing and terms presented to you</li>
                <li>You authorize us to charge your designated payment method</li>
                <li>Subscriptions automatically renew unless cancelled according to our cancellation policy</li>
                <li>We reserve the right to change our prices with notice to subscribers</li>
                <li>Refunds are handled in accordance with our refund policy</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mb-4 text-primary">6. Certificates</h2>
              <p className="text-gray-700 mb-6">
                Upon completion of certain frameworks or courses, you may receive a digital certificate. These certificates are 
                for personal educational purposes only. We do not guarantee that certificates will be recognized by any specific 
                institution or employer. We reserve the right to revoke certificates in cases of fraud, misconduct, or error.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4 text-primary">7. Prohibited Uses</h2>
              <p className="text-gray-700 mb-4">
                You agree not to use the Services to:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Submit false or misleading information</li>
                <li>Upload or distribute malware or other harmful code</li>
                <li>Impersonate any person or entity</li>
                <li>Interfere with or disrupt the Services or servers</li>
                <li>Engage in unauthorized data collection or scraping</li>
                <li>Attempt to gain unauthorized access to our systems</li>
              </ul>
              
              <h2 className="text-2xl font-semibold mb-4 text-primary">8. Limitation of Liability</h2>
              <p className="text-gray-700 mb-6">
                To the maximum extent permitted by law, in no event shall QuestionPro AI, its directors, employees, partners, 
                agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, 
                including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your 
                access to or use of or inability to access or use the Services.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4 text-primary">9. Disclaimer of Warranties</h2>
              <p className="text-gray-700 mb-6">
                The Services are provided on an "as is" and "as available" basis without warranties of any kind, whether express 
                or implied. We do not warrant that the Services will be uninterrupted, error-free, or secure, or that any defects 
                will be corrected. The content provided through our Services is for educational purposes only and should not be 
                relied upon as professional business advice.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4 text-primary">10. Termination</h2>
              <p className="text-gray-700 mb-6">
                We may terminate or suspend your account and access to the Services immediately, without prior notice, for conduct 
                that we determine violates these Terms, or for any reason at our sole discretion. Upon termination, your right to 
                use the Services will immediately cease.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4 text-primary">11. Changes to Terms</h2>
              <p className="text-gray-700 mb-6">
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at 
                least 30 days' notice before the changes take effect. What constitutes a material change will be determined at our 
                sole discretion. Your continued use of the Services after the changes become effective constitutes your acceptance 
                of the new Terms.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4 text-primary">12. Governing Law</h2>
              <p className="text-gray-700 mb-6">
                These Terms shall be governed by and construed in accordance with the laws of the State of California, without 
                regard to its conflict of law principles. Any legal action or proceeding arising under these Terms will be brought 
                exclusively in the federal or state courts located in San Francisco, California, and you consent to personal 
                jurisdiction and venue in such courts.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4 text-primary">13. Contact Us</h2>
              <p className="text-gray-700 mb-6">
                If you have any questions about these Terms, please contact us at terms@questionpro.ai.
              </p>
              
              <hr className="my-8 border-gray-200" />
              
              <p className="text-gray-700">
                By using our Services, you acknowledge that you have read and understand these Terms of Service and agree to be bound by them.
              </p>
              <p className="text-gray-700 mt-4">
                For information about how we collect and use your personal information, please see our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default TermsPage;