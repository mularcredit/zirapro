import React from 'react';
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
  Bot
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../Dashboard/PUBLIC/logo.png';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/dashboard' },
   { id: 'ai-assistant', label: 'AI assistant', icon: Bot, path: '/ai-assistant' },
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

  return (
    <div className="w-64 bg-slate-50 border-r border-green-500/30 min-h-screen shadow-xl">
      <div className="p-6">
        <div className="flex items-center mb-2">
          <img src={logo} alt="Logo" className="w-16 h-16" />
          <div>
            <h1 className="text-xl font-bold text-black">ZiraHr</h1>
            <p className="text-green-700 text-sm">Smiles Start Here</p>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <motion.button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full text-xs flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-green-500/20 text-black shadow-base shadow-green-500/40 border border-green-500/50'
                    : 'text-black text-sm hover:text-green hover:bg-green-500/20 hover:border-green-500/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon
                  className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]' : ''}`}
                />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
