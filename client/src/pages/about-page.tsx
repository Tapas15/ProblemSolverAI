import React from 'react';
import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'wouter';

const AboutPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-primary">About Framework Pro</h1>
          
          <div className="space-y-8">
            <Card className="border-0 shadow-md bg-white">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-semibold mb-4 text-primary">Our Mission</h2>
                <p className="text-gray-700 mb-4">
                  At Framework Pro, our mission is to empower business professionals and problem-solvers with 
                  proven frameworks that transform the way strategic decisions are made. 
                  We believe that by providing structured approaches to business challenges, 
                  we can help professionals generate deeper insights and better solutions in less time.
                </p>
                <p className="text-gray-700">
                  We're dedicated to creating accessible learning experiences that help our users master complex 
                  problem-solving methodologies while keeping pace with rapidly evolving business landscapes.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md bg-white">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-semibold mb-4 text-primary">Our Story</h2>
                <p className="text-gray-700 mb-4">
                  Framework Pro was founded by Manas Kumar, a visionary entrepreneur passionate about 
                  business innovation and strategic thinking. After years of working with businesses and observing 
                  the challenges they faced in applying strategic frameworks effectively, he envisioned a 
                  solution that would bridge the gap between theoretical business knowledge and practical application.
                </p>
                <p className="text-gray-700 mb-4">
                  In 2023, Framework Pro was born with a simple yet powerful idea: create a structured platform 
                  that guides users through the most effective business frameworks to provide practical problem-solving
                  capabilities.
                </p>
                <p className="text-gray-700">
                  Today, we're proud to offer a comprehensive mobile platform featuring ten essential business 
                  frameworks, each meticulously designed to provide a transformative problem-solving experience
                  for professionals in any field.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md bg-white">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-semibold mb-4 text-primary">Our Values</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-medium mb-2 text-secondary">Innovation</h3>
                    <p className="text-gray-700">
                      We continuously evolve our platform to deliver cutting-edge problem-solving tools
                      that incorporate the latest business strategy approaches.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-2 text-secondary">Excellence</h3>
                    <p className="text-gray-700">
                      We are committed to providing the highest quality content and user experience, with 
                      meticulously crafted frameworks and intuitive design.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-2 text-secondary">Accessibility</h3>
                    <p className="text-gray-700">
                      We believe powerful business tools should be accessible to all professionals, regardless 
                      of their background or experience level.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-2 text-secondary">User-Centric</h3>
                    <p className="text-gray-700">
                      Everything we build is designed with our users in mind, focused on creating meaningful 
                      and practical learning experiences.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md bg-white">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-semibold mb-4 text-primary">Our Team</h2>
                <p className="text-gray-700 mb-6">
                  Framework Pro is powered by a diverse team of experts in business strategy, education, 
                  and product development. United by our passion for innovation and commitment to excellence, 
                  we work tirelessly to create tools that transform how professionals approach problem-solving.
                </p>
                
                <div className="text-center mb-6">
                  <Link href="/founder" className="inline-block px-6 py-3 rounded-md bg-primary text-white font-medium hover:bg-primary/90 transition-colors">
                    Meet Our Founder
                  </Link>
                </div>
                
                <p className="text-gray-700">
                  Interested in joining our team? We're always looking for talented individuals who share our vision. 
                  Check out our <Link href="/careers" className="text-primary hover:underline">careers page</Link> or 
                  <Link href="/contact" className="text-primary hover:underline"> contact us</Link>.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AboutPage;