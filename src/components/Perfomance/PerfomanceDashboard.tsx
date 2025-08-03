import React, { useState } from 'react';
import { 
  Users, Search, Briefcase, Building, Clock, AlertCircle, Plus, 
  Edit, Trash2, Filter, X, Check, BarChart2, Target, Calendar,
  CheckCircle, Clock as ClockIcon, Download, PieChart, UserCheck,
  UserX, ArrowUpRight, ArrowDownRight, Wallet, CreditCard, Coins
} from 'lucide-react';

// Employee Data
const employees = [
  { 
    id: '1', 
    name: 'John Kariuki', 
    role: 'Loan Officer', 
    branch: 'nairobi', 
    loansDisbursed: 45, 
    target: 50, 
    attendance: 95, 
    fieldVisits: 88, 
    par: 3.2, 
    collection: 98, 
    tat: 36,
    clients: [
      { id: 'c1', name: 'Samuel Njenga', status: 'active', loanAmount: 50000, lastPayment: '2023-05-15' },
      { id: 'c2', name: 'Grace Wambui', status: 'active', loanAmount: 30000, lastPayment: '2023-05-10' },
      { id: 'c3', name: 'Michael Ochieng', status: 'inactive', loanAmount: 75000, lastPayment: '2023-03-22' }
    ],
    disbursementTargets: {
      daily: 5,
      weekly: 25,
      monthly: 50,
      achieved: {
        today: 3,
        thisWeek: 18,
        thisMonth: 45
      }
    },
    collectionMetrics: {
      totalPortfolio: 1200000,
      collectedThisWeek: 285000,
      overdueAmount: 75000,
      collectionRate: 98
    }
  },
  { 
    id: '2', 
    name: 'Mary Wanjiku', 
    role: 'Loan Officer', 
    branch: 'kisumu', 
    loansDisbursed: 38, 
    target: 40, 
    attendance: 100, 
    fieldVisits: 92, 
    par: 1.8, 
    collection: 99, 
    tat: 28,
    clients: [
      { id: 'c4', name: 'James Mwangi', status: 'active', loanAmount: 45000, lastPayment: '2023-05-14' },
      { id: 'c5', name: 'Esther Auma', status: 'active', loanAmount: 60000, lastPayment: '2023-05-12' },
      { id: 'c6', name: 'Peter Kamau', status: 'active', loanAmount: 35000, lastPayment: '2023-05-09' }
    ],
    disbursementTargets: {
      daily: 4,
      weekly: 20,
      monthly: 40,
      achieved: {
        today: 4,
        thisWeek: 16,
        thisMonth: 38
      }
    },
    collectionMetrics: {
      totalPortfolio: 950000,
      collectedThisWeek: 235000,
      overdueAmount: 15000,
      collectionRate: 99
    }
  },
  { 
    id: '3', 
    name: 'David Kimani', 
    role: 'Branch Manager', 
    branch: 'eldoret', 
    loansDisbursed: 52, 
    target: 60, 
    attendance: 90, 
    fieldVisits: 85, 
    par: 4.5, 
    collection: 95, 
    tat: 42,
    clients: [
      { id: 'c7', name: 'Sarah Wangechi', status: 'active', loanAmount: 80000, lastPayment: '2023-05-13' },
      { id: 'c8', name: 'Brian Otieno', status: 'inactive', loanAmount: 65000, lastPayment: '2023-02-28' },
      { id: 'c9', name: 'Lucy Mumbi', status: 'active', loanAmount: 40000, lastPayment: '2023-05-11' }
    ],
    disbursementTargets: {
      daily: 6,
      weekly: 30,
      monthly: 60,
      achieved: {
        today: 5,
        thisWeek: 22,
        thisMonth: 52
      }
    },
    collectionMetrics: {
      totalPortfolio: 1500000,
      collectedThisWeek: 320000,
      overdueAmount: 120000,
      collectionRate: 95
    }
  },
  { 
    id: '4', 
    name: 'Grace Akinyi', 
    role: 'Loan Officer', 
    branch: 'mombasa', 
    loansDisbursed: 60, 
    target: 55, 
    attendance: 98, 
    fieldVisits: 95, 
    par: 2.1, 
    collection: 97, 
    tat: 31,
    clients: [
      { id: 'c10', name: 'Daniel Omollo', status: 'active', loanAmount: 55000, lastPayment: '2023-05-14' },
      { id: 'c11', name: 'Mercy Atieno', status: 'active', loanAmount: 70000, lastPayment: '2023-05-08' },
      { id: 'c12', name: 'Paul Onyango', status: 'inactive', loanAmount: 90000, lastPayment: '2023-04-05' }
    ],
    disbursementTargets: {
      daily: 5,
      weekly: 25,
      monthly: 55,
      achieved: {
        today: 6,
        thisWeek: 24,
        thisMonth: 60
      }
    },
    collectionMetrics: {
      totalPortfolio: 1800000,
      collectedThisWeek: 410000,
      overdueAmount: 85000,
      collectionRate: 97
    }
  },
  { 
    id: '5', 
    name: 'Samuel Kiptoo', 
    role: 'Loan Officer', 
    branch: 'nakuru', 
    loansDisbursed: 42, 
    target: 45, 
    attendance: 92, 
    fieldVisits: 80, 
    par: 5.3, 
    collection: 94, 
    tat: 48,
    clients: [
      { id: 'c13', name: 'Ruth Chebet', status: 'active', loanAmount: 48000, lastPayment: '2023-05-13' },
      { id: 'c14', name: 'Joseph Kiprop', status: 'inactive', loanAmount: 60000, lastPayment: '2023-03-15' },
      { id: 'c15', name: 'Agnes Njeri', status: 'active', loanAmount: 52000, lastPayment: '2023-05-10' }
    ],
    disbursementTargets: {
      daily: 4,
      weekly: 20,
      monthly: 45,
      achieved: {
        today: 3,
        thisWeek: 15,
        thisMonth: 42
      }
    },
    collectionMetrics: {
      totalPortfolio: 1100000,
      collectedThisWeek: 265000,
      overdueAmount: 95000,
      collectionRate: 94
    }
  }
];

