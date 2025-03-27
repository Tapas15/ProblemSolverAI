import React from 'react';
import { Link } from 'wouter';
import { Facebook, Twitter, Linkedin, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-white py-10 mt-16">
      <div className="container mx-auto px-4">
        <div className="md:flex md:justify-between">
          <div className="mb-8 md:mb-0">
            <div className="font-bold text-xl font-header tracking-tight mb-4">
              <span className="text-accent">Question</span>
              <span className="text-white">Pro</span>{' '}
              <span className="text-secondary">AI</span>
            </div>
            <p className="text-gray-300 max-w-sm">
              Empowering business professionals with AI-enhanced problem-solving frameworks and tools.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-accent font-medium mb-3">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/">
                    <span className="text-gray-300 hover:text-white text-sm">Frameworks</span>
                  </Link>
                </li>
                <li>
                  <Link to="/ai-assistant">
                    <span className="text-gray-300 hover:text-white text-sm">AI Integration</span>
                  </Link>
                </li>
                <li>
                  <Link to="/learning-path">
                    <span className="text-gray-300 hover:text-white text-sm">Learning Paths</span>
                  </Link>
                </li>
                <li>
                  <Link to="/certification">
                    <span className="text-gray-300 hover:text-white text-sm">Certification</span>
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-accent font-medium mb-3">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/blog">
                    <span className="text-gray-300 hover:text-white text-sm">Blog</span>
                  </Link>
                </li>
                <li>
                  <Link to="/case-studies">
                    <span className="text-gray-300 hover:text-white text-sm">Case Studies</span>
                  </Link>
                </li>
                <li>
                  <Link to="/webinars">
                    <span className="text-gray-300 hover:text-white text-sm">Webinars</span>
                  </Link>
                </li>
                <li>
                  <Link to="/support">
                    <span className="text-gray-300 hover:text-white text-sm">Support</span>
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-accent font-medium mb-3">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/about">
                    <span className="text-gray-300 hover:text-white text-sm">About Us</span>
                  </Link>
                </li>
                <li>
                  <Link to="/contact">
                    <span className="text-gray-300 hover:text-white text-sm">Contact</span>
                  </Link>
                </li>
                <li>
                  <Link to="/privacy">
                    <span className="text-gray-300 hover:text-white text-sm">Privacy Policy</span>
                  </Link>
                </li>
                <li>
                  <Link to="/terms">
                    <span className="text-gray-300 hover:text-white text-sm">Terms of Service</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700 flex flex-col md:flex-row md:justify-between md:items-center">
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} Framework Pro. All rights reserved.</p>
          
          <div className="mt-4 md:mt-0 flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-white">
              <Linkedin size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <Youtube size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
