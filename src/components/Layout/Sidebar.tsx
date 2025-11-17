import React, { useState, useEffect } from 'react';
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
  Slack,
  Sparkles,
  Zap,
  KeyRound
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
  { id: 'advanced', label: 'Sallary Advance', icon: Wallet, path: '/salaryadmin', allowedRoles: ['ADMIN','CHECKER'] },
  { id: 'teams', label: 'Teams', icon: Slack, path: '/teams' },
  { id: 'employees', label: 'Employees', icon: Users, path: '/employees' },
  { id: 'recruitment', label: 'Recruitment', icon: UserPlus, path: '/recruitment', allowedRoles: ['ADMIN', 'HR','OPERATIONS','CHECKER'] },
  { id: 'leaves', label: 'Leave Management', icon: Calendar, path: '/leaves' },
  { id: 'payroll', label: 'Payroll', icon: Wallet, path: '/payroll', allowedRoles: ['ADMIN','CHECKER'] },
  { id: 'email admin', label: 'Email Admin', icon: KeyRound, path: '/adminconfirm', allowedRoles: ['ADMIN','CHECKER','HR'] },
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
  const [activeGlow, setActiveGlow] = useState('');

  // Active item glow effect
  useEffect(() => {
    const activeItem = menuItems.find(item => currentPath === item.path);
    if (activeItem) {
      setActiveGlow(activeItem.id);
      const timer = setTimeout(() => setActiveGlow(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentPath]);

  return (
    <div className="relative">
      {/* Enhanced Floating Container */}
      <motion.div
        className={`min-h-[95vh] text-gray-900 flex-shrink-0 relative z-20 font-poppins mx-4 my-4 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
        style={{
          background: darkMode 
            ? 'linear-gradient(135deg, rgba(0, 221, 255, 0.25) 0%, rgba(0, 252, 76, 0.2) 50%, rgba(255, 255, 255, 0.1) 100%)'
            : 'linear-gradient(135deg, #d2f9dc 0%, #b6a6ff 50%, #85ffa7 100%)',
          fontFamily: "'Poppins', sans-serif",
          borderRadius: '28px',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            inset 0 -1px 0 rgba(0, 0, 0, 0.1)
          `,
        }}
        initial={{ width: 64 }}
        animate={{ 
          width: isHovered && isCollapsed ? 256 : isCollapsed ? 64 : 256
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Enhanced Toggle Button */}
        <motion.button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-24 z-30 bg-white/90 p-2 rounded-full shadow-lg border border-green-300/50 backdrop-blur-sm"
          whileHover={{ 
            scale: 1.1, 
            boxShadow: "0 0 20px rgba(72, 187, 120, 0.6)",
            y: -1,
            rotate: isCollapsed ? 180 : -180
          }}
          whileTap={{ scale: 0.9 }}
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

        <div className="px-4 pb-6 pt-6 h-full flex flex-col">
          {/* Fixed Logo Section - Background only when expanded */}
          <motion.div 
            className={`flex items-center mb-8 rounded-2xl transition-all duration-300 ${
              isCollapsed && !isHovered 
                ? 'p-0 justify-center bg-transparent border-none' 
                : 'px-3 py-4 justify-start bg-white/10 backdrop-blur-sm border border-white/20'
            }`}
            animate={{ 
              justifyContent: isCollapsed && !isHovered ? 'center' : 'flex-start' 
            }}
            whileHover={{ 
              scale: (isCollapsed && !isHovered) ? 1 : 1.02,
              backgroundColor: (isCollapsed && !isHovered) ? 'transparent' : 'rgba(255, 255, 255, 0.15)'
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Logo Container - Always centered within its space */}
            <motion.div 
              className="flex items-center justify-center"
              animate={{
                width: isCollapsed && !isHovered ? '100%' : 'auto',
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <motion.div 
                className="flex-shrink-0 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg w-10 h-10"
                whileHover={{ 
                  rotate: [0, -5, 5, 0],
                  scale: 1.1,
                  transition: { duration: 0.5 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.img 
                  src={solo} 
                  alt="Logo" 
                  className="w-6 h-6 filter brightness-110 drop-shadow-sm"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
              </motion.div>
              
              {/* Text Section - Only appears when expanded */}
              <AnimatePresence mode="wait">
                {(isHovered || !isCollapsed) && ( 
                  <motion.div
                    className="ml-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    <motion.h1 
                      className="text-lg font-bold text-gray-900 tracking-tight"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                      whileHover={{ scale: 1.05 }}
                    >
                      Zira<span className="font-light">Hr</span>
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-1 inline-block"
                      >
                      </motion.span>
                    </motion.h1>
                    <motion.p 
                      className="text-gray-900 text-xs font-medium mt-1"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      Smiles Start Here
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Enhanced Navigation - Cleaner active states when collapsed */}
          <nav className="space-y-5 flex-1">
            {menuItems.map((item) => {
              const isActive = currentPath === item.path;
              const hasGlow = activeGlow === item.id;
              const isCollapsedState = isCollapsed && !isHovered;
              
              const ButtonComponent = (
                <motion.button
                  onClick={() => navigate(item.path)}
                  className={`flex items-center rounded-2xl transition-all duration-300 relative overflow-hidden group ${
                    isCollapsedState ? 'w-12 justify-center px-0 mx-auto' : 'w-full px-2'
                  } ${
                    isActive
                      ? isCollapsedState 
                        ? 'bg-white/20 shadow-md' 
                        : 'bg-white/30 text-gray-900 shadow-lg'
                      : 'text-gray-900 hover:text-gray-900 hover:bg-white/15'
                  }`}
                  style={{ 
                    fontFamily: "'Poppins', sans-serif",
                    height: '44px'
                  }}
                  whileHover={{ 
                    scale: isCollapsedState ? 1.05 : 1.02,
                    x: isCollapsedState ? 0 : 4,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Active Glow Effect - Only show when expanded */}
                  {hasGlow && !isCollapsedState && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-2xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    />
                  )}

                  <div className={`flex items-center ${isCollapsedState ? 'justify-center' : 'justify-between w-full'}`}>
                    <div className="flex items-center">
                      <motion.div 
                        className={`relative rounded-xl ${
                          isCollapsedState ? 'p-2.5' : 'p-2'
                        } ${
                          isActive 
                            ? 'bg-white/25 shadow-md' 
                            : 'bg-white/10 group-hover:bg-white/20'
                        }`}
                        whileHover={{ 
                          rotate: isCollapsedState ? 0 : 5,
                          scale: 1.1
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <item.icon
                          className={`flex-shrink-0 w-4 h-4 ${
                            isActive 
                              ? 'text-gray-900 drop-shadow-sm' 
                              : 'text-gray-900 group-hover:text-gray-900'
                          }`}
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

                    {/* Badge - Only show when expanded */}
                    {(isHovered || !isCollapsed) && item.badge && (
                      <motion.span
                        className={`px-1.5 py-0.5 rounded-full text-xs font-bold`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        style={{
                          backgroundColor: 
                            item.badge === 'NEW' ? '#ef4444' : 
                            item.badge === '↑' ? '#22c55e' : 
                            '#3b82f6',
                          color: 'white'
                        }}
                      >
                        {item.badge}
                      </motion.span>
                    )}
                  </div>
                  
                  {/* Enhanced Hover Effect */}
                  {!isActive && (
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100"
                      transition={{ duration: 0.4 }}
                    />
                  )}

                  {/* Active Indicator - Only show when expanded */}
                  {isActive && !isCollapsedState && (
                    <motion.div
                      className="absolute right-2 w-1 h-6 bg-gradient-to-b from-orange-400 to-red-500 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    />
                  )}
                </motion.button>
              );

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

              return (
                <div key={item.id}>
                  {ButtonComponent}
                </div>
              );
            })}
          </nav>

          {/* Enhanced Bottom Section */}
          <div className="space-y-3 mt-8">
            {/* Theme Toggle */}
            <motion.button
              onClick={() => setDarkMode(!darkMode)}
              className={`flex items-center rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-300 group ${
                isCollapsed && !isHovered ? 'w-12 justify-center px-0 mx-auto' : 'w-full px-2'
              }`}
              style={{ height: '44px' }}
              whileHover={{ scale: isCollapsed && !isHovered ? 1.05 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className={`rounded-xl bg-white/15 ${
                  isCollapsed && !isHovered ? 'p-2.5' : 'p-2'
                }`}
                whileHover={{ rotate: isCollapsed && !isHovered ? 0 : 180 }}
                transition={{ duration: 0.5 }}
              >
                {darkMode ? (
                  <Sun className="w-4 h-4 text-yellow-500" />
                ) : (
                  <Moon className="w-4 h-4 text-blue-500" />
                )}
              </motion.div>
              <AnimatePresence>
                {(isHovered || !isCollapsed) && (
                  <motion.span
                    className="ml-3 text-xs font-medium text-gray-900"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    {darkMode ? 'Light Mode' : 'Dark Mode'}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Enhanced User Area */}
            <motion.div 
              className={`rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 ${
                isCollapsed && !isHovered ? 'p-3 justify-center' : 'px-3 py-4 justify-start'
              }`}
              animate={{
                justifyContent: isCollapsed && !isHovered ? 'center' : 'flex-start'
              }}
              whileHover={{ 
                scale: 1.02,
                backgroundColor: 'rgba(255, 255, 255, 0.15)'
              }}
            >
              <div className="flex items-center">
                <motion.div 
                  className={`flex-shrink-0 rounded-2xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center shadow-lg ${
                    isCollapsed && !isHovered ? 'w-8 h-8' : 'w-10 h-10'
                  }`}
                  whileHover={{ 
                    scale: 1.1,
                    rotate: [0, -5, 5, 0]
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <UserPlus className={`text-white ${isCollapsed && !isHovered ? 'w-4 h-4' : 'w-5 h-5'}`} />
                </motion.div>
                <AnimatePresence>
                  {(isHovered || !isCollapsed) && (
                    <motion.div
                      className="ml-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      <p className="text-xs font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        Welcome Back!
                      </p>
                      <motion.p 
                        className="text-xs text-gray-900 mt-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        Ready to create smiles? 😊
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Subtle Background Animation */}
        <motion.div
          className="absolute inset-0 rounded-3xl bg-gradient-to-br from-transparent via-white/5 to-transparent pointer-events-none"
          animate={{
            background: [
              'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)',
              'linear-gradient(135deg, transparent, rgba(255,255,255,0.05), transparent)',
              'linear-gradient(225deg, transparent, rgba(255,255,255,0.1), transparent)',
              'linear-gradient(315deg, transparent, rgba(255,255,255,0.05), transparent)',
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
    </div>
  );
}