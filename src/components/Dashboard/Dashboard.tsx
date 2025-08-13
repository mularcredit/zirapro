import React, { useEffect } from 'react';
import { Users, Calendar, DollarSign, TrendingUp, UserCheck, Clock, AlertTriangle, Award, ChevronRight } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Illustration components (would normally be SVG components or imported images)
const TeamIllustration = () => (
  <div className="w-full h-full bg-blue-50 rounded-xl flex items-center justify-center">
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="55" fill="#3B82F6" fillOpacity="0.1"/>
      <circle cx="40" cy="45" r="12" fill="#3B82F6"/>
      <circle cx="80" cy="45" r="12" fill="#3B82F6"/>
      <path d="M30 85C30 70 45 70 60 70C75 70 90 70 90 85" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  </div>
);

const FinanceIllustration = () => (
  <div className="w-full h-full bg-emerald-50 rounded-xl flex items-center justify-center">
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="55" fill="#10B981" fillOpacity="0.1"/>
      <rect x="30" y="50" width="60" height="30" rx="4" fill="#10B981"/>
      <path d="M30 60H90" stroke="white" strokeWidth="2"/>
      <path d="M30 70H90" stroke="white" strokeWidth="2"/>
      <circle cx="60" cy="40" r="10" fill="#10B981"/>
    </svg>
  </div>
);

const HiringIllustration = () => (
  <div className="w-full h-full bg-rose-50 rounded-xl flex items-center justify-center">
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="55" fill="#EF4444" fillOpacity="0.1"/>
      <rect x="40" y="40" width="40" height="50" rx="4" fill="#EF4444"/>
      <circle cx="60" cy="35" r="10" fill="#EF4444"/>
      <rect x="45" y="55" width="30" height="4" rx="2" fill="white"/>
      <rect x="45" y="65" width="30" height="4" rx="2" fill="white"/>
    </svg>
  </div>
);

const PerformanceIllustration = () => (
  <div className="w-full h-full bg-indigo-50 rounded-xl flex items-center justify-center">
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="55" fill="#6366F1" fillOpacity="0.1"/>
      <path d="M30 80L45 50L65 70L85 40" stroke="#6366F1" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="30" cy="80" r="4" fill="#6366F1"/>
      <circle cx="45" cy="50" r="4" fill="#6366F1"/>
      <circle cx="65" cy="70" r="4" fill="#6366F1"/>
      <circle cx="85" cy="40" r="4" fill="#6366F1"/>
    </svg>
  </div>
);

