import React, { useEffect } from 'react';
import { Users, Calendar, DollarSign, TrendingUp, UserCheck, Clock, AlertTriangle, Award, ChevronRight } from 'lucide-react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Animated StatsCard component
function StatsCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  iconClassName, 
  className = '', 
  description,
  delay = 0
}) {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-emerald-600';
      case 'negative': return 'text-rose-600';
      default: return 'text-gray-600';
    }
  };

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: delay * 0.1,
        duration: 0.6,
        ease: [0.2, 0.65, 0.3, 0.9]
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      className={`bg-white rounded-xl p-6 ${className} h-full flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={iconClassName}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="flex-grow flex flex-col">
        <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
        <p className={`text-sm ${getChangeColor()} mb-3 flex items-center`}>
          {changeType === 'positive' ? (
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 7a1 1 0 01-1 1H9v1h2a1 1 0 110 2H9v1h2a1 1 0 110 2H9v1a1 1 0 11-2 0v-1H5a1 1 0 110-2h2v-1H5a1 1 0 110-2h2V8H5a1 1 0 010-2h2V5a1 1 0 112 0v1h2a1 1 0 011 1z" clipRule="evenodd" />
            </svg>
          ) : changeType === 'negative' ? (
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          ) : null}
          {change}
        </p>
        
        {description && (
          <p className="text-xs text-gray-500 mt-auto">
            {description}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// Quick Stat component with animation
function QuickStat({ label, value, icon: Icon, iconClass, delay = 0 }) {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: delay * 0.1,
        duration: 0.5,
        ease: [0.2, 0.65, 0.3, 0.9]
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      className="text-center p-5 rounded-xl bg-white border border-gray-100 hover:shadow-md transition-all duration-300 h-full flex flex-col items-center justify-center"
    >
      <div className={`p-2 rounded-full mb-3 ${iconClass} w-9 h-9 flex items-center justify-center`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mt-1">{label}</p>
    </motion.div>
  );
}

export default function Dashboard() {
  // Critical executive metrics - Kenya HR context
  const stats = [
    {
      title: 'Staff Headcount',
      value: '247',
      change: '+12 this quarter',
      changeType: 'positive' as const,
      icon: Users,
      iconClass: 'text-blue-600 bg-blue-50',
      description: 'Total permanent and contract employees'
    },
    {
      title: 'Loan Collection Rate',
      value: '94.2%',
      change: '2% below target',
      changeType: 'negative' as const,
      icon: UserCheck,
      iconClass: 'text-amber-600 bg-amber-50',
      description: 'Daily staff attendance and punctuality'
    },
    {
      title: 'Payroll (KES)',
      value: '24.8M',
      change: 'On budget',
      changeType: 'positive' as const,
      icon: DollarSign,
      iconClass: 'text-emerald-600 bg-emerald-50',
      description: 'Monthly gross salary and benefits'
    },
    {
      title: 'Open Positions',
      value: '15',
      change: '6 critical roles',
      changeType: 'negative' as const,
      icon: TrendingUp,
      iconClass: 'text-rose-600 bg-rose-50',
      description: 'Vacant positions affecting operations'
    }
  ];
  
  const quickStats = [
    { 
      label: 'Present Today', 
      value: '1,189', 
      icon: UserCheck,
      iconClass: 'text-emerald-600 bg-emerald-50'
    },
    { 
      label: 'Late Arrivals', 
      value: '12', 
      icon: Clock,
      iconClass: 'text-amber-600 bg-amber-50'
    },
    { 
      label: 'Pending Tasks', 
      value: '47', 
      icon: AlertTriangle,
      iconClass: 'text-rose-600 bg-rose-50'
    },
    { 
      label: 'Top Performers', 
      value: '156', 
      icon: Award,
      iconClass: 'text-indigo-600 bg-indigo-50'
    }
  ];

  const controls = useAnimation();
  const [ref, inView] = useInView();

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.2, 0.65, 0.3, 0.9] }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Executive Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm">Key people metrics requiring leadership attention</p>
        </div>
        <div className="text-right">
          <p className="text-gray-900 font-medium text-sm">{new Date().toLocaleDateString('en-KE', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>
      </motion.div>
      
      {/* Strategic Metrics - Equal Height Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {stats.map((stat, index) => (
          <StatsCard 
            key={stat.title}
            {...stat}
            delay={index}
            iconClassName={`p-2 rounded-lg ${stat.iconClass} w-10 h-10 flex items-center justify-center`}
          />
        ))}
      </motion.div>
      
      {/* Operational Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-5">Daily Operations</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <QuickStat 
              key={stat.label}
              {...stat}
              delay={index + 4} // Start after the main stats
            />
          ))}
        </div>
      </motion.div>
      
      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-gray-900">Talent Alerts</h3>
            <button className="text-xs font-medium text-blue-600 flex items-center">
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="space-y-2">
            {[
              { action: 'NHIF remittance due in 3 days', person: 'Payroll Department', time: 'Action required', type: 'warning' },
              { action: 'Work permit expiring for 2 staff', person: 'Immigration Compliance', time: 'Urgent renewal', type: 'negative' },
              { action: 'KRA PIN verification pending', person: '5 new employees', time: 'Blocking onboarding', type: 'negative' },
              { action: 'P9 forms generated successfully', person: 'Annual Tax Returns', time: 'Completed', type: 'success' }
            ].map((activity, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + (index * 0.1) }}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
              >
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'success' ? 'bg-emerald-500' : 
                  activity.type === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-gray-900 text-sm font-medium">{activity.action}</p>
                  <p className="text-gray-500 text-xs">{activity.person} • <span className={`font-medium ${
                    activity.type === 'success' ? 'text-emerald-600' : 
                    activity.type === 'warning' ? 'text-amber-600' : 'text-rose-600'
                  }`}>{activity.time}</span></p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-gray-900">Strategic Initiatives</h3>
            <button className="text-xs font-medium text-blue-600 flex items-center">
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="space-y-2">
            {[
              { event: 'Annual performance reviews', date: 'March 2025', time: '247 employees', status: 'planned' },
              { event: 'NHIF rate adjustment', date: 'Jan 2025', time: 'System update needed', status: 'at-risk' },
              { event: 'Staff medical checkups', date: 'Q2 2025', time: 'Occupational health', status: 'on-track' },
              { event: 'Pension scheme enrollment', date: 'Feb 2025', time: '23 new joiners', status: 'on-track' }
            ].map((event, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + (index * 0.1) }}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
              >
                <div>
                  <p className="text-gray-900 text-sm font-medium">{event.event}</p>
                  <p className="text-gray-500 text-xs">{event.date} • {event.time}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  event.status === 'on-track' ? 'bg-emerald-100 text-emerald-800' :
                  event.status === 'at-risk' ? 'bg-amber-100 text-amber-800' :
                  event.status === 'delayed' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {event.status.replace('-', ' ')}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}