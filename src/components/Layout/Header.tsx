import React from 'react';
import { Bell, Search, User, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  user?: { email: string; role: string };
  onLogout?: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search employees, records..."
              className="bg-gray-50 border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all duration-200 w-80"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <motion.button
            className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
          </motion.button>
          
          <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-gray-100 border border-gray-200">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="text-sm">
              <p className="text-gray-900 font-medium">{user?.email || 'Admin User'}</p>
              <p className="text-green-800 capitalize">{user?.role || 'Administrator'}</p>
            </div>
          </div>
          
          {onLogout && (
            <motion.button
              onClick={onLogout}
              className="p-2 text-gray-600 hover:text-red-500 transition-colors duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
}