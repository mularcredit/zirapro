import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  Plus, 
  Edit, 
  Trash2, 
  Filter, 
  X, 
  Check,
  User,
  ChevronDown,
  ChevronUp,
  Mail,
  Download,
  FileText,
  CheckCircle,
  XCircle,
  Clock as PendingIcon,
  Sun,
  Heart,
  Baby,
  Activity,
  Zap,
  Gift
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Types
type LeaveType = {
  id: string;
  name: string;
  description: string;
  is_deductible: boolean;
  is_continuous: boolean;
  max_days?: number;
  icon: string;
};

type Holiday = {
  id: string;
  name: string;
  date: string;
  recurring: boolean;
};

type LeaveApplication = {
  id: string;
  employee_id: string;
  employee_name: string;
  leave_type_id: string;
  leave_type_name: string;
  start_date: string;
  end_date: string;
  is_half_day: boolean;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  applied_at: string;
  approved_by?: string;
  approved_at?: string;
};

type EmployeeLeaveBalance = {
  employee_id: string;
  employee_name: string;
  leave_type_id: string;
  leave_type_name: string;
  accrued_days: number;
  used_days: number;
  remaining_days: number;
  last_accrual_date: string;
};

type Employee = {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  hire_date: string;
};

// Default leave types (Kenyan standard)
const DEFAULT_LEAVE_TYPES: LeaveType[] = [
  { id: 'annual', name: 'Annual Leave', description: 'Paid time off work', is_deductible: true, is_continuous: true, max_days: 24, icon: 'Sun' },
  { id: 'compassionate', name: 'Compassionate Leave', description: 'Time off due to family bereavement', is_deductible: false, is_continuous: true, max_days: 7, icon: 'Heart' },
  { id: 'maternity', name: 'Maternity Leave', description: 'Time off for new mothers', is_deductible: false, is_continuous: true, max_days: 90, icon: 'Baby' },
  { id: 'paternity', name: 'Paternity Leave', description: 'Time off for new fathers', is_deductible: false, is_continuous: true, max_days: 14, icon: 'Baby' },
  { id: 'sick', name: 'Sick Leave', description: 'Time off due to illness', is_deductible: true, is_continuous: true, max_days: 14, icon: 'Activity' },
  { id: 'overtime', name: 'Overtime Compensation', description: 'Leave awarded for overtime work', is_deductible: false, is_continuous: false, icon: 'Zap' },
  { id: 'other', name: 'Other Leave', description: 'Other types of leave', is_deductible: true, is_continuous: true, icon: 'Gift' },
];

// Sample holidays (Kenyan public holidays)
const SAMPLE_HOLIDAYS: Holiday[] = [
  { id: '1', name: 'New Year', date: '2023-01-01', recurring: true },
  { id: '2', name: 'Good Friday', date: '2023-04-07', recurring: true },
  { id: '3', name: 'Easter Monday', date: '2023-04-10', recurring: true },
  { id: '4', name: 'Labour Day', date: '2023-05-01', recurring: true },
  { id: '5', name: 'Madaraka Day', date: '2023-06-01', recurring: true },
  { id: '6', name: 'Huduma Day', date: '2023-10-10', recurring: true },
  { id: '7', name: 'Mashujaa Day', date: '2023-10-20', recurring: true },
  { id: '8', name: 'Jamhuri Day', date: '2023-12-12', recurring: true },
  { id: '9', name: 'Christmas Day', date: '2023-12-25', recurring: true },
  { id: '10', name: 'Boxing Day', date: '2023-12-26', recurring: true },
];

// Helper functions
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'Sun': return Sun;
    case 'Heart': return Heart;
    case 'Baby': return Baby;
    case 'Activity': return Activity;
    case 'Zap': return Zap;
    case 'Gift': return Gift;
    default: return FileText;
  }
};

