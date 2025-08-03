import React from 'react';
import { Users, Calendar, DollarSign, TrendingUp, UserCheck, Clock, AlertTriangle, Award } from 'lucide-react';

// StatsCard component
function StatsCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  color, 
  iconClassName, 
  className = '', 
  description,
  children 
}) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={`bg-white rounded-lg p-6 ${className} h-full flex flex-col`}>
      <div className="flex items-center justify-between mb-4">
        <div className={iconClassName}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      <div className="flex-grow flex flex-col">
        <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
        <p className={`text-sm ${getChangeColor()} mb-3`}>{change}</p>
        
        {description && (
          <p className="text-xs text-gray-600 mt-auto">
            {description}
          </p>
        )}
        
        {children}
      </div>
    </div>
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
      color: 'gray' as const,
      iconClass: 'text-gray-700 bg-gray-100',
      description: 'Total permanent and contract employees'
    },
    {
      title: 'Loan Collection Rate',
      value: '94.2%',
      change: '2% below target',
      changeType: 'negative' as const,
      icon: UserCheck,
      color: 'gray' as const,
      iconClass: 'text-gray-700 bg-gray-100',
      description: 'Daily staff attendance and punctuality'
    },
    {
      title: 'Payroll (KES)',
      value: '24.8M',
      change: 'On budget',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'gray' as const,
      iconClass: 'text-gray-700 bg-gray-100',
      description: 'Monthly gross salary and benefits'
    },
    {
      title: 'Open Positions',
      value: '15',
      change: '6 critical roles',
      changeType: 'negative' as const,
      icon: TrendingUp,
      color: 'gray' as const,
      iconClass: 'text-gray-700 bg-gray-100',
      description: 'Vacant positions affecting operations'
    }
  ];
  
  const quickStats = [
    { 
      label: 'Present Today', 
      value: '1,189', 
      icon: UserCheck,
      iconClass: 'text-green-600 bg-green-100/80'
    },
    { 
      label: 'Late Arrivals', 
      value: '12', 
      icon: Clock,
      iconClass: 'text-yellow-600 bg-yellow-100/80'
    },
    { 
      label: 'Pending Tasks', 
      value: '47', 
      icon: AlertTriangle,
      iconClass: 'text-red-600 bg-red-100/80'
    },
    { 
      label: 'Top Performers', 
      value: '156', 
      icon: Award,
      iconClass: 'text-purple-600 bg-purple-100/80'
    }
  ];
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Executive Dashboard</h1>
          <p className="text-gray-600 mt-1">Key people metrics requiring leadership attention</p>
        </div>
        <div className="text-right">
          <p className="text-gray-900 font-semibold">{new Date().toLocaleDateString('en-KE', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>
      </div>
      
      {/* Strategic Metrics - Equal Height Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={stat.title} className="h-full">
            <StatsCard 
              {...stat}
              iconClassName={`p-3 rounded-lg ${stat.iconClass} w-12 h-12 flex items-center justify-center shadow-md`}
              className="border border-gray-300 "
            />
          </div>
        ))}
      </div>
      
      {/* Operational Metrics */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Operations</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center p-4 rounded-lg bg-white border border-gray-200 hover:shadow-md transition-all duration-200 h-full flex flex-col items-center justify-center"
            >
              <div className={`p-2 rounded-full mb-3 ${stat.iconClass} w-10 h-10 flex items-center justify-center`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Talent Alerts</h3>
          <div className="space-y-3">
            {[
              { action: 'NHIF remittance due in 3 days', person: 'Payroll Department', time: 'Action required', type: 'warning' },
              { action: 'Work permit expiring for 2 staff', person: 'Immigration Compliance', time: 'Urgent renewal', type: 'negative' },
              { action: 'KRA PIN verification pending', person: '5 new employees', time: 'Blocking onboarding', type: 'negative' },
              { action: 'P9 forms generated successfully', person: 'Annual Tax Returns', time: 'Completed', type: 'success' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'success' ? 'bg-green-500' : 
                  activity.type === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-gray-900 text-sm font-medium">{activity.action}</p>
                  <p className="text-gray-600 text-xs">{activity.person} • <span className={`font-medium ${
                    activity.type === 'success' ? 'text-green-600' : 
                    activity.type === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`}>{activity.time}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategic Initiatives</h3>
          <div className="space-y-3">
            {[
              { event: 'Annual performance reviews', date: 'March 2025', time: '247 employees', status: 'planned' },
              { event: 'NHIF rate adjustment', date: 'Jan 2025', time: 'System update needed', status: 'at-risk' },
              { event: 'Staff medical checkups', date: 'Q2 2025', time: 'Occupational health', status: 'on-track' },
              { event: 'Pension scheme enrollment', date: 'Feb 2025', time: '23 new joiners', status: 'on-track' }
            ].map((event, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200 hover:bg-white transition-all duration-200">
                <div>
                  <p className="text-gray-900 text-sm font-medium">{event.event}</p>
                  <p className="text-gray-600 text-xs">{event.date} • {event.time}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  event.status === 'on-track' ? 'bg-green-100 text-green-800' :
                  event.status === 'at-risk' ? 'bg-yellow-100 text-yellow-800' :
                  event.status === 'delayed' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {event.status.replace('-', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}