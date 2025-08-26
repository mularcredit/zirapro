// src/components/Layout/Footer.tsx
import { useEffect, useState } from 'react';

const Footer = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const interval = setInterval(() => {
      const newYear = new Date().getFullYear();
      if (newYear !== currentYear) {
        setCurrentYear(newYear);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [currentYear]);

  return (
    <footer className="bg-white border-t border-gray-100 py-6 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4 md:mb-0">
            <span className="text-gray-600 text-sm font-medium">
              © {currentYear} Figbud Global
            </span>
            <div className="hidden sm:block h-4 w-px bg-gray-300"></div>
            <span className="text-emerald-600 font-semibold text-sm">
              Automation Moraans
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#" className="text-gray-500 hover:text-emerald-600 transition-colors duration-200 text-sm font-medium">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-500 hover:text-emerald-600 transition-colors duration-200 text-sm font-medium">
              Terms of Service
            </a>
          </div>
        </div>
        <div className="mt-4 text-center md:text-left">
          <p className="text-xs text-gray-400">Simplifying automation solutions for modern businesses</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;