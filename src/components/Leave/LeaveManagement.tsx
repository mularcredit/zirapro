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
  Gift,
  Eye,
  Save
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { TownProps } from '../../types/supabase';

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
  "Employee Number": string;
  Name: string;
  "Leave Type": string;
  "Start Date": string;
  "End Date": string;
  Days: number;
  Type: string;
  "Application Type": string;
  "Office Branch": string;
  Reason: string;
  Status: 'pending' | 'approved' | 'rejected';
  time_added: string;
};

type EmployeeLeaveBalance = {
  employee_id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  office: string;
  leave_type_id: string;
  leave_type_name: string;
  accrued_days: number;
  used_days: number;
  remaining_days: number;
  last_accrual_date: string;
  monthly_accrual: number;
  quarterly_accrual: number;
  annual_accrual: number;
};

type Employee = {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  position: string;
  hire_date: string;
  office: string;
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

// Detailed View Component
const LeaveApplicationDetails = ({ application, onClose }: { application: LeaveApplication, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Leave Application Details</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Employee Name</p>
              <p className="font-medium">{application.Name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Employee Number</p>
              <p className="font-medium">{application["Employee Number"]}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Office Branch</p>
              <p className="font-medium">{application["Office Branch"] || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Leave Type</p>
              <p className="font-medium">{application["Leave Type"]}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Start Date</p>
              <p className="font-medium">{formatDate(application["Start Date"])}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">End Date</p>
              <p className="font-medium">{formatDate(application["End Date"])}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Days</p>
              <p className="font-medium">{application.Days}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-medium">{application.Type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <div className="font-medium">
                <StatusBadge status={application.Status} />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Applied On</p>
              <p className="font-medium">{formatDate(application.time_added)}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Reason</p>
            <p className="font-medium whitespace-pre-line">{application.Reason}</p>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-6">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Pagination Component
const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange
}: { 
  currentPage: number, 
  totalPages: number, 
  onPageChange: (page: number) => void,
  itemsPerPage: number,
  onItemsPerPageChange: (value: number) => void
}) => {
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-200">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Items per page:</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-1"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <div className="flex gap-1">
          {pageNumbers.slice(
            Math.max(0, currentPage - 3),
            Math.min(totalPages, currentPage + 2)
          ).map(number => (
            <button
              key={number}
              onClick={() => onPageChange(number)}
              className={`px-3 py-1 border rounded-md text-sm font-medium ${currentPage === number ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300'}`}
            >
              {number}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

// Leave Management Dashboard
export default function LeaveManagementSystem({ selectedTown }: TownProps) {
  // State
  const [activeTab, setActiveTab] = useState('applications');
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>(DEFAULT_LEAVE_TYPES);
  const [holidays, setHolidays] = useState<Holiday[]>(SAMPLE_HOLIDAYS);
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<EmployeeLeaveBalance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<LeaveApplication | null>(null);
  
  // Pagination states
  const [applicationsPage, setApplicationsPage] = useState(1);
  const [applicationsPerPage, setApplicationsPerPage] = useState(10);
  const [balancesPage, setBalancesPage] = useState(1);
  const [balancesPerPage, setBalancesPerPage] = useState(10);
  const [typesPage, setTypesPage] = useState(1);
  const [typesPerPage, setTypesPerPage] = useState(10);
  const [holidaysPage, setHolidaysPage] = useState(1);
  const [holidaysPerPage, setHolidaysPerPage] = useState(10);
  
  // Loading states for buttons
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [savingBalances, setSavingBalances] = useState(false);
  
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
  const [newLeaveApplication, setNewLeaveApplication] = useState<Omit<LeaveApplication, 'id' | 'time_added'>>({ 
    "Employee Number": '',
    "Name": '',
    "Leave Type": '',
    "Start Date": new Date().toISOString().split('T')[0],
    "End Date": new Date().toISOString().split('T')[0],
    "Days": 0,
    "Type": 'Full Day',
    "Application Type": 'Normal',
    "Office Branch": '',
    "Reason": '',
    "Status": 'pending'
  });
  const [accrualSettings, setAccrualSettings] = useState({
    accrualInterval: 'monthly', // 'monthly' or 'quarterly'
    accrualAmount: 2, // 2 days per interval
    nextAccrualDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().split('T')[0]
  });

  // Calculate paginated data
  const paginatedApplications = leaveApplications.slice(
    (applicationsPage - 1) * applicationsPerPage,
    applicationsPage * applicationsPerPage
  );
  const totalApplicationPages = Math.ceil(leaveApplications.length / applicationsPerPage);

  const paginatedBalances = leaveBalances.slice(
    (balancesPage - 1) * balancesPerPage,
    balancesPage * balancesPerPage
  );
  const totalBalancePages = Math.ceil(leaveBalances.length / balancesPerPage);

  const paginatedTypes = leaveTypes.slice(
    (typesPage - 1) * typesPerPage,
    typesPage * typesPerPage
  );
  const totalTypePages = Math.ceil(leaveTypes.length / typesPerPage);

  const paginatedHolidays = holidays.slice(
    (holidaysPage - 1) * holidaysPerPage,
    holidaysPage * holidaysPerPage
  );
  const totalHolidayPages = Math.ceil(holidays.length / holidaysPerPage);

  // Function to create leave balance records
  const createLeaveBalances = (employeesData: Employee[], applicationsData: LeaveApplication[]) => {
    const balances: EmployeeLeaveBalance[] = [];
    
    // Only create balances for deductible leave types
    const deductibleLeaveTypes = DEFAULT_LEAVE_TYPES.filter(type => type.is_deductible);
    
    employeesData.forEach(employee => {
      deductibleLeaveTypes.forEach(leaveType => {
        // Calculate used days for this employee and leave type
        const usedDays = applicationsData
          .filter(app => 
            app["Employee Number"] === employee.employee_number && 
            app["Leave Type"] === leaveType.name &&
            app.Status === 'approved'
          )
          .reduce((sum, app) => sum + (app.Days || 0), 0);
        
        // Set default accrual values based on leave type
        let monthlyAccrual = 0;
        let quarterlyAccrual = 0;
        let annualAccrual = 0;
        
        if (leaveType.name === 'Annual Leave') {
          monthlyAccrual = 2;
          quarterlyAccrual = 6;
          annualAccrual = 24;
        } else if (leaveType.name === 'Sick Leave') {
          monthlyAccrual = 1;
          quarterlyAccrual = 3;
          annualAccrual = 14;
        }
        
        const accruedDays = leaveType.max_days || annualAccrual;
        const remainingDays = accruedDays - usedDays;
        
        balances.push({
          employee_id: employee.id,
          employee_number: employee.employee_number,
          first_name: employee.first_name,
          last_name: employee.last_name,
          office: employee.office,
          leave_type_id: leaveType.id,
          leave_type_name: leaveType.name,
          accrued_days: accruedDays,
          used_days: usedDays,
          remaining_days: remainingDays,
          last_accrual_date: new Date().toISOString().split('T')[0],
          monthly_accrual: monthlyAccrual,
          quarterly_accrual: quarterlyAccrual,
          annual_accrual: annualAccrual
        });
      });
    });
    
    return balances;
  };

  // Function to update balance accruals
  const updateBalanceAccrual = (balanceIndex: number, field: 'monthly_accrual' | 'quarterly_accrual' | 'annual_accrual', value: number) => {
    setLeaveBalances(prev => {
      const updated = [...prev];
      updated[balanceIndex] = {
        ...updated[balanceIndex],
        [field]: value
      };
      return updated;
    });
  };

  // Function to save balance changes
  const saveBalanceChanges = async () => {
    setSavingBalances(true);
    try {
      // In a real app, you would save these to your database
      // For now, we'll just show a success message
      console.log('Saving balance changes:', leaveBalances);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Leave balance settings saved successfully!');
    } catch (err) {
      setError('Failed to save balance changes. Please try again.');
      console.error(err);
    } finally {
      setSavingBalances(false);
    }
  };

  // Fetch data from Supabase
// Fixed useEffect with debugging for 'Office Branch' column
useEffect(() => {
  const fetchLeaveApplications = async () => {
    setLoading(true);
    try {
      console.log('[DEBUG] Fetching applications for town:', selectedTown);
      
      // Build base query
      let query = supabase
        .from('leave_application')
        .select('*')
        .order('time_added', { ascending: false });

      // Apply Office Branch filter if selected
      if (selectedTown && selectedTown !== 'ADMIN_ALL') {
        console.log('[DEBUG] Applying filter for town:', selectedTown);
        query = query.eq('"Office Branch"', selectedTown.trim()); // Note the quotes
      }

      // Execute query
      const { data, error } = await query;
      
      console.log('[DEBUG] Query results:', data);
      
      if (error) {
        console.error('[DEBUG] Query error:', error);
        throw error;
      }

      // Type cast and transform the data
      const applications = (data as LeaveApplication[]).map(app => {
        console.log('[DEBUG] Processing application:', app.id, 'with branch:', app["Office Branch"]);
        return {
          id: app.id,
          "Employee Number": app["Employee Number"],
          "Name": app["Name"],
          "Leave Type": app["Leave Type"],
          "Start Date": app["Start Date"],
          "End Date": app["End Date"],
          "Days": app["Days"],
          "Type": app["Type"],
          "Application Type": app["Application Type"],
          "Office Branch": app["Office Branch"] || 'N/A',
          "Reason": app["Reason"],
          "Status": app["Status"].toLowerCase() as 'pending' | 'approved' | 'rejected',
          "time_added": app.time_added
        };
      });

      setLeaveApplications(applications);
      
    } catch (err) {
      console.error('[DEBUG] Fetch error:', err);
      setError('Failed to fetch leave applications');
    } finally {
      setLoading(false);
    }
  };

  fetchLeaveApplications();

  // Realtime subscription for leave applications
  const subscription = supabase
    .channel('leave_applications_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'leave_application',
        filter: selectedTown && selectedTown !== 'ADMIN_ALL' 
          ? `"Office Branch"=eq.${selectedTown.trim()}` // Quotes here too
          : undefined
      },
      (payload) => {
        console.log('[DEBUG] Realtime update:', payload);
        
        if (!payload.new) return;
        const application = payload.new as LeaveApplication;
        
        if (payload.eventType === 'INSERT') {
          setLeaveApplications(prev => [{
            id: application.id,
            "Employee Number": application["Employee Number"],
            "Name": application["Name"],
            "Leave Type": application["Leave Type"],
            "Start Date": application["Start Date"],
            "End Date": application["End Date"],
            "Days": application["Days"],
            "Type": application["Type"],
            "Application Type": application["Application Type"],
            "Office Branch": application["Office Branch"] || 'N/A',
            "Reason": application["Reason"],
            "Status": application["Status"].toLowerCase() as 'pending' | 'approved' | 'rejected',
            "time_added": application.time_added
          }, ...prev]);
        }
        else if (payload.eventType === 'UPDATE') {
          setLeaveApplications(prev => prev.map(app => 
            app.id === application.id ? {
              ...app,
              "Status": application["Status"].toLowerCase() as 'pending' | 'approved' | 'rejected',
              "Reason": application["Reason"],
              "Days": application["Days"]
            } : app
          ));
        }
        else if (payload.eventType === 'DELETE') {
          setLeaveApplications(prev => prev.filter(app => app.id !== application.id));
        }
      }
    )
    .subscribe();

  return () => {
    console.log('[DEBUG] Cleaning up subscription');
    supabase.removeChannel(subscription);
  };
}, [selectedTown]);// Only depends on selectedTown now// Re-run when selectedTown changes// Added employees to dependencies// Re-run when selectedTown changes

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

  const handleApplyLeave = async () => {
    const leaveType = leaveTypes.find(lt => lt.name === newLeaveApplication["Leave Type"]);
    const employee = employees.find(e => e.employee_number === newLeaveApplication["Employee Number"]);
    
    if (!leaveType || !employee) return;
    
    try {
      const days = calculateWorkingDays(
        newLeaveApplication["Start Date"], 
        newLeaveApplication["End Date"], 
        holidays
      );
      
      const { data, error } = await supabase
        .from('leave_application')
        .insert([{
          "Employee Number": newLeaveApplication["Employee Number"],
          "Name": `${employee.first_name} ${employee.last_name}`,
          "Leave Type": newLeaveApplication["Leave Type"],
          "Start Date": newLeaveApplication["Start Date"],
          "End Date": newLeaveApplication["End Date"],
          "Days": days,
          "Type": newLeaveApplication["Type"],
          "Application Type": newLeaveApplication["Application Type"],
          "Office Branch": employee.office,
          "Reason": newLeaveApplication["Reason"],
          "Status": newLeaveApplication["Status"],
          "time_added": new Date().toISOString()
        }])
        .select();
      
      if (error) throw error;
      
      setShowLeaveApplicationForm(false);
      setNewLeaveApplication({ 
        "Employee Number": '',
        "Name": '',
        "Leave Type": '',
        "Start Date": new Date().toISOString().split('T')[0],
        "End Date": new Date().toISOString().split('T')[0],
        "Days": 0,
        "Type": 'Full Day',
        "Application Type": 'Normal',
        "Office Branch": '',
        "Reason": '',
        "Status": 'pending'
      });
      
    } catch (err) {
      setError('Failed to submit leave application. Please try again.');
      console.error(err);
    }
  };

  const handleApproveLeave = async (applicationId: string) => {
    setApprovingId(applicationId);
    try {
      const { error } = await supabase
        .from('leave_application')
        .update({ "Status": 'approved' })
        .eq('id', applicationId);
      
      if (error) throw error;
      
      // Refresh the page to see updates
      window.location.reload();
    } catch (err) {
      setError('Failed to approve leave. Please try again.');
      console.error(err);
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectLeave = async (applicationId: string) => {
    setRejectingId(applicationId);
    try {
      const { error } = await supabase
        .from('leave_application')
        .update({ "Status": 'rejected' })
        .eq('id', applicationId);
      
      if (error) throw error;
      
      // Refresh the page to see updates
      window.location.reload();
    } catch (err) {
      setError('Failed to reject leave. Please try again.');
      console.error(err);
    } finally {
      setRejectingId(null);
    }
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
  const pendingApplications = leaveApplications.filter(app => app.Status === 'pending').length;
  const approvedApplications = leaveApplications.filter(app => app.Status === 'approved').length;
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
            {/* <button
              onClick={() => setShowLeaveApplicationForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Apply for Leave
            </button> */}
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
            {/* <p className="text-gray-900 text-xl font-bold">{totalLeaveDaysUsed}</p> */}
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
            {/* <p className="text-gray-900 text-xl font-bold">{totalLeaveDaysRemaining}</p> */}
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
            {/* <button
              onClick={() => setActiveTab('balances')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'balances' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Leave Balances
            </button> */}
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
                {/* <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium border border-gray-300">
                  <Filter className="w-3 h-3" />
                  Filter
                </button>
                <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium border border-gray-300">
                  <Download className="w-3 h-3" />
                  Export
                </button> */}
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
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Office Branch</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Applied On</th>
                  <th className="text-center py-3 px-4 text-gray-700 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedApplications.map((application) => (
                  <tr key={application.id} className="border-b border-gray-300 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <p className="text-gray-900 font-semibold">{application.Name}</p>
                        <p className="text-gray-500 text-xs">{application["Employee Number"]}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-700">{application["Leave Type"]}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-700">
                        {formatDate(application["Start Date"])}
                        {application["End Date"] !== application["Start Date"] && ` - ${formatDate(application["End Date"])}`}
                        {application["Type"] === 'Half Day' && ' (Half day)'}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-700">{application.Days}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-700">{application["Office Branch"]}</p>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={application.Status} />
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-700">{formatDate(application.time_added)}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center gap-1">
                        <button 
                          onClick={() => setSelectedApplication(application)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                        {application.Status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApproveLeave(application.id)}
                              disabled={approvingId === application.id}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs disabled:opacity-50"
                            >
                              {approvingId === application.id ? (
                                <span className="inline-block h-3 w-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></span>
                              ) : (
                                <CheckCircle className="w-3 h-3" />
                              )}
                              Approve
                            </button>
                            <button 
                              onClick={() => handleRejectLeave(application.id)}
                              disabled={rejectingId === application.id}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs disabled:opacity-50"
                            >
                              {rejectingId === application.id ? (
                                <span className="inline-block h-3 w-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={applicationsPage}
            totalPages={totalApplicationPages}
            onPageChange={setApplicationsPage}
            itemsPerPage={applicationsPerPage}
            onItemsPerPageChange={setApplicationsPerPage}
          />
        </div>
      )}

      {/* {activeTab === 'balances' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Employee Leave Balances</h2>
                <p className="text-gray-600 text-sm">{leaveBalances.length} balance records found</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={saveBalanceChanges}
                  disabled={savingBalances}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium disabled:opacity-50"
                >
                  {savingBalances ? (
                    <span className="inline-block h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <Save className="w-3 h-3" />
                  )}
                  Save Changes
                </button>
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
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Employee Number</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">First Name</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Last Name</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Office</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Leave Type</th>
                  <th className="text-center py-3 px-4 text-gray-700 font-semibold">Monthly</th>
                  <th className="text-center py-3 px-4 text-gray-700 font-semibold">Quarterly</th>
                  <th className="text-center py-3 px-4 text-gray-700 font-semibold">Annual</th>
                  <th className="text-right py-3 px-4 text-gray-700 font-semibold">Used Days</th>
                  <th className="text-right py-3 px-4 text-gray-700 font-semibold">Remaining Days</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBalances.length > 0 ? (
                  paginatedBalances.map((balance, index) => (
                    <tr key={`${balance.employee_id}-${balance.leave_type_id}`} className="border-b border-gray-300 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <p className="text-gray-900 font-medium">{balance.employee_number}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-900 font-medium">{balance.first_name}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-900 font-medium">{balance.last_name}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-700">{balance.office}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-700 font-medium">{balance.leave_type_name}</p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <input
                          type="number"
                          value={balance.monthly_accrual}
                          onChange={(e) => updateBalanceAccrual(
                            leaveBalances.indexOf(balance),
                            'monthly_accrual',
                            Number(e.target.value)
                          )}
                          className="w-16 text-center bg-gray-50 border border-gray-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-green-100 focus:border-green-500"
                          min="0"
                          step="0.5"
                        />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <input
                          type="number"
                          value={balance.quarterly_accrual}
                          onChange={(e) => updateBalanceAccrual(
                            leaveBalances.indexOf(balance),
                            'quarterly_accrual',
                            Number(e.target.value)
                          )}
                          className="w-16 text-center bg-gray-50 border border-gray-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-green-100 focus:border-green-500"
                          min="0"
                          step="0.5"
                        />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <input
                          type="number"
                          value={balance.annual_accrual}
                          onChange={(e) => updateBalanceAccrual(
                            leaveBalances.indexOf(balance),
                            'annual_accrual',
                            Number(e.target.value)
                          )}
                          className="w-16 text-center bg-gray-50 border border-gray-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-green-100 focus:border-green-500"
                          min="0"
                          step="0.5"
                        />
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-red-600">
                        {balance.used_days}
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-green-600">
                        {balance.annual_accrual - balance.used_days}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-gray-500">
                      No leave balance records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={balancesPage}
            totalPages={totalBalancePages}
            onPageChange={setBalancesPage}
            itemsPerPage={balancesPerPage}
            onItemsPerPageChange={setBalancesPerPage}
          />
        </div>
      )} */}
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
          
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Icon</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Description</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Deductible</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Continuous</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Max Days</th>
                  <th className="text-center py-3 px-4 text-gray-700 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTypes.map((type) => (
                  <tr key={type.id} className="border-b border-gray-300 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <LeaveTypeIcon type={type} />
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-900 font-semibold">{type.name}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-700">{type.description}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${type.is_deductible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {type.is_deductible ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {type.is_deductible ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${type.is_continuous ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {type.is_continuous ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {type.is_continuous ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-700">{type.max_days || 'N/A'}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center gap-1">
                        <button className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs">
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

          <Pagination
            currentPage={typesPage}
            totalPages={totalTypePages}
            onPageChange={setTypesPage}
            itemsPerPage={typesPerPage}
            onItemsPerPageChange={setTypesPerPage}
          />
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
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Recurring</th>
                  <th className="text-center py-3 px-4 text-gray-700 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedHolidays.map((holiday) => (
                  <tr key={holiday.id} className="border-b border-gray-300 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <p className="text-gray-900 font-semibold">{holiday.name}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-700">{formatDate(holiday.date)}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${holiday.recurring ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {holiday.recurring ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {holiday.recurring ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center gap-1">
                        <button className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs">
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

          <Pagination
            currentPage={holidaysPage}
            totalPages={totalHolidayPages}
            onPageChange={setHolidaysPage}
            itemsPerPage={holidaysPerPage}
            onItemsPerPageChange={setHolidaysPerPage}
          />
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Leave Settings</h2>
            <p className="text-gray-600 text-sm">Configure leave accrual and system settings</p>
          </div>
          
          <div className="p-4 md:p-6 space-y-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">Leave Accrual Settings</h3>
                <button 
                  onClick={() => setShowAccrualSettings(!showAccrualSettings)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {showAccrualSettings ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>
              
              {showAccrualSettings && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Accrual Interval</label>
                      <select
                        value={accrualSettings.accrualInterval}
                        onChange={(e) => setAccrualSettings({...accrualSettings, accrualInterval: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-100 focus:border-green-500"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Accrual Amount (days)</label>
                      <input
                        type="number"
                        value={accrualSettings.accrualAmount}
                        onChange={(e) => setAccrualSettings({...accrualSettings, accrualAmount: Number(e.target.value)})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-100 focus:border-green-500"
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
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-100 focus:border-green-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={handleRunAccrual}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
                    >
                      <Calendar className="w-4 h-4" />
                      Run Accrual Now
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-4">System Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email Notifications</p>
                    <p className="text-xs text-gray-500">Send email notifications for leave applications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Approval Workflow</p>
                    <p className="text-xs text-gray-500">Enable multi-level approval for leave applications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Allow Negative Balances</p>
                    <p className="text-xs text-gray-500">Allow employees to take leave with negative balances</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
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
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newLeaveType.name}
                  onChange={(e) => setNewLeaveType({...newLeaveType, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-100 focus:border-green-500"
                  placeholder="e.g. Annual Leave"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newLeaveType.description}
                  onChange={(e) => setNewLeaveType({...newLeaveType, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-100 focus:border-green-500"
                  rows={3}
                  placeholder="Describe this leave type"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <select
                    value={newLeaveType.icon}
                    onChange={(e) => setNewLeaveType({...newLeaveType, icon: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-100 focus:border-green-500"
                  >
                    <option value="Sun">Sun</option>
                    <option value="Heart">Heart</option>
                    <option value="Baby">Baby</option>
                    <option value="Activity">Activity</option>
                    <option value="Zap">Zap</option>
                    <option value="Gift">Gift</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Days (optional)</label>
                  <input
                    type="number"
                    value={newLeaveType.max_days || ''}
                    onChange={(e) => setNewLeaveType({...newLeaveType, max_days: e.target.value ? Number(e.target.value) : undefined})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-100 focus:border-green-500"
                    placeholder="Leave blank for unlimited"
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
                    Deductible from balance
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
            </div>
            
            <div className="flex justify-end gap-2 pt-6">
              <button 
                onClick={() => setShowLeaveTypeForm(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddLeaveType}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
              >
                Add Leave Type
              </button>
            </div>
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
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday({...newHoliday, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-100 focus:border-green-500"
                  placeholder="e.g. New Year"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={newHoliday.date}
                  onChange={(e) => setNewHoliday({...newHoliday, date: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-100 focus:border-green-500"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={newHoliday.recurring}
                  onChange={(e) => setNewHoliday({...newHoliday, recurring: e.target.checked})}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="recurring" className="ml-2 block text-sm text-gray-700">
                  Recurring holiday (every year)
                </label>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-6">
              <button 
                onClick={() => setShowHolidayForm(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddHoliday}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
              >
                Add Holiday
              </button>
            </div>
          </div>
        </div>
      )}

      {showLeaveApplicationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Apply for Leave</h3>
              <button 
                onClick={() => setShowLeaveApplicationForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee Number</label>
                  <select
                    value={newLeaveApplication["Employee Number"]}
                    onChange={(e) => {
                      const employee = employees.find(emp => emp.employee_number === e.target.value);
                      setNewLeaveApplication({
                        ...newLeaveApplication,
                        "Employee Number": e.target.value,
                        "Name": employee ? `${employee.first_name} ${employee.last_name}` : '',
                        "Office Branch": employee?.office || ''
                      });
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-100 focus:border-green-500"
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map(employee => (
                      <option key={employee.id} value={employee.employee_number}>
                        {employee.employee_number} - {employee.first_name} {employee.last_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                  <select
                    value={newLeaveApplication["Leave Type"]}
                    onChange={(e) => setNewLeaveApplication({...newLeaveApplication, "Leave Type": e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-100 focus:border-green-500"
                    required
                  >
                    <option value="">Select Leave Type</option>
                    {leaveTypes.map(type => (
                      <option key={type.id} value={type.name}>{type.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newLeaveApplication["Start Date"]}
                    onChange={(e) => {
                      const newStartDate = e.target.value;
                      // If end date is before new start date, update end date too
                      const newEndDate = newLeaveApplication["End Date"] < newStartDate 
                        ? newStartDate 
                        : newLeaveApplication["End Date"];
                      setNewLeaveApplication({
                        ...newLeaveApplication,
                        "Start Date": newStartDate,
                        "End Date": newEndDate
                      });
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-100 focus:border-green-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={newLeaveApplication["End Date"]}
                    min={newLeaveApplication["Start Date"]}
                    onChange={(e) => setNewLeaveApplication({...newLeaveApplication, "End Date": e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-100 focus:border-green-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                  <select
                    value={newLeaveApplication.Type}
                    onChange={(e) => setNewLeaveApplication({...newLeaveApplication, Type: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-100 focus:border-green-500"
                  >
                    <option value="Full Day">Full Day</option>
                    <option value="Half Day">Half Day</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Application Type</label>
                  <select
                    value={newLeaveApplication["Application Type"]}
                    onChange={(e) => setNewLeaveApplication({...newLeaveApplication, "Application Type": e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-100 focus:border-green-500"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea
                  value={newLeaveApplication.Reason}
                  onChange={(e) => setNewLeaveApplication({...newLeaveApplication, Reason: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-100 focus:border-green-500"
                  rows={3}
                  placeholder="Provide a reason for your leave application"
                  required
                />
              </div>
              
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <p className="text-xs text-gray-500">
                  Estimated working days: {calculateWorkingDays(
                    newLeaveApplication["Start Date"], 
                    newLeaveApplication["End Date"], 
                    holidays
                  )} (excluding weekends and holidays)
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-6">
              <button 
                onClick={() => setShowLeaveApplicationForm(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleApplyLeave}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
              <button 
                onClick={() => setError(null)}
                className="ml-4 text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Application Details Modal */}
      {selectedApplication && (
        <LeaveApplicationDetails 
          application={selectedApplication} 
          onClose={() => setSelectedApplication(null)} 
        />
      )}
    </div>
  );
}