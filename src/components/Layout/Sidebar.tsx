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
  MessageCircleMore,
  Siren,
  LogOut,
  Sun,
  Moon,
  HandCoins,
  LayoutDashboard,
  Wallet,
  Blocks,
  MessageSquareMore,
  Slack
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import solo from '../../../public/solo.png';
import RoleButtonWrapper from '../ProtectedRoutes/RoleButton'

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'ai-assistant', label: 'AI Assistant', icon: Bot, path: '/ai-assistant' },
  { id: 'task-manager', label: 'Task Manager', icon: Blocks, path: '/tasks' },
  { id: 'messages', label: 'SMS Center', icon: MessageSquareMore, path: '/sms' },
  { id: 'teams', label: 'teams', icon: Slack, path: '/teams' },
  { id: 'employees', label: 'Employees', icon: Users, path: '/employees' },
  { id: 'recruitment', label: 'Recruitment', icon: UserPlus, path: '/recruitment', allowedRoles: ['ADMIN', 'HR','OPERATIONS','CHECKER'] },
  { id: 'leaves', label: 'Leave Management', icon: Calendar, path: '/leaves' },
  { id: 'payroll', label: 'Payroll', icon: Wallet, path: '/payroll', allowedRoles: ['ADMIN','CHECKER'] },
  { id: 'performance', label: 'Performance', icon: BarChart3 , path: '/performance' },
  { id: 'training', label: 'Training', icon: GraduationCap, path: '/training', allowedRoles: ['ADMIN', 'HR','OPERATIONS','CHECKER'] },
  { id: 'reports', label: 'Reports', icon: FileText, path: '/reports', allowedRoles: ['ADMIN', 'HR','OPERATIONS','MANAGER','REGIONAL','CHECKER'] },
  { id: 'expense', label: 'Expense', icon: HandCoins, path: '/expenses',allowedRoles: ['ADMIN', 'OPERATIONS','MANAGER','REGIONAL','CHECKER'] },
  { id: 'staffcheck', label: 'Disciplinary', icon: Siren, path: '/staffcheck', allowedRoles: ['ADMIN', 'HR','OPERATIONS','CHECKER'] },
  { id: 'conferencing', label: 'Conferencing', icon: Video, path: '/videocall' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings', allowedRoles: ['ADMIN','CHECKER'] },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className="relative">
      {/* Floating Container with Curved Edges - Reduced Width - Shadow Removed */}
      <motion.div
        className={`min-h-[95vh]  text-gray-900 flex-shrink-0 relative z-20 font-poppins mx-4 my-4 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
        style={{
          background: darkMode 
            ? 'linear-gradient(135deg, #00ddff41 20%, #00fc4c33 80%, #ffffffff 100%)'
            : 'linear-gradient(135deg, #d2f9dcff 20%, #b6a6ffff 50%, #85ffa7ff 100%)',
          // Shadow removed from here
          fontFamily: "'Poppins', sans-serif",
          borderRadius: '24px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(54, 54, 54, 0.2)'
        }}
        initial={{ width: 64 }}
        animate={{ 
          width: isHovered && isCollapsed ? 256 : isCollapsed ? 64 : 256
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Toggle Button - Reduced Size */}
        <motion.button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-2 top-24 z-30 bg-white p-1 rounded-full shadow-md border border-green-200"
          whileHover={{ 
            scale: 1.05, 
            boxShadow: "0 0 10px rgba(72, 187, 120, 0.4)",
            y: -1
          }}
          whileTap={{ scale: 0.85 }}
          style={{ 
            color: darkMode ? '#0d3b29' : '#0d966c'
          }}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </motion.button>

        <div className="px-3 pb-6 pt-6 h-full flex flex-col">
          {/* Logo Section - Removed shadow and effects */}
          <motion.div 
            className="flex items-center mb-8 px-2 py-3 rounded-xl bg-white/5  border border-white/10"
            animate={{ 
              justifyContent: isCollapsed && !isHovered ? 'center' : 'flex-start' 
            }}
          >
            <motion.div 
              className="w-8 h-8 flex-shrink-0 rounded-xl bg-blue-400 flex items-center justify-center"
              whileHover={{ rotate: 5, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <img src={solo} alt="Logo" className="w-8 h-8 filter brightness-110" />
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
                  <h1 className="text-lg font-bold text-gray-900 tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Zira<span className="font-light">Hr</span>
                  </h1>
                  <p className="text-gray-900 text-xs font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>Smiles Start Here</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Navigation - Original font size */}
          <nav className="space-y-1.5 flex-1">
            {menuItems.map((item) => {
              const isActive = currentPath === item.path;
              
              // Create the button component
              const ButtonComponent = (
                <motion.button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center px-0.5 py-2.5 rounded-xl transition-all duration-200 relative overflow-hidden group ${
                    isActive
                      ? 'bg-orange/30 text-gray-900 '
                      : 'text-gray-900 hover:text-gray-900 hover:bg-white/10'
                  }`}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <div className="flex items-center">
                    <motion.div 
                      className={`relative p-2 rounded-lg ${isActive ? 'bg-white/20 ml-1' : 'group-hover:bg-white/15 ml-1'}`}
                      whileHover={{ rotate: 5 }}
                    >
                      <item.icon
                        className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-gray-900' : 'text-gray-900 group-hover:text-gray-900'}`}
                      />
                    </motion.div>
                    <AnimatePresence>
                      {(isHovered || !isCollapsed) && (
                        <motion.span
                          className="ml-3 text-xs font-medium whitespace-nowrap"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          style={{ fontFamily: "'Poppins', sans-serif" }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {!isActive && (
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 group-hover:opacity-100"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.button>
              );

              // If item has required roles, wrap it with RoleButtonWrapper
              if (item.allowedRoles) {
                return (
                  <RoleButtonWrapper 
                    key={item.id}
                    allowedRoles={item.allowedRoles}
                    fallback={null}
                  >
                    {ButtonComponent}
                  </RoleButtonWrapper>
                );
              }

              // Otherwise, return the button directly
              return (
                <div key={item.id}>
                  {ButtonComponent}
                </div>
              );
            })}
          </nav>

          {/* Bottom spacer */}
          <div className="flex-1"></div>

          {/* Theme Toggle - Original styling */}
          

          {/* User/Settings Area - Simple styling */}
          <motion.div 
            className="px-2 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
            animate={{
              justifyContent: isCollapsed && !isHovered ? 'center' : 'flex-start'
            }}
          >
            <div className="flex items-center">
              {/* Simple user icon */}
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-gray-900" />
              </div>
              <AnimatePresence>
                {(isHovered || !isCollapsed) && (
                  <motion.div
                    className="ml-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <p className="text-xs text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      Welcome!
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}