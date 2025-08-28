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
  Save,
  MessageSquare,
  ThumbsUp,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { TownProps } from '../../types/supabase';
import RoleButtonWrapper from '../ProtectedRoutes/RoleButton';

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
  recstatus: 'recommended' | 'not_recommended' | null;
  time_added: string;
  recommendation_notes?: string;
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

interface AreaTownMapping {
  [area: string]: string[];
}

interface BranchAreaMapping {
  [branch: string]: string;
}

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
  
  if (start.toDateString() === end.toDateString()) {
    return 0.5;
  }
  
  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
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
    'recommended': 'bg-blue-100 text-blue-800',
    'not_recommended': 'bg-orange-100 text-orange-800',
  };

  const statusIcons = {
    'pending': PendingIcon,
    'approved': CheckCircle,
    'rejected': XCircle,
    'recommended': ThumbsUp,
    'not_recommended': XCircle,
  };

  const Icon = statusIcons[status as keyof typeof statusIcons] || PendingIcon;

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${statusClasses[status as keyof typeof statusClasses] || statusClasses.pending}`}>
      <Icon className="w-3 h-3" />
      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
    </span>
  );
};

// Recommendation Status Badge Component
const RecStatusBadge = ({ recstatus }: { recstatus: string | null }) => {
  if (!recstatus) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800">
        <Clock className="w-3 h-3" />
        Not Reviewed
      </span>
    );
  }

  const statusClasses = {
    'recommended': 'bg-blue-100 text-blue-800',
    'not_recommended': 'bg-orange-100 text-orange-800',
  };

  const statusIcons = {
    'recommended': ThumbsUp,
    'not_recommended': XCircle,
  };

  const Icon = statusIcons[recstatus as keyof typeof statusIcons] || Clock;

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${statusClasses[recstatus as keyof typeof statusClasses]}`}>
      <Icon className="w-3 h-3" />
      {recstatus.charAt(0).toUpperCase() + recstatus.slice(1).replace('_', ' ')}
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
              <p className="text-sm text-gray-500">Recommendation Status</p>
              <div className="font-medium">
                <RecStatusBadge recstatus={application.recstatus} />
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

          {application.recommendation_notes && (
            <div>
              <p className="text-sm text-gray-500">Recommendation Notes</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="font-medium whitespace-pre-line text-blue-800">{application.recommendation_notes}</p>
              </div>
            </div>
          )}
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

// Status Update Modal Component
const StatusUpdateModal = ({ 
  isOpen, 
  onClose, 
  applicationId,
  action,
  onUpdateStatus 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  applicationId: string | null;
  action: 'approve' | 'reject' | 'recommend' | 'not_recommend' | null;
  onUpdateStatus: (applicationId: string, status: 'approved' | 'rejected' | 'recommended' | 'not_recommended', notes: string) => Promise<void>;
}) => {
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async () => {
    if (!applicationId || !action) return;
    
    setIsUpdating(true);
    try {
      let status: 'approved' | 'rejected' | 'recommended' | 'not_recommended';
      if (action === 'approve') {
        status = 'approved';
      } else if (action === 'reject') {
        status = 'rejected';
      } else if (action === 'recommend') {
        status = 'recommended';
      } else {
        status = 'not_recommended';
      }
      
      await onUpdateStatus(applicationId, status, notes);
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getModalTitle = () => {
    switch (action) {
      case 'approve': return 'Approve Leave';
      case 'reject': return 'Reject Leave';
      case 'recommend': return 'Recommend Leave';
      case 'not_recommend': return 'Not Recommend Leave';
      default: return 'Update Leave Status';
    }
  };

  const getNotesLabel = () => {
    switch (action) {
      case 'approve': return 'Approval Notes';
      case 'reject': return 'Reason for Rejection';
      case 'recommend': return 'Recommendation Notes';
      case 'not_recommend': return 'Reason for Not Recommending';
      default: return 'Notes';
    }
  };

  const getNotesPlaceholder = () => {
    switch (action) {
      case 'approve': return 'Add any notes about this approval...';
      case 'reject': return 'Explain why this leave application is being rejected...';
      case 'recommend': return 'Add your recommendation notes for this leave application...';
      case 'not_recommend': return 'Explain why you are not recommending this leave application...';
      default: return 'Add notes...';
    }
  };

  const getButtonColor = () => {
    switch (action) {
      case 'approve': return 'bg-green-600 hover:bg-green-700';
      case 'reject': return 'bg-red-600 hover:bg-red-700';
      case 'recommend': return 'bg-blue-600 hover:bg-blue-700';
      case 'not_recommend': return 'bg-orange-600 hover:bg-orange-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  const getButtonIcon = () => {
    switch (action) {
      case 'approve': return CheckCircle;
      case 'reject': return XCircle;
      case 'recommend': return ThumbsUp;
      case 'not_recommend': return XCircle;
      default: return CheckCircle;
    }
  };

  if (!isOpen) return null;

  const Icon = getButtonIcon();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {getModalTitle()}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getNotesLabel()}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              rows={4}
              placeholder={getNotesPlaceholder()}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-6">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
            disabled={isUpdating}
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            className={`px-4 py-2 ${getButtonColor()} text-white rounded-lg text-sm flex items-center gap-2`}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Icon className="w-4 h-4" />
            )}
            {action === 'recommend' ? 'Recommend' : action === 'not_recommend' ? 'Not Recommend' : 'Update Status'}
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

// Function to get branch from town using the reference table
const getBranchFromTown = async (town: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('kenya_branches')
      .select('"Branch Office"')
      .ilike('Area', `%${town}%`)
      .limit(1);

    if (error) {
      console.error("Error fetching branch from town:", error);
      return null;
    }

    if (data && data.length > 0) {
      return data[0]['Branch Office'];
    }

    return null;
  } catch (error) {
    console.error("Error in getBranchFromTown:", error);
    return null;
  }
};

