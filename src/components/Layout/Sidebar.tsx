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
  ChevronRight,
  Video,
  FileCog,
  Siren,
  LogOut,
  Sun,
  Moon
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
  { id: 'staffcheck', label: 'Disciplinary', icon: Siren, path: '/staffcheck' },
  { id: 'conferencing', label: 'Conferencing', icon: Video, path: '/videocall' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <motion.div
      className={`min-h-screen shadow-2xl text-white flex-shrink-0 relative z-20 ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
      style={{
        background: darkMode 
          ? 'linear-gradient(135deg, #003e0bff 0%, #016717ff 50%, #03750bff 100%)'
          : 'linear-gradient(135deg, #0d962fff 0%, #14b327ff 50%, #0d9634ff 100%)',
        boxShadow: '0 0 30px rgba(0, 200, 83, 0.15)'
      }}
      initial={{ width: 80 }}
      animate={{ 
        width: isHovered && isCollapsed ? 280 : isCollapsed ? 80 : 280
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-24 z-30 bg-white p-2 rounded-full shadow-lg border border-green-200"
        whileHover={{ scale: 1.1, boxShadow: "0 0 15px rgba(72, 187, 120, 0.5)" }}
        whileTap={{ scale: 0.9 }}
        style={{ color: darkMode ? '#0d3b29' : '#0d966c' }}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </motion.button>

      <div className="px-4 pb-6 pt-6 h-full flex flex-col">
        {/* Logo Section */}
        <motion.div 
          className="flex items-center mb-10 px-2 py-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
          animate={{ 
            justifyContent: isCollapsed && !isHovered ? 'center' : 'flex-start' 
          }}
        >
          <motion.div 
            className="w-10 h-10 flex-shrink-0 rounded-xl bg-white/10 flex items-center justify-center shadow-inner"
            whileHover={{ rotate: 5, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <img src={solo} alt="Logo" className="w-6 h-6 filter brightness-110" />
          </motion.div>
          <AnimatePresence>
            {(isHovered || !isCollapsed) && (
              <motion.div
                className="ml-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Zira<span className="font-light">Hr</span>
                </h1>
                <p className="text-green-200 text-xs font-medium">Smiles Start Here</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <motion.button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center  font-medium px-0.5 py-3 rounded-xl transition-all duration-200 relative overflow-hidden group ${
                  isActive
                    ? 'bg-white/15 text-white shadow-lg'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center">
                  <motion.div 
                    className={`relative p-2 rounded-lg ${isActive ? 'bg-white/20 ml-2' : 'group-hover:bg-white/15 ml-2'}`}
                    whileHover={{ rotate: 5 }}
                  >
                    <item.icon
                      className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-white/80 group-hover:text-white'}`}
                    />
                  </motion.div>
                  <AnimatePresence>
                    {(isHovered || !isCollapsed) && (
                      <motion.span
                        className="ml-3 text-sm font-medium whitespace-nowrap"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                {isActive && (
                  <motion.div
                    className="absolute left-0 h-4/5 w-1 bg-white rounded-r"
                    layoutId="activeIndicator"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                {!isActive && (
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 group-hover:opacity-100"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Bottom spacer */}
        <div className="flex-1"></div>

        {/* Theme Toggle */}
        <motion.div 
          className="mb-4 px-2 py-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
          animate={{
            justifyContent: isCollapsed && !isHovered ? 'center' : 'space-between'
          }}
        >
          <AnimatePresence>
            {(isHovered || !isCollapsed) && (
              <motion.span
                className="text-sm text-white/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Dark mode
              </motion.span>
            )}
          </AnimatePresence>
          
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="w-10 h-5 rounded-full bg-white/20 relative"
          >
            <motion.div 
              className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white"
              animate={{ x: darkMode ? 20 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
        </motion.div>

        {/* User/Settings Area */}
        <motion.div 
          className="px-2 py-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
          animate={{
            justifyContent: isCollapsed && !isHovered ? 'center' : 'flex-start'
          }}
        >
          <div className="flex items-center">
            <motion.div 
              className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center ml-1 shadow-inner"
              whileHover={{ rotate: 5 }}
            >
              <Settings className="w-5 h-5 text-white/80" />
            </motion.div>
            <AnimatePresence>
              {(isHovered || !isCollapsed) && (
                <motion.div
                  className="ml-3 flex-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-sm font-medium text-white">Settings</p>
                  <p className="text-xs text-green-200">Account & Preferences</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <AnimatePresence>
            {(isHovered || !isCollapsed) && (
              <motion.button
                className="w-full mt-4 flex items-center text-white/80 hover:text-white py-2 px-3 rounded-lg hover:bg-white/5 transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ x: 5 }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="text-sm">Logout</span>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}