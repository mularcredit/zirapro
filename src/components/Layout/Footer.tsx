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
    <footer className="bg-green-800 py-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <span className="text-white  text-sm">
              © {currentYear} Figbud Global
            </span>
            <span className="text-white">|</span>
            <span className="text-green-600 dark:text-green-400 font-medium text-sm">
              Automation Moraans
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#" className="text-white  hover:text-lime-200 text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-white  hover:text-lime-200  text-sm">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;