// StatsCard with illustration support
function StatsCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  iconClassName, 
  illustration: Illustration,
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
      case 'positive': return 'text-emerald-500';
      case 'negative': return 'text-rose-500';
      default: return 'text-gray-500';
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
      className={`bg-white rounded-2xl p-6 ${className} h-full flex flex-col shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden`}
    >
      {Illustration && (
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
          <Illustration />
        </div>
      )}
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${iconClassName} w-12 h-12 flex items-center justify-center`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        
        <div className="flex-grow flex flex-col">
          <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">{title}</h3>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
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
      </div>
    </motion.div>
  );
}

// QuickStat with modern design
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
      className="text-center p-5 rounded-xl bg-white border border-gray-100 hover:shadow-lg transition-all duration-300 h-full flex flex-col items-center justify-center relative overflow-hidden"
    >
      <div className={`p-3 rounded-xl mb-3 ${iconClass} w-12 h-12 flex items-center justify-center z-10`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900 z-10">{value}</p>
      <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mt-1 z-10">{label}</p>
      <div className={`absolute -right-10 -bottom-10 w-24 h-24 rounded-full ${iconClass.replace('bg-', 'bg-').replace('50', '100')} opacity-20`}></div>
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
      iconClass: 'text-blue-500 bg-blue-50',
      illustration: TeamIllustration,
      description: 'Total permanent and contract employees'
    },
    {
      title: 'Loan Collection Rate',
      value: '94.2%',
      change: '2% below target',
      changeType: 'negative' as const,
      icon: UserCheck,
      iconClass: 'text-amber-500 bg-amber-50',
      description: 'Daily staff attendance and punctuality'
    },
    {
      title: 'Payroll (KES)',
      value: '24.8M',
      change: 'On budget',
      changeType: 'positive' as const,
      icon: DollarSign,
      iconClass: 'text-emerald-500 bg-emerald-50',
      illustration: FinanceIllustration,
      description: 'Monthly gross salary and benefits'
    },
    {
      title: 'Open Positions',
      value: '15',
      change: '6 critical roles',
      changeType: 'negative' as const,
      icon: TrendingUp,
      iconClass: 'text-rose-500 bg-rose-50',
      illustration: HiringIllustration,
      description: 'Vacant positions affecting operations'
    }
  ];
  
  const quickStats = [
    { 
      label: 'Present Today', 
      value: '1,189', 
      icon: UserCheck,
      iconClass: 'text-emerald-500 bg-emerald-50'
    },
    { 
      label: 'Late Arrivals', 
      value: '12', 
      icon: Clock,
      iconClass: 'text-amber-500 bg-amber-50'
    },
    { 
      label: 'Pending Tasks', 
      value: '47', 
      icon: AlertTriangle,
      iconClass: 'text-rose-500 bg-rose-50'
    },
    { 
      label: 'Top Performers', 
      value: '156', 
      icon: Award,
      iconClass: 'text-indigo-500 bg-indigo-50'
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
    <div className="p-6 space-y-8 max-w-7xl mx-auto bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Modern Header with gradient */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.2, 0.65, 0.3, 0.9] }}
        className="flex items-center justify-between pb-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HR Executive Dashboard</h1>
          <p className="text-gray-500 mt-1">Key people metrics requiring leadership attention</p>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center px-4 py-2 rounded-lg bg-white border border-gray-200 shadow-sm">
            <Calendar className="w-5 h-5 text-gray-500 mr-2" />
            <p className="text-gray-900 font-medium">
              {new Date().toLocaleDateString('en-KE', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* Strategic Metrics with illustrations */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <StatsCard 
            key={stat.title}
            {...stat}
            delay={index}
            iconClassName={stat.iconClass}
          />
        ))}
      </motion.div>
      
      {/* Operational Metrics with circular accent */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Daily Operations</h2>
          <button className="text-sm font-medium text-blue-500 hover:text-blue-600 flex items-center transition-colors">
            View details <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {quickStats.map((stat, index) => (
            <QuickStat 
              key={stat.label}
              {...stat}
              delay={index + 4}
            />
          ))}
        </div>
      </motion.div>
      
      {/* Recent Activities with visual indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Talent Alerts</h3>
            <button className="text-sm font-medium text-blue-500 hover:text-blue-600 flex items-center transition-colors">
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="space-y-3">
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
                className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200 cursor-pointer border border-transparent hover:border-gray-100"
              >
                <div className={`mt-1 w-3 h-3 rounded-full flex-shrink-0 ${
                  activity.type === 'success' ? 'bg-emerald-500' : 
                  activity.type === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">{activity.action}</p>
                  <p className="text-gray-500 text-sm mt-1">{activity.person} • <span className={`font-medium ${
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
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Strategic Initiatives</h3>
            <button className="text-sm font-medium text-blue-500 hover:text-blue-600 flex items-center transition-colors">
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="space-y-3">
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
                className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200 cursor-pointer border border-transparent hover:border-gray-100"
              >
                <div>
                  <p className="text-gray-900 font-medium">{event.event}</p>
                  <p className="text-gray-500 text-sm mt-1">{event.date} • {event.time}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
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
      
      {/* Performance Visualization Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Performance Trends</h3>
          <button className="text-sm font-medium text-blue-500 hover:text-blue-600 flex items-center transition-colors">
            View analytics <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        <div className="h-64 bg-indigo-50 rounded-xl flex items-center justify-center">
          <PerformanceIllustration />
          <div className="ml-6">
            <h4 className="text-lg font-medium text-gray-900">Quarterly Performance Overview</h4>
            <p className="text-gray-500 mt-2">Visual representation coming soon</p>
            <button className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors">
              Generate Report
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}