const calculateWorkingDays = (startDate: string, endDate: string, holidays: Holiday[]) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let count = 0;
  
  // Adjust for half day if start and end are the same
  if (start.toDateString() === end.toDateString()) {
    return 0.5;
  }
  
  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not weekend
      const isHoliday = holidays.some(h => {
        const holidayDate = new Date(h.date);
        return holidayDate.getDate() === current.getDate() &&
               holidayDate.getMonth() === current.getMonth() &&
               holidayDate.getFullYear() === current.getFullYear();
      });
      if (!isHoliday) {
        count++;
      }
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
};

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const statusClasses = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
  };

  const statusIcons = {
    'pending': PendingIcon,
    'approved': CheckCircle,
    'rejected': XCircle,
  };

  const Icon = statusIcons[status as keyof typeof statusIcons];

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${statusClasses[status as keyof typeof statusClasses]}`}>
      <Icon className="w-3 h-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Leave Type Icon Component
const LeaveTypeIcon = ({ type }: { type: LeaveType }) => {
  const Icon = getIconComponent(type.icon);
  return (
    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
      <Icon className="w-5 h-5" />
    </div>
  );
};

// Leave Management Dashboard
export default function LeaveManagementSystem() {
  // State
  const [activeTab, setActiveTab] = useState('applications');
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>(DEFAULT_LEAVE_TYPES);
  const [holidays, setHolidays] = useState<Holiday[]>(SAMPLE_HOLIDAYS);
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<EmployeeLeaveBalance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [showLeaveTypeForm, setShowLeaveTypeForm] = useState(false);
  const [showHolidayForm, setShowHolidayForm] = useState(false);
  const [showLeaveApplicationForm, setShowLeaveApplicationForm] = useState(false);
  const [showAccrualSettings, setShowAccrualSettings] = useState(false);
  
  // Form data
  const [newLeaveType, setNewLeaveType] = useState<Omit<LeaveType, 'id'>>({ 
    name: '', 
    description: '', 
    is_deductible: true, 
    is_continuous: true,
    icon: 'Sun'
  });
  const [newHoliday, setNewHoliday] = useState<Omit<Holiday, 'id'>>({ 
    name: '', 
    date: new Date().toISOString().split('T')[0], 
    recurring: true 
  });
  const [newLeaveApplication, setNewLeaveApplication] = useState<Omit<LeaveApplication, 'id' | 'employee_name' | 'leave_type_name' | 'status' | 'applied_at' | 'approved_by' | 'approved_at'>>({ 
    employee_id: '',
    leave_type_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    is_half_day: false,
    reason: ''
  });
  const [accrualSettings, setAccrualSettings] = useState({
    accrualInterval: 'monthly', // 'monthly' or 'quarterly'
    accrualAmount: 2, // 2 days per interval
    nextAccrualDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().split('T')[0]
  });

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real app, you would fetch these from your Supabase tables
        // For this example, we're using the default/sample data
        setLeaveTypes(DEFAULT_LEAVE_TYPES);
        setHolidays(SAMPLE_HOLIDAYS);
        
        // Sample employee data
        const sampleEmployees: Employee[] = [
          { id: '1', name: 'Peter Owino', email: 'john@mularcredit.com', department: 'Finance', position: 'Accountant', hire_date: '2020-01-15' },
          { id: '2', name: 'Benard Kiplagat', email: 'jane@mularcredit.com', department: 'HR', position: 'HR Manager', hire_date: '2019-05-10' },
          { id: '3', name: 'Enock Omweri', email: 'robert@mularcredit.com', department: 'IT', position: 'Developer', hire_date: '2021-03-22' },
          { id: '4', name: 'Faith Mikaya', email: 'mary@mularcredit.com', department: 'Operations', position: 'Operations Manager', hire_date: '2018-11-05' },
        ];
        setEmployees(sampleEmployees);
        
        // Sample leave applications
        const sampleApplications: LeaveApplication[] = [
          { 
            id: '1', 
            employee_id: '1', 
            employee_name: 'John Doe', 
            leave_type_id: 'annual', 
            leave_type_name: 'Annual Leave', 
            start_date: '2023-06-01', 
            end_date: '2023-06-03', 
            is_half_day: false, 
            status: 'approved', 
            reason: 'Family vacation', 
            applied_at: '2023-05-20T10:00:00', 
            approved_by: 'Jane Smith', 
            approved_at: '2023-05-21T14:30:00' 
          },
          { 
            id: '2', 
            employee_id: '2', 
            employee_name: 'Jane Smith', 
            leave_type_id: 'sick', 
            leave_type_name: 'Sick Leave', 
            start_date: '2023-06-10', 
            end_date: '2023-06-10', 
            is_half_day: true, 
            status: 'approved', 
            reason: 'Doctor appointment', 
            applied_at: '2023-06-09T08:15:00', 
            approved_by: 'Mary Williams', 
            approved_at: '2023-06-09T10:45:00' 
          },
          { 
            id: '3', 
            employee_id: '3', 
            employee_name: 'Robert Johnson', 
            leave_type_id: 'annual', 
            leave_type_name: 'Annual Leave', 
            start_date: '2023-07-15', 
            end_date: '2023-07-20', 
            is_half_day: false, 
            status: 'pending', 
            reason: 'Travel', 
            applied_at: '2023-06-25T16:20:00' 
          },
        ];
        setLeaveApplications(sampleApplications);
        
        // Sample leave balances
        const sampleBalances: EmployeeLeaveBalance[] = [
          { 
            employee_id: '1', 
            employee_name: 'Samwel Righa', 
            leave_type_id: 'annual', 
            leave_type_name: 'Annual Leave', 
            accrued_days: 12, 
            used_days: 3, 
            remaining_days: 9, 
            last_accrual_date: '2023-05-31' 
          },
          { 
            employee_id: '2', 
            employee_name: 'Benard Kipngetich', 
            leave_type_id: 'annual', 
            leave_type_name: 'Annual Leave', 
            accrued_days: 24, 
            used_days: 5, 
            remaining_days: 19, 
            last_accrual_date: '2023-05-31' 
          },
          { 
            employee_id: '3', 
            employee_name: 'Marion Jeptoo', 
            leave_type_id: 'annual', 
            leave_type_name: 'Annual Leave', 
            accrued_days: 8, 
            used_days: 0, 
            remaining_days: 8, 
            last_accrual_date: '2023-05-31' 
          },
          { 
            employee_id: '4', 
            employee_name: 'Faith Mikaya', 
            leave_type_id: 'annual', 
            leave_type_name: 'Annual Leave', 
            accrued_days: 24, 
            used_days: 10, 
            remaining_days: 14, 
            last_accrual_date: '2023-05-31' 
          },
        ];
        setLeaveBalances(sampleBalances);
        
      } catch (err) {
        setError('Failed to fetch data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Form handlers
  const handleAddLeaveType = () => {
    const newType: LeaveType = {
      ...newLeaveType,
      id: `custom-${Date.now()}`,
    };
    setLeaveTypes([...leaveTypes, newType]);
    setShowLeaveTypeForm(false);
    setNewLeaveType({ name: '', description: '', is_deductible: true, is_continuous: true, icon: 'Sun' });
  };

  const handleAddHoliday = () => {
    const newHolidayWithId: Holiday = {
      ...newHoliday,
      id: `holiday-${Date.now()}`,
    };
    setHolidays([...holidays, newHolidayWithId]);
    setShowHolidayForm(false);
    setNewHoliday({ name: '', date: new Date().toISOString().split('T')[0], recurring: true });
  };

  const handleApplyLeave = () => {
    const leaveType = leaveTypes.find(lt => lt.id === newLeaveApplication.leave_type_id);
    const employee = employees.find(e => e.id === newLeaveApplication.employee_id);
    
    if (!leaveType || !employee) return;
    
    const newApplication: LeaveApplication = {
      id: `app-${Date.now()}`,
      employee_id: newLeaveApplication.employee_id,
      employee_name: employee.name,
      leave_type_id: newLeaveApplication.leave_type_id,
      leave_type_name: leaveType.name,
      start_date: newLeaveApplication.start_date,
      end_date: newLeaveApplication.end_date,
      is_half_day: newLeaveApplication.is_half_day,
      status: 'pending',
      reason: newLeaveApplication.reason,
      applied_at: new Date().toISOString(),
    };
    
    setLeaveApplications([...leaveApplications, newApplication]);
    setShowLeaveApplicationForm(false);
    setNewLeaveApplication({ 
      employee_id: '',
      leave_type_id: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      is_half_day: false,
      reason: '' 
    });
    
    // In a real app, you would send an email notification here
    console.log(`Leave application submitted. Notification email would be sent to approvers.`);
  };

  const handleApproveLeave = (applicationId: string) => {
    setLeaveApplications(leaveApplications.map(app => {
      if (app.id === applicationId) {
        return {
          ...app,
          status: 'approved',
          approved_by: 'Admin User', // In real app, this would be the logged in user
          approved_at: new Date().toISOString()
        };
      }
      return app;
    }));
    
    // Deduct leave days if applicable
    const application = leaveApplications.find(app => app.id === applicationId);
    if (application) {
      const leaveType = leaveTypes.find(lt => lt.id === application.leave_type_id);
      if (leaveType?.is_deductible) {
        const daysTaken = calculateWorkingDays(application.start_date, application.end_date, holidays);
        
        setLeaveBalances(leaveBalances.map(balance => {
          if (balance.employee_id === application.employee_id && balance.leave_type_id === application.leave_type_id) {
            return {
              ...balance,
              used_days: balance.used_days + daysTaken,
              remaining_days: balance.remaining_days - daysTaken
            };
          }
          return balance;
        }));
      }
    }
    
    // In a real app, you would send an email notification here
    console.log(`Leave application approved. Notification email would be sent to employee.`);
  };

  const handleRejectLeave = (applicationId: string) => {
    setLeaveApplications(leaveApplications.map(app => {
      if (app.id === applicationId) {
        return {
          ...app,
          status: 'rejected',
          approved_by: 'Admin User', // In real app, this would be the logged in user
          approved_at: new Date().toISOString()
        };
      }
      return app;
    }));
    
    // In a real app, you would send an email notification here
    console.log(`Leave application rejected. Notification email would be sent to employee.`);
  };

  const handleRunAccrual = () => {
    // In a real app, this would run on a schedule (e.g., monthly)
    // For this example, we'll manually trigger it
    
    const newBalances = leaveBalances.map(balance => {
      // Only accrue for deductible leave types (like Annual Leave)
      const leaveType = leaveTypes.find(lt => lt.id === balance.leave_type_id);
      if (leaveType?.is_deductible) {
        return {
          ...balance,
          accrued_days: balance.accrued_days + accrualSettings.accrualAmount,
          remaining_days: balance.remaining_days + accrualSettings.accrualAmount,
          last_accrual_date: new Date().toISOString().split('T')[0]
        };
      }
      return balance;
    });
    
    setLeaveBalances(newBalances);
    setShowAccrualSettings(false);
    
    // In a real app, you would update the next accrual date based on the interval
    console.log(`Leave days accrued. Next accrual would be on ${accrualSettings.nextAccrualDate}`);
  };

  // Calculate leave statistics for dashboard
  const pendingApplications = leaveApplications.filter(app => app.status === 'pending').length;
  const approvedApplications = leaveApplications.filter(app => app.status === 'approved').length;
  const totalLeaveDaysUsed = leaveBalances.reduce((sum, balance) => sum + balance.used_days, 0);
  const totalLeaveDaysRemaining = leaveBalances.reduce((sum, balance) => sum + balance.remaining_days, 0);

  return (
    <div className="p-4 space-y-6 bg-gray-50 min-h-screen max-w-screen-2xl mx-auto">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Leave Management System</h1>
            <p className="text-gray-600 text-sm">Manage employee leave applications, balances, and settings</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button
              onClick={() => setShowLeaveApplicationForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Apply for Leave
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Pending Applications</p>
            <p className="text-gray-900 text-xl font-bold">{pendingApplications}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Approved Applications</p>
            <p className="text-gray-900 text-xl font-bold">{approvedApplications}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Leave Days Used</p>
            <p className="text-gray-900 text-xl font-bold">{totalLeaveDaysUsed}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <User className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Leave Days Remaining</p>
            <p className="text-gray-900 text-xl font-bold">{totalLeaveDaysRemaining}</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('applications')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'applications' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Leave Applications
            </button>
            <button
              onClick={() => setActiveTab('balances')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'balances' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Leave Balances
            </button>
            <button
              onClick={() => setActiveTab('types')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'types' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Leave Types
            </button>
            <button
              onClick={() => setActiveTab('holidays')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'holidays' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Holidays
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'settings' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Settings
            </button>
          </nav>
        </div>
      </div>

      {/* Content based on selected tab */}
      {activeTab === 'applications' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Leave Applications</h2>
                <p className="text-gray-600 text-sm">{leaveApplications.length} applications found</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium border border-gray-300">
                  <Filter className="w-3 h-3" />
                  Filter
                </button>
                <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium border border-gray-300">
                  <Download className="w-3 h-3" />
                  Export
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Employee</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Leave Type</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Dates</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Days</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Reason</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Applied On</th>
                  <th className="text-center py-3 px-4 text-gray-700 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaveApplications.map((application) => {
                  const days = calculateWorkingDays(application.start_date, application.end_date, holidays);
                  return (
                    <tr key={application.id} className="border-b border-gray-300 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <p className="text-gray-900 font-semibold">{application.employee_name}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-700">{application.leave_type_name}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-700">
                          {formatDate(application.start_date)}
                          {application.end_date !== application.start_date && ` - ${formatDate(application.end_date)}`}
                          {application.is_half_day && ' (Half day)'}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-700">{days}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-700 line-clamp-1">{application.reason}</p>
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={application.status} />
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-700">{formatDate(application.applied_at)}</p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-center gap-1">
                          {application.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleApproveLeave(application.id)}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs"
                              >
                                <CheckCircle className="w-3 h-3" />
                                Approve
                              </button>
                              <button 
                                onClick={() => handleRejectLeave(application.id)}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs"
                              >
                                <XCircle className="w-3 h-3" />
                                Reject
                              </button>
                            </>
                          )}
                          {application.status !== 'pending' && (
                            <button className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs">
                              <Mail className="w-3 h-3" />
                              Notify
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'balances' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Employee Leave Balances</h2>
                <p className="text-gray-600 text-sm">{leaveBalances.length} records found</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium border border-gray-300">
                  <Filter className="w-3 h-3" />
                  Filter
                </button>
                <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium border border-gray-300">
                  <Download className="w-3 h-3" />
                  Export
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Employee</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Leave Type</th>
                  <th className="text-right py-3 px-4 text-gray-700 font-semibold">Accrued Days</th>
                  <th className="text-right py-3 px-4 text-gray-700 font-semibold">Used Days</th>
                  <th className="text-right py-3 px-4 text-gray-700 font-semibold">Remaining Days</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Last Accrual</th>
                  <th className="text-center py-3 px-4 text-gray-700 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaveBalances.map((balance) => (
                  <tr key={`${balance.employee_id}-${balance.leave_type_id}`} className="border-b border-gray-300 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <p className="text-gray-900 font-semibold">{balance.employee_name}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-700">{balance.leave_type_name}</p>
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-gray-900">
                      {balance.accrued_days}
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-gray-900">
                      {balance.used_days}
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-green-600">
                      {balance.remaining_days}
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-700">{formatDate(balance.last_accrual_date)}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center gap-1">
                        <button className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs">
                          <Edit className="w-3 h-3" />
                          Adjust
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'types' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Leave Types</h2>
                <p className="text-gray-600 text-sm">{leaveTypes.length} types configured</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setShowLeaveTypeForm(true)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium"
                >
                  <Plus className="w-3 h-3" />
                  Add Leave Type
                </button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 md:p-6">
            {leaveTypes.map((type) => (
              <div key={type.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <LeaveTypeIcon type={type} />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{type.name}</h3>
                    <p className="text-gray-600 text-sm">{type.description}</p>
                  </div>
                </div>
                
                <div className="space-y-2 mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Deductible:</span>
                    <span className="font-medium">{type.is_deductible ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Continuous:</span>
                    <span className="font-medium">{type.is_continuous ? 'Yes' : 'No'}</span>
                  </div>
                  {type.max_days && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Max Days:</span>
                      <span className="font-medium">{type.max_days}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end gap-2">
                  <button className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs">
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                  <button className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs">
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'holidays' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Holidays</h2>
                <p className="text-gray-600 text-sm">{holidays.length} holidays configured</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setShowHolidayForm(true)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium"
                >
                  <Plus className="w-3 h-3" />
                  Add Holiday
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Holiday Name</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Recurring</th>
                  <th className="text-center py-3 px-4 text-gray-700 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map((holiday) => (
                  <tr key={holiday.id} className="border-b border-gray-300 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <p className="text-gray-900 font-semibold">{holiday.name}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-700">{formatDate(holiday.date)}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-700">{holiday.recurring ? 'Yes' : 'No'}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center gap-2">
                        <button className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs">
                          <Edit className="w-3 h-3" />
                          Edit
                        </button>
                        <button className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs">
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Leave Management Settings</h2>
          
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-900">Leave Accrual Settings</h3>
                <button 
                  onClick={() => setShowAccrualSettings(!showAccrualSettings)}
                  className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  {showAccrualSettings ? (
                    <>
                      <span>Hide</span>
                      <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Show</span>
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
              
              {showAccrualSettings && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Accrual Interval</label>
                      <select
                        value={accrualSettings.accrualInterval}
                        onChange={(e) => setAccrualSettings({...accrualSettings, accrualInterval: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-100 focus:border-green-500"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Days per Interval</label>
                      <input
                        type="number"
                        value={accrualSettings.accrualAmount}
                        onChange={(e) => setAccrualSettings({...accrualSettings, accrualAmount: Number(e.target.value)})}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-100 focus:border-green-500"
                        min="0"
                        step="0.5"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Next Accrual Date</label>
                      <input
                        type="date"
                        value={accrualSettings.nextAccrualDate}
                        onChange={(e) => setAccrualSettings({...accrualSettings, nextAccrualDate: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-100 focus:border-green-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={handleRunAccrual}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
                    >
                      Run Accrual Now
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-4">Leave Reports</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button className="inline-flex items-center justify-between gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200">
                  <span>Leave Utilization Report</span>
                  <Download className="w-4 h-4" />
                </button>
                <button className="inline-flex items-center justify-between gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200">
                  <span>Leave Balance Report</span>
                  <Download className="w-4 h-4" />
                </button>
                <button className="inline-flex items-center justify-between gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200">
                  <span>Leave History Report</span>
                  <Download className="w-4 h-4" />
                </button>
                <button className="inline-flex items-center justify-between gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200">
                  <span>Leave Forecast Report</span>
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showLeaveTypeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Leave Type</h3>
              <button 
                onClick={() => setShowLeaveTypeForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type Name</label>
                <input 
                  type="text" 
                  value={newLeaveType.name}
                  onChange={(e) => setNewLeaveType({...newLeaveType, name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-100 focus:border-green-500"
                  placeholder="e.g. Annual Leave"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  value={newLeaveType.description}
                  onChange={(e) => setNewLeaveType({...newLeaveType, description: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-100 focus:border-green-500"
                  rows={3}
                  placeholder="Describe this leave type..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <select
                    value={newLeaveType.icon}
                    onChange={(e) => setNewLeaveType({...newLeaveType, icon: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-100 focus:border-green-500"
                  >
                    <option value="Sun">Sun (Annual)</option>
                    <option value="Heart">Heart (Compassionate)</option>
                    <option value="Baby">Baby (Maternity/Paternity)</option>
                    <option value="Activity">Activity (Sick)</option>
                    <option value="Zap">Zap (Overtime)</option>
                    <option value="Gift">Gift (Other)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Days (optional)</label>
                  <input 
                    type="number" 
                    value={newLeaveType.max_days || ''}
                    onChange={(e) => setNewLeaveType({...newLeaveType, max_days: e.target.value ? Number(e.target.value) : undefined})}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-100 focus:border-green-500"
                    placeholder="Leave blank for no limit"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="is_deductible"
                    checked={newLeaveType.is_deductible}
                    onChange={(e) => setNewLeaveType({...newLeaveType, is_deductible: e.target.checked})}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_deductible" className="ml-2 block text-sm text-gray-700">
                    Deduct from balance
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="is_continuous"
                    checked={newLeaveType.is_continuous}
                    onChange={(e) => setNewLeaveType({...newLeaveType, is_continuous: e.target.checked})}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_continuous" className="ml-2 block text-sm text-gray-700">
                    Continuous leave
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowLeaveTypeForm(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleAddLeaveType}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                >
                  Add Leave Type
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showHolidayForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Holiday</h3>
              <button 
                onClick={() => setShowHolidayForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Holiday Name</label>
                <input 
                  type="text" 
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday({...newHoliday, name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-100 focus:border-green-500"
                  placeholder="e.g. New Year"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={newHoliday.date}
                    onChange={(e) => setNewHoliday({...newHoliday, date: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-100 focus:border-green-500"
                  />
                </div>
                
                <div className="flex items-center justify-end">
                  <div className="flex items-center h-full">
                    <input 
                      type="checkbox" 
                      id="recurring"
                      checked={newHoliday.recurring}
                      onChange={(e) => setNewHoliday({...newHoliday, recurring: e.target.checked})}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="recurring" className="ml-2 block text-sm text-gray-700">
                      Recurring annually
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowHolidayForm(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleAddHoliday}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                >
                  Add Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showLeaveApplicationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Apply for Leave</h3>
              <button 
                onClick={() => setShowLeaveApplicationForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select
                  value={newLeaveApplication.employee_id}
                  onChange={(e) => setNewLeaveApplication({...newLeaveApplication, employee_id: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-100 focus:border-green-500"
                >
                  <option value="">Select Employee</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>{employee.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                <select
                  value={newLeaveApplication.leave_type_id}
                  onChange={(e) => setNewLeaveApplication({...newLeaveApplication, leave_type_id: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-100 focus:border-green-500"
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    value={newLeaveApplication.start_date}
                    onChange={(e) => {
                      setNewLeaveApplication({
                        ...newLeaveApplication, 
                        start_date: e.target.value,
                        end_date: e.target.value < newLeaveApplication.end_date ? newLeaveApplication.end_date : e.target.value
                      });
                    }}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-100 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input 
                    type="date" 
                    value={newLeaveApplication.end_date}
                    min={newLeaveApplication.start_date}
                    onChange={(e) => setNewLeaveApplication({...newLeaveApplication, end_date: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-100 focus:border-green-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="is_half_day"
                  checked={newLeaveApplication.is_half_day}
                  onChange={(e) => setNewLeaveApplication({...newLeaveApplication, is_half_day: e.target.checked})}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="is_half_day" className="ml-2 block text-sm text-gray-700">
                  Half-day leave
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea 
                  value={newLeaveApplication.reason}
                  onChange={(e) => setNewLeaveApplication({...newLeaveApplication, reason: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-100 focus:border-green-500"
                  rows={3}
                  placeholder="Explain the reason for your leave..."
                />
              </div>
              
              <div className="pt-2">
                {newLeaveApplication.employee_id && newLeaveApplication.leave_type_id && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      {newLeaveApplication.is_half_day ? '0.5' : calculateWorkingDays(newLeaveApplication.start_date, newLeaveApplication.end_date, holidays)} 
                      {' '}days will be deducted from your leave balance.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowLeaveApplicationForm(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleApplyLeave}
                  disabled={!newLeaveApplication.employee_id || !newLeaveApplication.leave_type_id}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}