// Get town/area display name
const getDisplayName = (currentTown: string, isArea: boolean) => {
  if (!currentTown) return "All Towns";
  if (currentTown === 'ADMIN_ALL') return "All Towns";
  
  if (isArea) {
    return `${currentTown} Region`;
  }
  
  return currentTown;
};

// Leave Management Dashboard
export default function LeaveManagementSystem({ selectedTown, onTownChange, selectedRegion }: TownProps) {
  // Add the same state variables from DashboardMain for town filtering
  const [currentTown, setCurrentTown] = useState<string>(selectedTown || '');
  const [areaTownMapping, setAreaTownMapping] = useState<AreaTownMapping>({});
  const [branchAreaMapping, setBranchAreaMapping] = useState<BranchAreaMapping>({});
  const [isArea, setIsArea] = useState<boolean>(false);
  const [townsInArea, setTownsInArea] = useState<string[]>([]);
  const [debugInfo, setDebugInfo] = useState<string>("Initializing...");
  
  // Original state variables
  const [activeTab, setActiveTab] = useState('applications');
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>(DEFAULT_LEAVE_TYPES);
  const [holidays, setHolidays] = useState<Holiday[]>(SAMPLE_HOLIDAYS);
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<EmployeeLeaveBalance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<LeaveApplication | null>(null);
  
  // Status update modal state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [statusAction, setStatusAction] = useState<'approve' | 'reject' | 'recommend' | 'not_recommend' | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
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
  const [recommendingId, setRecommendingId] = useState<string | null>(null);
  const [notRecommendingId, setNotRecommendingId] = useState<string | null>(null);
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
    "Status": 'pending',
    "recstatus": null
  });
  const [accrualSettings, setAccrualSettings] = useState({
    accrualInterval: 'monthly',
    accrualAmount: 2,
    nextAccrualDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().split('T')[0]
  });

  // Load area-town mapping and saved town from localStorage on component mount
  useEffect(() => {
    const loadMappings = async () => {
      try {
        // Fetch the area-town mapping from the database
        const { data: employeesData, error: employeesError } = await supabase
          .from('employees')
          .select('Branch, Town');
        
        if (employeesError) {
          console.error("Error loading area-town mapping:", employeesError);
          return;
        }
        
        // Convert the data to a mapping object
        const mapping: AreaTownMapping = {};
        employeesData?.forEach(item => {
          if (item.Branch && item.Town) {
            if (!mapping[item.Branch]) {
              mapping[item.Branch] = [];
            }
            mapping[item.Branch].push(item.Town);
          }
        });
        
        setAreaTownMapping(mapping);
        
        // Fetch branch-area mapping from kenya_branches
        const { data: branchesData, error: branchesError } = await supabase
          .from('kenya_branches')
          .select('"Branch Office", "Area"');
        
        if (branchesError) {
          console.error("Error loading branch-area mapping:", branchesError);
          return;
        }
        
        // Convert the data to a mapping object
        const branchMapping: BranchAreaMapping = {};
        branchesData?.forEach(item => {
          if (item['Branch Office'] && item['Area']) {
            branchMapping[item['Branch Office']] = item['Area'];
          }
        });
        
        setBranchAreaMapping(branchMapping);
        setDebugInfo("Mappings loaded successfully");
      } catch (error) {
        console.error("Error in loadMappings:", error);
        setDebugInfo(`Error loading mappings: ${error.message}`);
      }
    };

    loadMappings();

    const savedTown = localStorage.getItem('selectedTown');
    if (savedTown && (!selectedTown || selectedTown === 'ADMIN_ALL')) {
      setCurrentTown(savedTown);
      if (onTownChange) {
        onTownChange(savedTown);
      }
      setDebugInfo(`Loaded saved town from storage: "${savedTown}"`);
    } else if (selectedTown) {
      setCurrentTown(selectedTown);
      localStorage.setItem('selectedTown', selectedTown);
      setDebugInfo(`Using town from props: "${selectedTown}"`);
    }
  }, [selectedTown, onTownChange]);

  // Check if current selection is an area and get its towns
  useEffect(() => {
    if (currentTown && areaTownMapping[currentTown]) {
      setIsArea(true);
      setTownsInArea(areaTownMapping[currentTown]);
      setDebugInfo(`"${currentTown}" is an area containing towns: ${areaTownMapping[currentTown].join(', ')}`);
    } else {
      setIsArea(false);
      setTownsInArea([]);
    }
  }, [currentTown, areaTownMapping]);

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
    
    const deductibleLeaveTypes = DEFAULT_LEAVE_TYPES.filter(type => type.is_deductible);
    
    employeesData.forEach(employee => {
      deductibleLeaveTypes.forEach(leaveType => {
        const usedDays = applicationsData
          .filter(app => 
            app["Employee Number"] === employee.employee_number && 
            app["Leave Type"] === leaveType.name &&
            app.Status === 'approved'
          )
          .reduce((sum, app) => sum + (app.Days || 0), 0);
        
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
      console.log('Saving balance changes:', leaveBalances);
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Leave balance settings saved successfully!');
    } catch (err) {
      setError('Failed to save balance changes. Please try again.');
      console.error(err);
    } finally {
      setSavingBalances(false);
    }
  };

  // Function to open status update modal
  const openStatusModal = (applicationId: string, action: 'approve' | 'reject' | 'recommend' | 'not_recommend') => {
    setSelectedApplicationId(applicationId);
    setStatusAction(action);
    setShowStatusModal(true);
  };

  // Function to update leave status with reason
  const handleUpdateStatus = async (applicationId: string, status: 'approved' | 'rejected' | 'recommended' | 'not_recommended', notes: string) => {
    setUpdatingStatus(true);
    try {
      let updateData: any = {};
      
      if (status === 'approved' || status === 'rejected') {
        updateData = { 
          "Status": status,
          "Reason": notes 
        };
      } else if (status === 'recommended' || status === 'not_recommended') {
        updateData = { 
          "recstatus": status,
          "recommendation_notes": notes 
        };
      }

      const { error } = await supabase
        .from('leave_application')
        .update(updateData)
        .eq('id', applicationId);
      
      if (error) throw error;
      
      setLeaveApplications(prev => prev.map(app => 
        app.id === applicationId ? {
          ...app,
          ...updateData
        } : app
      ));
      
    } catch (err) {
      setError(`Failed to update status. Please try again.`);
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Fetch data from Supabase
  useEffect(() => {
    const fetchLeaveApplications = async () => {
      setLoading(true);
      try {
        console.log('[DEBUG] Fetching applications for town:', currentTown);
        
        // Build base query
        let query = supabase
          .from('leave_application')
          .select('*')
          .order('time_added', { ascending: false });

        // Apply Office Branch filter if selected
        if (currentTown && currentTown !== 'ADMIN_ALL') {
          console.log('[DEBUG] Applying filter for town:', currentTown);
          query = query.eq('"Office Branch"', currentTown.trim());
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
            "recstatus": app.recstatus || null,
            "time_added": app.time_added,
            "recommendation_notes": app.recommendation_notes || undefined
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
          filter: currentTown && currentTown !== 'ADMIN_ALL' 
            ? `"Office Branch"=eq.${currentTown.trim()}`
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
              "recstatus": application.recstatus || null,
              "time_added": application.time_added,
              "recommendation_notes": application.recommendation_notes
            }, ...prev]);
          }
          else if (payload.eventType === 'UPDATE') {
            setLeaveApplications(prev => prev.map(app => 
              app.id === application.id ? {
                ...app,
                "Status": application["Status"].toLowerCase() as 'pending' | 'approved' | 'rejected',
                "recstatus": application.recstatus || null,
                "Reason": application["Reason"],
                "Days": application["Days"],
                "recommendation_notes": application.recommendation_notes
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
  }, [currentTown]);

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
          "recstatus": newLeaveApplication["recstatus"],
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
        "Status": 'pending',
        "recstatus": null
      });
      
    } catch (err) {
      setError('Failed to submit leave application. Please try again.');
      console.error(err);
    }
  };

  const handleRunAccrual = () => {
    const newBalances = leaveBalances.map(balance => {
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
    console.log(`Leave days accrued. Next accrual would be on ${accrualSettings.nextAccrualDate}`);
  };

  // Calculate leave statistics for dashboard
  const pendingApplications = leaveApplications.filter(app => app.Status === 'pending').length;
  const approvedApplications = leaveApplications.filter(app => app.Status === 'approved').length;
  const recommendedApplications = leaveApplications.filter(app => app.recstatus === 'recommended').length;
  const notRecommendedApplications = leaveApplications.filter(app => app.recstatus === 'not_recommended').length;
  const totalLeaveDaysUsed = leaveBalances.reduce((sum, balance) => sum + balance.used_days, 0);
  const totalLeaveDaysRemaining = leaveBalances.reduce((sum, balance) => sum + balance.remaining_days, 0);

  // Refresh function
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="p-4 space-y-6 bg-gray-50 min-h-screen max-w-screen-2xl mx-auto">
      {/* Header Section with Town Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Leave Management System</h1>
            <p className="text-gray-600 text-sm">Manage employee leave applications, balances, and settings</p>
            <div className="flex items-center mt-2">
              <span className="text-sm text-gray-600 mr-2">Viewing:</span>
              <span className="font-medium text-indigo-600 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {getDisplayName(currentTown, isArea)}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button 
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium border border-gray-300"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
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
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <ThumbsUp className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Recommended</p>
            <p className="text-gray-900 text-xl font-bold">{recommendedApplications}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Not Recommended</p>
            <p className="text-gray-900 text-xl font-bold">{notRecommendedApplications}</p>
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
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Office Branch</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Recommendation</th>
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
                      <RecStatusBadge recstatus={application.recstatus} />
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
                          <RoleButtonWrapper allowedRoles={['ADMIN','HR']}>
                            <button 
                              onClick={() => openStatusModal(application.id, 'approve')}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Approve
                            </button>
                            </RoleButtonWrapper>
                            <RoleButtonWrapper allowedRoles={['ADMIN','HR']}>
                            <button 
                              onClick={() => openStatusModal(application.id, 'reject')}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs"
                            >
                              <XCircle className="w-3 h-3" />
                              Reject
                            </button>
                            </RoleButtonWrapper>
                            <button 
                              onClick={() => openStatusModal(application.id, 'recommend')}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs"
                            >
                              <ThumbsUp className="w-3 h-3" />
                              Recommend
                            </button>
                            <button 
                              onClick={() => openStatusModal(application.id, 'not_recommend')}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded text-xs"
                            >
                              <XCircle className="w-3 h-3" />
                              Not Recommend
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

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        applicationId={selectedApplicationId}
        action={statusAction}
        onUpdateStatus={handleUpdateStatus}
      />

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