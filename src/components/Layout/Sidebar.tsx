import React, { useState } from 'react';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  GraduationCap,
  UserPlus,
  FileText,
  BarChart3,
  Settings,
  Bot,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import solo from '../../../public/solo.png';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/dashboard' },
  { id: 'ai-assistant', label: 'AI Assistant', icon: Bot, path: '/ai-assistant' },
  { id: 'employees', label: 'Employees', icon: Users, path: '/employees' },
  { id: 'recruitment', label: 'Recruitment', icon: UserPlus, path: '/recruitment' },
  { id: 'leaves', label: 'Leave Management', icon: Calendar, path: '/leaves' },
  { id: 'payroll', label: 'Payroll', icon: DollarSign, path: '/payroll' },
  { id: 'performance', label: 'Performance', icon: TrendingUp, path: '/performance' },
  { id: 'training', label: 'Training', icon: GraduationCap, path: '/training' },
  { id: 'reports', label: 'Reports', icon: FileText, path: '/reports' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`bg-gradient-to-b from-green-700 to-green-800 min-h-screen shadow-xl text-white flex-shrink-0 relative z-20 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      initial={{ width: 64 }}
      animate={{ 
        width: isHovered && isCollapsed ? 256 : isCollapsed ? 64 : 256 
      }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Toggle Button */}
      <div className="flex justify-end p-3 absolute right-0 top-0">
        <motion.button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-full hover:bg-green-600/50 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-white/80" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-white/80" />
          )}
        </motion.button>
      </div>

      <div className="px-2 pb-6 pt-16 h-full flex flex-col">
        {/* Logo Section */}
        <motion.div 
          className="flex items-center mb-8 px-2"
          animate={{ 
            justifyContent: isCollapsed && !isHovered ? 'center' : 'flex-start' 
          }}
        >
          <motion.div 
            className="w-8 h-8 flex-shrink-0 rounded-full bg-white/10 flex items-center justify-center"
            whileHover={{ rotate: 10 }}
          >
            <img src={solo} alt="Logo" className="w-6 h-6" />
          </motion.div>
          <AnimatePresence>
            {(isHovered || !isCollapsed) && (
              <motion.div
                className="ml-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >
                <h1 className="text-lg font-semibold text-white tracking-tight">
                  Zira<span className="font-light">Hr</span>
                </h1>
                <p className="text-green-200 text-xs">Smiles Start Here</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Navigation */}
        <nav className="space-y-1 flex-1">
          {menuItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <motion.button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-0.5 py-3 rounded-lg transition-all duration-200 relative overflow-hidden group ${
                  isActive
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-white/90 hover:text-white hover:bg-white/5'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center">
                  <div className={`relative p-1.5 rounded-lg ${isActive ? 'bg-green-500/20 ml-2' : 'group-hover:bg-green-500/10 ml-2'}`}>
                    <item.icon
                      className={`w-4 h-3.5 flex-shrink-0 ${isActive ? 'text-green-300' : 'text-white/80 group-hover:text-white'}`}
                    />
                  </div>
                  <AnimatePresence>
                    {(isHovered || !isCollapsed) && (
                      <motion.span
                        className="ml-3 text-sm font-medium whitespace-nowrap"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                {isActive && (
                  <motion.div
                    className="absolute left-0 h-full w-1 bg-green-400 rounded-r"
                    layoutId="activeIndicator"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Bottom spacer */}
        <div className="flex-1"></div>

        {/* User/Settings Area */}
        <motion.div 
          className="mt-auto px-2 pt-4 border-t border-white/10"
          animate={{
            justifyContent: isCollapsed && !isHovered ? 'center' : 'flex-start'
          }}
        >
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center ml-2">
              <Settings className="w-4 h-4 text-white/80" />
            </div>
            <AnimatePresence>
              {(isHovered || !isCollapsed) && (
                <motion.div
                  className="ml-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  <p className="text-xs text-white/80">Settings</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}