const branches = [
  { id: 'nairobi', name: 'Nairobi', location: 'Nairobi CBD' },
  { id: 'kisumu', name: 'Kisumu', location: 'Kisumu Central' },
  { id: 'eldoret', name: 'Eldoret', location: 'Eldoret Town' },
  { id: 'mombasa', name: 'Mombasa', location: 'Mombasa Island' },
  { id: 'nakuru', name: 'Nakuru', location: 'Nakuru CBD' },
];

const roles = ['All Roles', 'Loan Officer', 'Branch Manager', 'Credit Analyst'];

interface GlowButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ComponentType<{ className?: string }>;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
}

const GlowButton: React.FC<GlowButtonProps> = ({ 
  children, 
  variant = 'primary', 
  icon: Icon, 
  size = 'md', 
  onClick, 
  disabled = false 
}) => {
  const baseClasses = "inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-300 border";
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  const variantClasses = {
    primary: "bg-green-50 border-green-500 text-green-600 hover:bg-green-100 hover:border-green-600 hover:text-green-700 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] focus:shadow-[0_0_25px_rgba(34,197,94,0.6)]",
    secondary: "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-300 hover:border-gray-400",
    danger: "bg-red-50 border-red-500 text-red-600 hover:bg-red-100 hover:border-red-600 hover:text-red-700 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]"
  };

  return (
    <button 
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

interface StatusBadgeProps {
  status: string;
  value?: number;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, value }) => {
  const statusClasses = {
    'Excellent': 'bg-green-100 text-green-800',
    'Good': 'bg-blue-100 text-blue-800',
    'Fair': 'bg-yellow-100 text-yellow-800',
    'Poor': 'bg-red-100 text-red-800',
  };

  let performanceStatus = 'Excellent';
  if (status === 'PAR') {
    performanceStatus = value! < 2 ? 'Excellent' : value! < 5 ? 'Good' : value! < 8 ? 'Fair' : 'Poor';
  } else if (status === 'Collection') {
    performanceStatus = value! > 97 ? 'Excellent' : value! > 95 ? 'Good' : value! > 90 ? 'Fair' : 'Poor';
  } else if (status === 'Attendance') {
    performanceStatus = value! > 95 ? 'Excellent' : value! > 90 ? 'Good' : value! > 85 ? 'Fair' : 'Poor';
  }

  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusClasses[performanceStatus as keyof typeof statusClasses]}`}>
      {value ? `${value}%` : performanceStatus}
    </span>
  );
};

interface SummaryCardProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  isPercentage?: boolean;
  unit?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  label,
  value,
  icon: Icon,
  color,
  isPercentage = false,
  unit = ''
}) => {
  const colorClasses = {
    red: 'bg-red-100 text-red-600',
    orange: 'bg-orange-100 text-orange-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">{label}</p>
        <p className="text-gray-900 text-xl font-bold">
          {Math.round(value)}{isPercentage ? '%' : ''}{unit ? ` ${unit}` : ''}
        </p>
      </div>
    </div>
  );
};

const PerformanceDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'individual' | 'branch'>('individual');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');

  const filteredEmployees = employees.filter(employee => {
    const matchesBranch = selectedBranch === 'all' || employee.branch === selectedBranch;
    const matchesRole = selectedRole === 'All Roles' || employee.role === selectedRole;
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesBranch && matchesRole && matchesSearch;
  });

  const branchAverages = branches.map(branch => {
    const branchEmployees = employees.filter(e => e.branch === branch.id);
    const count = branchEmployees.length;
    
    if (count === 0) return {
      branch: branch.id,
      loansDisbursed: 0,
      target: 0,
      attendance: 0,
      fieldVisits: 0,
      par: 0,
      collection: 0,
      tat: 0
    };

    return {
      branch: branch.id,
      loansDisbursed: branchEmployees.reduce((sum, e) => sum + e.loansDisbursed, 0) / count,
      target: branchEmployees.reduce((sum, e) => sum + e.target, 0) / count,
      attendance: branchEmployees.reduce((sum, e) => sum + e.attendance, 0) / count,
      fieldVisits: branchEmployees.reduce((sum, e) => sum + e.fieldVisits, 0) / count,
      par: branchEmployees.reduce((sum, e) => sum + e.par, 0) / count,
      collection: branchEmployees.reduce((sum, e) => sum + e.collection, 0) / count,
      tat: branchEmployees.reduce((sum, e) => sum + e.tat, 0) / count
    };
  });

  const toggleEmployeeExpand = (employeeId: string) => {
    setExpandedEmployee(expandedEmployee === employeeId ? null : employeeId);
  };

  return (
    <div className="p-4 space-y-6 bg-gray-50 min-h-screen max-w-screen-2xl mx-auto">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Microfinance Performance Dashboard</h1>
            <p className="text-gray-600 text-sm">Track loan disbursements, collections, and client relationships</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <GlowButton 
              variant="secondary"
              icon={Filter}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </GlowButton>
            <GlowButton 
              variant="secondary"
              icon={Download}
              size="sm"
            >
              Export Report
            </GlowButton>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Filters</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Branch Location</label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-green-100 focus:border-green-500"
              >
                <option value="all">All Branches</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Employee Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-green-100 focus:border-green-500"
              >
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-100 focus:border-green-500 text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setSelectedTab('individual')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${selectedTab === 'individual' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Individual Performance
            </button>
            <button
              onClick={() => setSelectedTab('branch')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${selectedTab === 'branch' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Branch Performance
            </button>
          </nav>
          {selectedTab === 'individual' && (
            <div className="flex px-6 pb-4 md:pb-0">
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  onClick={() => setViewMode('summary')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg ${viewMode === 'summary' ? 'bg-green-100 text-green-700' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  Summary View
                </button>
                <button
                  onClick={() => setViewMode('detailed')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg ${viewMode === 'detailed' ? 'bg-green-100 text-green-700' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  Detailed View
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          label="Average Loan Disbursement Rate" 
          value={Math.round(employees.reduce((sum, e) => sum + (e.loansDisbursed / e.target * 100), 0) / employees.length)} 
          icon={Target} 
          color="blue"
          isPercentage={true}
        />
        <SummaryCard 
          label="Daily Target Achievement" 
          value={Math.round(employees.reduce((sum, e) => sum + (e.disbursementTargets.achieved.today / e.disbursementTargets.daily * 100), 0) / employees.length)} 
          icon={Calendar} 
          color="purple"
          isPercentage={true}
        />
        <SummaryCard 
          label="Active Client Ratio" 
          value={Math.round(employees.reduce((sum, e) => {
            const activeClients = e.clients.filter(c => c.status === 'active').length;
            return sum + (activeClients / e.clients.length * 100);
          }, 0) / employees.length)} 
          icon={UserCheck} 
          color="green"
          isPercentage={true}
        />
        <SummaryCard 
          label="Portfolio at Risk (PAR)" 
          value={employees.reduce((sum, e) => sum + e.par, 0) / employees.length} 
          icon={AlertCircle} 
          color={employees.reduce((sum, e) => sum + e.par, 0) / employees.length < 5 ? 'green' : 'red'}
          isPercentage={true}
        />
      </div>

      {/* Enhanced Individual Performance View */}
      {selectedTab === 'individual' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Staff Performance Metrics</h2>
                <p className="text-gray-600 text-sm">{filteredEmployees.length} employees found</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">View:</span>
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value as 'summary' | 'detailed')}
                  className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-1 text-xs focus:ring-2 focus:ring-green-100 focus:border-green-500"
                >
                  <option value="summary">Summary</option>
                  <option value="detailed">Detailed</option>
                </select>
              </div>
            </div>
          </div>
          
          {viewMode === 'summary' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Employee</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Role</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Branch</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Disbursement Targets</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Clients</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Collection Metrics</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">PAR</th>
                    <th className="text-center py-3 px-4 text-gray-700 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => {
                    const branch = branches.find(b => b.id === employee.branch);
                    const activeClients = employee.clients.filter(c => c.status === 'active').length;
                    const clientRatio = Math.round((activeClients / employee.clients.length) * 100);
                    
                    return (
                      <React.Fragment key={employee.id}>
                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <p className="text-gray-900 font-semibold">{employee.name}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-gray-700">{employee.role}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-gray-700">{branch?.name}</p>
                          </td>
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Today:</span>
                                <span className={`text-xs ${employee.disbursementTargets.achieved.today >= employee.disbursementTargets.daily ? 'text-green-600' : 'text-red-600'}`}>
                                  {employee.disbursementTargets.achieved.today}/{employee.disbursementTargets.daily}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Week:</span>
                                <span className={`text-xs ${employee.disbursementTargets.achieved.thisWeek >= employee.disbursementTargets.weekly ? 'text-green-600' : 'text-red-600'}`}>
                                  {employee.disbursementTargets.achieved.thisWeek}/{employee.disbursementTargets.weekly}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-500" />
                                <span>{employee.clients.length} total</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <UserCheck className="w-4 h-4 text-green-500" />
                                <span>{activeClients} active</span>
                                <StatusBadge status="Attendance" value={clientRatio} />
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span>Rate:</span>
                                <StatusBadge status="Collection" value={employee.collectionMetrics.collectionRate} />
                              </div>
                              <div className="flex items-center gap-2">
                                <span>Overdue:</span>
                                <span className="text-xs font-medium text-red-600">
                                  KSh {employee.collectionMetrics.overdueAmount.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <StatusBadge status="PAR" value={employee.par} />
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex justify-center gap-1">
                              <GlowButton 
                                variant="secondary" 
                                size="sm"
                                onClick={() => toggleEmployeeExpand(employee.id)}
                              >
                                {expandedEmployee === employee.id ? 'Hide Details' : 'View Details'}
                              </GlowButton>
                            </div>
                          </td>
                        </tr>
                        
                        {expandedEmployee === employee.id && (
                          <tr className="bg-gray-50">
                            <td colSpan={8} className="px-4 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Disbursement Targets Card */}
                                <div className="border border-gray-200 rounded-lg p-4">
                                  <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                                    <Target className="w-4 h-4 text-blue-500" />
                                    Disbursement Targets
                                  </h3>
                                  <div className="space-y-3">
                                    <div>
                                      <div className="flex justify-between text-xs mb-1">
                                        <span>Daily Target</span>
                                        <span className="font-medium">
                                          {employee.disbursementTargets.achieved.today}/{employee.disbursementTargets.daily}
                                        </span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                          className="bg-blue-500 h-2 rounded-full" 
                                          style={{ width: `${Math.min(100, (employee.disbursementTargets.achieved.today / employee.disbursementTargets.daily) * 100)}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                    <div>
                                      <div className="flex justify-between text-xs mb-1">
                                        <span>Weekly Target</span>
                                        <span className="font-medium">
                                          {employee.disbursementTargets.achieved.thisWeek}/{employee.disbursementTargets.weekly}
                                        </span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                          className="bg-purple-500 h-2 rounded-full" 
                                          style={{ width: `${Math.min(100, (employee.disbursementTargets.achieved.thisWeek / employee.disbursementTargets.weekly) * 100)}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                    <div>
                                      <div className="flex justify-between text-xs mb-1">
                                        <span>Monthly Target</span>
                                        <span className="font-medium">
                                          {employee.loansDisbursed}/{employee.target}
                                        </span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                          className="bg-green-500 h-2 rounded-full" 
                                          style={{ width: `${Math.min(100, (employee.loansDisbursed / employee.target) * 100)}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Client Portfolio Card */}
                                <div className="border border-gray-200 rounded-lg p-4">
                                  <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                                    <Users className="w-4 h-4 text-green-500" />
                                    Client Portfolio
                                  </h3>
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs">Active:</span>
                                      <span className="font-medium text-green-600">{activeClients}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs">Inactive:</span>
                                      <span className="font-medium text-red-600">{employee.clients.length - activeClients}</span>
                                    </div>
                                  </div>
                                  <div className="h-32 flex items-center justify-center">
                                    <div className="relative w-24 h-24">
                                      <PieChart className="w-full h-full text-gray-200" />
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-xs font-semibold">{clientRatio}%</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Collection Metrics Card */}
                                <div className="border border-gray-200 rounded-lg p-4">
                                  <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                                    <Coins className="w-4 h-4 text-yellow-500" />
                                    Collection Metrics
                                  </h3>
                                  <div className="space-y-3">
                                    <div>
                                      <div className="flex justify-between text-xs mb-1">
                                        <span>Total Portfolio</span>
                                        <span className="font-medium">
                                          KSh {employee.collectionMetrics.totalPortfolio.toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                    <div>
                                      <div className="flex justify-between text-xs mb-1">
                                        <span>Collected This Week</span>
                                        <span className="font-medium text-green-600">
                                          KSh {employee.collectionMetrics.collectedThisWeek.toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                    <div>
                                      <div className="flex justify-between text-xs mb-1">
                                        <span>Overdue Amount</span>
                                        <span className="font-medium text-red-600">
                                          KSh {employee.collectionMetrics.overdueAmount.toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="pt-2 border-t border-gray-200">
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs">Collection Rate</span>
                                        <StatusBadge status="Collection" value={employee.collectionMetrics.collectionRate} />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEmployees.map(employee => {
                const branch = branches.find(b => b.id === employee.branch);
                const activeClients = employee.clients.filter(c => c.status === 'active').length;
                const clientRatio = Math.round((activeClients / employee.clients.length) * 100);
                
                return (
                  <div key={employee.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-5 bg-white">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                          <p className="text-xs text-gray-500">{employee.role} • {branch?.name}</p>
                        </div>
                        <StatusBadge status="PAR" value={employee.par} />
                      </div>
                      
                      <div className="space-y-4">
                        {/* Disbursement Targets */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                            <Target className="w-3 h-3" /> Disbursement Targets
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span>Today</span>
                              <span className={`font-medium ${employee.disbursementTargets.achieved.today >= employee.disbursementTargets.daily ? 'text-green-600' : 'text-red-600'}`}>
                                {employee.disbursementTargets.achieved.today}/{employee.disbursementTargets.daily}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span>This Week</span>
                              <span className={`font-medium ${employee.disbursementTargets.achieved.thisWeek >= employee.disbursementTargets.weekly ? 'text-green-600' : 'text-red-600'}`}>
                                {employee.disbursementTargets.achieved.thisWeek}/{employee.disbursementTargets.weekly}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span>This Month</span>
                              <span className={`font-medium ${employee.loansDisbursed >= employee.target ? 'text-green-600' : 'text-red-600'}`}>
                                {employee.loansDisbursed}/{employee.target}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Client Portfolio */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                            <Users className="w-3 h-3" /> Client Portfolio
                          </h4>
                          <div className="flex justify-between text-xs mb-2">
                            <span>Total Clients</span>
                            <span className="font-medium">{employee.clients.length}</span>
                          </div>
                          <div className="flex justify-between text-xs mb-2">
                            <span>Active Clients</span>
                            <span className="font-medium text-green-600">{activeClients}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Inactive Clients</span>
                            <span className="font-medium text-red-600">{employee.clients.length - activeClients}</span>
                          </div>
                        </div>
                        
                        {/* Collection Metrics */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                            <Coins className="w-3 h-3" /> Collection Metrics
                          </h4>
                          <div className="flex justify-between text-xs mb-2">
                            <span>Total Portfolio</span>
                            <span className="font-medium">KSh {employee.collectionMetrics.totalPortfolio.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs mb-2">
                            <span>Collected This Week</span>
                            <span className="font-medium text-green-600">KSh {employee.collectionMetrics.collectedThisWeek.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs mb-2">
                            <span>Overdue Amount</span>
                            <span className="font-medium text-red-600">KSh {employee.collectionMetrics.overdueAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs items-center">
                            <span>Collection Rate</span>
                            <StatusBadge status="Collection" value={employee.collectionMetrics.collectionRate} />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-between items-center">
                      <div className="text-xs text-gray-600">
                        Last updated: Today
                      </div>
                      <GlowButton variant="secondary" size="sm">View Details</GlowButton>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Branch Performance View */}
      {selectedTab === 'branch' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Branch Performance Comparison</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {branches.map(branch => {
                const branchData = branchAverages.find(b => b.branch === branch.id) || {
                  loansDisbursed: 0,
                  target: 0,
                  attendance: 0,
                  fieldVisits: 0,
                  par: 0,
                  collection: 0,
                  tat: 0
                };
                
                return (
                  <div key={branch.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{branch.name}</h3>
                      <p className="text-gray-600 text-sm">{branch.location}</p>
                    </div>
                    
                    <div className="space-y-3 mt-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Loan Disbursement Rate</p>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{Math.round(branchData.loansDisbursed)}/{Math.round(branchData.target)}</span>
                          <span className={`text-xs ${branchData.loansDisbursed >= branchData.target ? 'text-green-600' : 'text-red-600'}`}>
                            ({Math.round(branchData.loansDisbursed / branchData.target * 100)}%)
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Portfolio at Risk (PAR)</p>
                        <StatusBadge status="PAR" value={branchData.par} />
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Collection Efficiency</p>
                        <StatusBadge status="Collection" value={branchData.collection} />
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Average TAT</p>
                        <div className={`text-xs font-medium ${branchData.tat < 36 ? 'text-green-600' : branchData.tat < 48 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {Math.round(branchData.tat)} hours
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                      <GlowButton variant="secondary" size="sm">View Details</GlowButton>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Branch Performance Metrics</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Branch</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Loans Disbursed vs Target</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Avg Attendance</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Avg Field Visits</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Avg PAR</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Avg Collection</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Avg TAT</th>
                    <th className="text-center py-3 px-4 text-gray-700 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {branchAverages.map(branchData => {
                    const branch = branches.find(b => b.id === branchData.branch);
                    const disbursementRate = Math.round(branchData.loansDisbursed / branchData.target * 100);
                    
                    return (
                      <tr key={branchData.branch} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <p className="text-gray-900 font-semibold">{branch?.name}</p>
                          <p className="text-gray-600 text-xs">{branch?.location}</p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{Math.round(branchData.loansDisbursed)}/{Math.round(branchData.target)}</span>
                            <span className={`text-xs ${disbursementRate >= 100 ? 'text-green-600' : 'text-red-600'}`}>
                              ({disbursementRate}%)
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge status="Attendance" value={Math.round(branchData.attendance)} />
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge status="Attendance" value={Math.round(branchData.fieldVisits)} />
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge status="PAR" value={Math.round(branchData.par * 10) / 10} />
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge status="Collection" value={Math.round(branchData.collection)} />
                        </td>
                        <td className="py-4 px-4">
                          <div className={`text-xs font-medium ${branchData.tat < 36 ? 'text-green-600' : branchData.tat < 48 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {Math.round(branchData.tat)}h
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-center gap-1">
                            <GlowButton variant="secondary" icon={BarChart2} size="sm">Analytics</GlowButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceDashboard;