import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { IoMailOutline } from 'react-icons/io5';
import { 
  FileText, 
  FileSignature, 
  MessageSquare,
  UserCog, 
  BookOpen,
  UploadCloud,
  Home,
  PartyPopper,
  Wallet,
  User,
  Calendar,
  ChevronDown,
  LogOut,
  LockKeyhole,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Banknote,
  Menu,
  ChevronRight,
  MapPin,
  MapPinOff,
  Trash2,
  Bell,
  Mail
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import TrainingModule from './Training';
import Profile from './Profile';
import ChatComponent from './Chat';
import VideoConferenceComponent from './VideoConf';
import UserProfileDropdown from './UserProfile';
import PasswordResetModal from './test';
import DocumentsUploadPage from './Documents';
import PayslipViewer from './PayslipViewer';
import EmployeeBioPage from './Bio';
import solo from '../../../public/solo.png';


interface CompanyProfile {
  id: number;
  image_url: string | null;
  company_name: string | null;
  company_tagline: string | null;
}

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

interface NotificationState {
  items: NotificationItem[];
  lastUpdated: Date | null;
}

// Geolocation and Time Tracking Types
interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface AttendanceLog {
  id?: string;
  employee_number: string;
  login_time: string;
  logout_time: string | null;
  geolocation: GeolocationPosition | null;
  status: 'logged_in' | 'logged_out';
  created_at?: string;
}

// SidebarNavItem Component
const SidebarNavItem = ({ 
  icon, 
  label, 
  active, 
  onClick,
  hasSubmenu = false,
  isExpanded = false
}: { 
  icon: React.ReactNode, 
  label: string, 
  active: boolean, 
  onClick: () => void,
  hasSubmenu?: boolean,
  isExpanded?: boolean
}) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
      active 
        ? 'bg-[#42fcff]/60 text-green-700'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    <div className="flex items-center">
      <span className="mr-3">{icon}</span>
      {label}
    </div>
    {hasSubmenu && (
      <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
    )}
  </button>
);




// PasswordResetModal Component


// GeolocationWarningModal Component
const GeolocationWarningModal = ({ 
  isOpen, 
  onConfirm 
}: { 
  isOpen: boolean, 
  onConfirm: () => void 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
      >
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
          Geolocation Required
        </h3>
        
        <p className="text-sm text-gray-600 text-center mb-6">
          You must enable geolocation to log in and use the staff portal. 
          Your location will be used to verify your attendance and working hours.
        </p>
        
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Warning:</strong> If you don't enable geolocation, you will not be considered logged in.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onConfirm}
            className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
            I Understand, Enable Geolocation
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// UserProfileDropdown Component


// Geolocation and Time Tracking Functions
const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

const logLoginTime = async (employeeNumber: string): Promise<boolean> => {
  try {
    let position: GeolocationPosition | null = null;
    
    try {
      position = await getCurrentPosition();
    } catch (error) {
      console.warn('Could not get geolocation:', error);
      // We'll still log the login but with null geolocation
    }

    const { data, error } = await supabase
      .from('attendance_logs')
      .insert([{
        employee_number: employeeNumber,
        login_time: new Date().toISOString(),
        logout_time: null,
        geolocation: position,
        status: 'logged_in'
      }])
      .select()
      .single();

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error logging login time:', error);
    return false;
  }
};

const checkExistingLogin = async (employeeNumber: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('attendance_logs')
      .select('id')
      .eq('employee_number', employeeNumber)
      .is('logout_time', null)
      .order('login_time', { ascending: false })
      .limit(1)
      .single();

    return !!data;
  } catch (error) {
    return false;
  }
};

// Header Status Component
const HeaderStatus = ({ 
  isLoggedIn, 
  lastLogin,
  geolocationStatus,
  userName
}: { 
  isLoggedIn: boolean; 
  lastLogin: string | null;
  geolocationStatus: 'granted' | 'denied' | 'prompt';
  userName: string;
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center text-sm">
        {geolocationStatus === 'granted' ? (
          <MapPin className="h-4 w-4 text-green-500 mr-1" />
        ) : (
          <MapPinOff className="h-4 w-4 text-red-500 mr-1" />
        )}
        <span className={geolocationStatus === 'granted' ? 'text-green-600' : 'text-red-600'}>
          {geolocationStatus === 'granted' ? 'Location Enabled' : 'Location Disabled'}
        </span>
      </div>
      
      <div className="flex items-center text-sm">
        <Clock className="h-4 w-4 text-gray-500 mr-1" />
        {isLoggedIn ? (
          <span className="text-green-600">
            Logged in at {lastLogin ? new Date(lastLogin).toLocaleTimeString() : 'recently'}
          </span>
        ) : (
          <span className="text-red-600">Not logged in</span>
        )}
      </div>
      
      {/* User Profile in Header */}
      <div className="flex items-center">
        {/* <button 
          onClick={() => navigate('/staff')}
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <User className="h-4 w-4 text-green-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">{userName}</span>
        </button> */}
      </div>
    </div>
  );
};

// ComingSoon Component
const ComingSoon = ({ title }: { title: string }) => (
  <div className="p-12 text-center">
    <div className="max-w-md mx-auto bg-gray-50 p-8 rounded-lg">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-sm mb-4">
        <PartyPopper className="h-8 w-8 text-gray-500" />
      </div>
      <h2 className="mt-2 text-xl font-medium text-gray-900">{title} Portal</h2>
      <p className="mt-3 text-sm text-gray-500">
        This section is currently under development and will be available soon.
      </p>
      <div className="mt-6">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
          Coming soon...
        </span>
      </div>
    </div>
  </div>
);

// PortalCard Component
const PortalCard = ({ icon, title, description, onClick }: { 
  icon: React.ReactNode, 
  title: string, 
  description: string, 
  onClick: () => void 
}) => (
  <motion.div 
    whileHover={{ y: -2 }}
    className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-gray-300 transition-colors"
    onClick={onClick}
  >
    <div className="flex items-start">
      <div className="p-2 bg-gray-100 rounded-md mr-3">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
    </div>
  </motion.div>
);

// LeaveApplicationForm Component with rules implementation
const LeaveApplicationForm = () => {
  const [formData, setFormData] = useState({
    "Employee Number": '',
    "Name": '',
    "Office Branch": '',
    "Leave Type": 'month',
    "Start Date": '',
    "End Date": '',
    "Days": 0,
    "Type": 'Full Day',
    "Application Type": 'First Application',
    "Reason": '',
    "Status": 'Pending',
    time_added: new Date().toISOString()
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingLeave, setExistingLeave] = useState<any>(null);
  const [userLeavesThisMonth, setUserLeavesThisMonth] = useState(0);
  const [userLeaveTypesThisMonth, setUserLeaveTypesThisMonth] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployeeData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user?.email) {
        try {
          const { data, error } = await supabase
            .from('employees')
            .select('"Employee Number", "First Name", "Last Name", "Office"')
            .eq('"Work Email"', user.email)
            .single();

          if (error) throw error;
          
          if (data) {
            setFormData(prev => ({
              ...prev,
              "Employee Number": data["Employee Number"] || '',
              "Name": `${data["First Name"]} ${data["Last Name"]}` || '',
              "Office Branch": data["Office"] || ''
            }));

            // Check leave rules
            await checkLeaveRules(data["Employee Number"]);
          }
        } catch (error) {
          console.error('Error fetching employee data:', error);
        }
      }
    };

    fetchEmployeeData();
  }, []);

  const checkLeaveRules = async (employeeNumber: string) => {
    try {
      // Check if there's any active leave by another staff member
      const { data: activeLeaves } = await supabase
        .from('leave_application')
        .select('*')
        .neq('"Employee Number"', employeeNumber)
        .in('Status', ['Pending', 'Approved']);

      if (activeLeaves && activeLeaves.length > 0) {
        setExistingLeave(activeLeaves[0]);
      }

      // Check how many leaves the user has applied for this month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const { data: userLeaves } = await supabase
        .from('leave_application')
        .select('*,"Leave Type"')
        .eq('"Employee Number"', employeeNumber)
        .gte('time_added', firstDayOfMonth.toISOString())
        .lte('time_added', lastDayOfMonth.toISOString());

      setUserLeavesThisMonth(userLeaves?.length || 0);
      
      // Track which leave types the user has already applied for this month
      const types = userLeaves?.map(leave => leave["Leave Type"]) || [];
      setUserLeaveTypesThisMonth(types);
    } catch (error) {
      console.error('Error checking leave rules:', error);
    }
  };

  const calculateDays = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === "Start Date" || name === "End Date") {
      const days = calculateDays(
        name === "Start Date" ? value : formData["Start Date"],
        name === "End Date" ? value : formData["Start Date"]
      );
      setFormData(prev => ({
        ...prev,
        "Days": days
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check leave rules
    if (existingLeave) {
      toast.error('Cannot submit leave application. Another staff member already has an active leave.');
      return;
    }
    
    // Allow multiple leaves per month but only one of each type
    // Except for monthly leave which can only be applied once per month
    if (formData["Leave Type"] === "month" && userLeaveTypesThisMonth.includes("month")) {
      toast.error('You have already applied for monthly leave this month.');
      return;
    }
    
    // Check if user is trying to apply for the same type of leave again (except monthly which is handled above)
    if (formData["Leave Type"] !== "month" && userLeaveTypesThisMonth.includes(formData["Leave Type"])) {
      toast.error(`You have already applied for ${formData["Leave Type"]} leave this month.`);
      return;
    }

    setIsSubmitting(true);

    if (formData["Days"] <= 0) {
      toast.error('End date must be after start date');
      setIsSubmitting(false);
      return;
    }

    if (!formData["Reason"] || formData["Reason"].trim().length < 10) {
      toast.error('Please provide a detailed reason (minimum 10 characters)');
      setIsSubmitting(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('leave_application')
        .insert([{
          "Employee Number": formData["Employee Number"],
          "Name": formData["Name"],
          "Office Branch": formData["Office Branch"],
          "Leave Type": formData["Leave Type"],
          "Start Date": formData["Start Date"],
          "End Date": formData["End Date"],
          "Days": formData["Days"],
          "Type": formData["Type"],
          "Application Type": formData["Application Type"],
          "Reason": formData["Reason"],
          "Status": formData["Status"],
          time_added: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      toast.success('Leave application submitted successfully!');
      
      // Redirect to leave history
      navigate('/staff-portal?tab=leave-history');
      
      setFormData(prev => ({
        ...prev,
        "Leave Type": 'month',
        "Start Date": '',
        "End Date": '',
        "Days": 0,
        "Type": 'Full Day',
        "Application Type": 'First Application',
        "Reason": '',
        time_added: new Date().toISOString()
      }));

    } catch (error) {
      console.error('Error submitting leave application:', error);
      toast.error('Failed to submit leave application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Leave Application</h2>
        <div className="flex items-center mt-2">
          <div className="h-1 w-8 bg-green-500 rounded-full mr-2"></div>
          <p className="text-sm text-green-600">Staff members accrue two leave days each calendar month.</p>
        </div>
        
        {/* Show warning messages */}
        {existingLeave && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Cannot apply for leave. {existingLeave.Name} already has an active leave application.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {userLeaveTypesThisMonth.includes("month") && (
          <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  You have already applied for monthly leave this month. You can still apply for other leave types.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Employee Number</label>
              <input
                type="text"
                name="Employee Number"
                value={formData["Employee Number"]}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50"
                readOnly
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="Name"
                value={formData["Name"]}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50"
                readOnly
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Office Branch</label>
              <input
                type="text"
                name="Office Branch"
                value={formData["Office Branch"]}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50"
                readOnly
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Leave Type</label>
              <select
                name="Leave Type"
                value={formData["Leave Type"]}
                onChange={handleChange}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
                disabled={userLeaveTypesThisMonth.includes(formData["Leave Type"]) && formData["Leave Type"] !== "month"}
              >  
                <option value="month">Monthly Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="maternity">Maternity Leave</option>
                <option value="paternity">Paternity Leave</option>
                <option value="compassionate">Compassionate Leave</option>
                <option value="annual" disabled>Annual Leave (Disabled)</option>
              </select>
              {userLeaveTypesThisMonth.includes(formData["Leave Type"]) && (
                <p className="text-xs text-purple-500 mt-1">You've already applied for this leave type this month</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Application Type</label>
              <select
                name="Application Type"
                value={formData["Application Type"]}
                onChange={handleChange}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="First Application">First Application</option>
                <option value="Extension">Extension</option>
                <option value="Recall">Recall</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                name="Start Date"
                value={formData["Start Date"]}
                onChange={handleChange}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                name="End Date"
                value={formData["End Date"]}
                onChange={handleChange}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
                min={formData["Start Date"] || new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Total Days</label>
              <input
                type="number"
                name="Days"
                value={formData["Days"]}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50"
                readOnly
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Leave Duration Type</label>
            <div className="flex space-x-6 pt-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="Type"
                  value="Full Day"
                  checked={formData["Type"] === 'Full Day'}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Full Day</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="Type"
                  value="Half Day"
                  checked={formData["Type"] === 'Half Day'}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Half Day</span>
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Reason</label>
            <textarea
              name="Reason"
              rows={4}
              value={formData["Reason"]}
              onChange={handleChange}
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Please provide details for your leave request"
              required
              minLength={10}
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || existingLeave || (userLeaveTypesThisMonth.includes(formData["Leave Type"]) && formData["Leave Type"] === "month")}
              className={`w-full bg-green-600 text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center ${
                isSubmitting || existingLeave || (userLeaveTypesThisMonth.includes(formData["Leave Type"]) && formData["Leave Type"] === "month") ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : 'Submit Application'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
// LeaveApplicationsList Component
const LeaveApplicationsList = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaveApplications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user?.email) {
        try {
          const { data: employeeData, error: employeeError } = await supabase
            .from('employees')
            .select('"Employee Number"')
            .eq('"Work Email"', user.email)
            .single();

          if (employeeError) throw employeeError;

          if (employeeData?.["Employee Number"]) {
            const { data: leaveData, error: leaveError } = await supabase
              .from('leave_application')
              .select('*')
              .eq('"Employee Number"', employeeData["Employee Number"])
              .order('time_added', { ascending: false });

            if (leaveError) throw leaveError;

            setApplications(leaveData || []);
          }
        } catch (error) {
          console.error('Error fetching leave applications:', error);
          setError('Failed to load leave applications');
          toast.error('Could not fetch your leave applications');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchLeaveApplications();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Rejected</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="max-w-md mx-auto bg-gray-50 p-6 rounded-lg">
          <div className="h-12 w-12 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <Calendar className="h-5 w-5 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No leave applications</h3>
          <p className="mt-1 text-sm text-gray-500">You haven't submitted any leave applications yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">My Leave Applications</h2>
        <div className="flex items-center mt-2">
          <div className="h-1 w-8 bg-green-500 rounded-full mr-2"></div>
          <p className="text-sm text-green-600">View the status of your leave requests</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leave Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted On
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 capitalize">
                      {app["Leave Type"].replace(/-/g, ' ')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                      {app["Reason"]}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(app["Start Date"]).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      to {new Date(app["End Date"]).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {app["Days"]} day{app["Days"] !== 1 ? 's' : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(app["Status"])}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(app.time_added).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// SalaryAdvanceForm Component
const SalaryAdvanceForm = () => {
  const [formData, setFormData] = useState({
    "Employee Number": '',
    "Full Name": '',
    "Office Branch": '',
    "Basic Salary": '',
    "Amount Requested": '',
    "Net Salary": '',
    "Reason for Advance": '',
    time_added: new Date().toISOString()
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [view, setView] = useState<'form' | 'list'>('form');

  // Check if current date is between 15th-18th
  const isAdvancePeriod = () => {
    const today = new Date();
    const day = today.getDate();
    return day >= 13 && day <= 18;
  };

  // Calculate maximum eligible advance amount (20% of basic salary)
  const calculateMaxAdvance = () => {
    const basicSalary = parseFloat(formData["Basic Salary"]) || 0;
    return basicSalary * 0.2;
  };

  useEffect(() => {
    let subscription: any;

    const fetchEmployeeData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user?.email) {
        try {
          const { data, error } = await supabase
            .from('employees')
            .select('"Employee Number", "First Name", "Last Name", "Office", "Basic Salary"')
            .eq('"Work Email"', user.email)
            .single();

          if (error) throw error;
          
          if (data) {
            const basicSalary = data["Basic Salary"] || '0';
            setFormData(prev => ({
              ...prev,
              "Employee Number": data["Employee Number"] || '',
              "Full Name": `${data["First Name"]} ${data["Last Name"]}` || '',
              "Office Branch": data["Office"] || '',
              "Basic Salary": basicSalary,
              "Net Salary": basicSalary
            }));

            await fetchApplications(data["Employee Number"]);

            subscription = supabase
              .channel('salary_advance_changes')
              .on(
                'postgres_changes',
                {
                  event: '*',
                  schema: 'public',
                  table: 'salary_advance',
                  filter: `"Employee Number"=eq.${data["Employee Number"]}`
                },
                (payload) => {
                  console.log('Change detected:', payload);
                  fetchApplications(data["Employee Number"]);
                }
              )
              .subscribe();
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          toast.error('Could not fetch employee information');
        }
      }
    };

    fetchEmployeeData();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, []);

  useEffect(() => {
    if (formData["Amount Requested"] && formData["Basic Salary"]) {
      const amountRequested = parseFloat(formData["Amount Requested"]) || 0;
      const basicSalary = parseFloat(formData["Basic Salary"]) || 0;
      const netSalary = basicSalary - amountRequested;
      setFormData(prev => ({
        ...prev,
        "Net Salary": netSalary.toFixed(2)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        "Net Salary": formData["Basic Salary"] || '0'
      }));
    }
  }, [formData["Amount Requested"], formData["Basic Salary"]]);

  const fetchApplications = async (employeeNumber: string) => {
    try {
      const { data, error } = await supabase
        .from('salary_advance')
        .select('*')
        .eq('"Employee Number"', employeeNumber)
        .order('time_added', { ascending: false });

      if (error) throw error;

      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "Amount Requested") {
      const maxAdvance = calculateMaxAdvance();
      const numericValue = parseFloat(value) || 0;
      
      // If the entered value exceeds the max, cap it at the max
      if (numericValue > maxAdvance) {
        setFormData(prev => ({
          ...prev,
          "Amount Requested": maxAdvance.toString(),
          "Net Salary": (parseFloat(prev["Basic Salary"]) - maxAdvance).toFixed(2)
        }));
        toast.error(`Amount cannot exceed 20% of basic salary (Ksh${maxAdvance.toFixed(2)})`);
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Check if within application period
    if (!isAdvancePeriod()) {
      toast.error('Salary advance can only be applied between 13th-16th processing  latest 18th of the month');
      setIsSubmitting(false);
      return;
    }

    if (!formData["Amount Requested"] || isNaN(Number(formData["Amount Requested"]))) {
      toast.error('Please enter a valid amount');
      setIsSubmitting(false);
      return;
    }

    const amountRequested = parseFloat(formData["Amount Requested"]);
    const maxAdvance = calculateMaxAdvance();

    if (amountRequested > maxAdvance) {
      toast.error(`Amount requested cannot exceed 20% of basic salary (Ksh${maxAdvance.toFixed(2)})`);
      setIsSubmitting(false);
      return;
    }

    if (!formData["Reason for Advance"] || formData["Reason for Advance"].trim().length < 10) {
      toast.error('Please provide a detailed reason (minimum 10 characters)');
      setIsSubmitting(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('salary_advance')
        .insert([{
          "Employee Number": formData["Employee Number"],
          "Full Name": formData["Full Name"],
          "Office Branch": formData["Office Branch"],
          "Basic Salary": formData["Basic Salary"],
          "Amount Requested": formData["Amount Requested"],
          "Net Salary": formData["Net Salary"],
          "Reason for Advance": formData["Reason for Advance"],
          status: 'Pending',
          time_added: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      toast.success('Salary advance application submitted successfully!');
      
      setView('list');
      
      setFormData(prev => ({
        ...prev,
        "Amount Requested": '',
        "Net Salary": prev["Basic Salary"],
        "Reason for Advance": '',
        time_added: new Date().toISOString()
      }));

    } catch (error) {
      console.error('Error submitting salary advance application:', error);
      toast.error('Failed to submit salary advance application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
    }
  };

  if (view === 'list') {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Salary Advance History</h2>
            <div className="flex items-center mt-2">
              <div className="h-1 w-8 bg-green-500 rounded-full mr-2"></div>
              <p className="text-sm text-green-600">View your salary advance applications</p>
            </div>
          </div>
          <button
            onClick={() => setView('form')}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 flex items-center"
          >
            <Wallet className="h-4 w-4 mr-2" />
            New Application
          </button>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-8">
            <div className="max-w-md mx-auto bg-gray-50 p-6 rounded-lg">
              <div className="h-12 w-12 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <Wallet className="h-5 w-5 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No applications yet</h3>
              <p className="mt-1 text-sm text-gray-500">You haven't submitted any salary advance applications.</p>
              <button
                onClick={() => setView('form')}
                className="mt-4 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
              >
                Apply for Salary Advance
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Net Salary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Submitted
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          Ksh{app["Amount Requested"]}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                          {app["Reason for Advance"]}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Ksh{app["Net Salary"]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(app.time_added).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Salary Advance Application</h2>
        <div className="flex items-center mt-2">
          <div className="h-1 w-8 bg-green-500 rounded-full mr-2"></div>
          <p className="text-sm text-green-600">Submit your request for a salary advance (up to 20% of your basic salary)</p>
        </div>
        {!isAdvancePeriod() && (
          <div className="mt-3 bg-blue-100 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-gray-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700">
                  Note: Salary advance can only be applied between 13th-16th processing is latest 18th of the month
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Employee Number</label>
              <input
                type="text"
                name="Employee Number"
                value={formData["Employee Number"]}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50"
                readOnly
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="Full Name"
                value={formData["Full Name"]}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50"
                readOnly
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Office Branch</label>
              <input
                type="text"
                name="Office Branch"
                value={formData["Office Branch"]}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50"
                readOnly
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Basic Salary</label>
              <input
                type="text"
                name="Basic Salary"
                value={`Ksh${formData["Basic Salary"]}`}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50"
                readOnly
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Amount Requested</label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">Ksh</span>
                </div>
                <input
                  type="number"
                  name="Amount Requested"
                  value={formData["Amount Requested"]}
                  onChange={handleChange}
                  className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 pr-12 py-2 sm:text-sm border border-gray-300 rounded-lg"
                  placeholder="0.00"
                  required
                  min="0"
                  max={calculateMaxAdvance()}
                  step="0.01"
                  disabled={!isAdvancePeriod()}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-xs">
                    Max: Ksh{calculateMaxAdvance().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Salary After Deduction</label>
              <input
                type="text"
                name="Net Salary"
                value={`Ksh${formData["Net Salary"]}`}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50"
                readOnly
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Reason for Advance</label>
            <textarea
              name="Reason for Advance"
              rows={4}
              value={formData["Reason for Advance"]}
              onChange={handleChange}
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Please explain why you need this salary advance"
              required
              minLength={10}
              disabled={!isAdvancePeriod()}
            />
          </div>

          <div className="pt-4 flex justify-between">
            <button
              type="button"
              onClick={() => setView('list')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
            >
              <FileText className="h-4 w-4 mr-2" />
              View History
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isAdvancePeriod()}
              className={`px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 flex items-center ${
                isSubmitting || !isAdvancePeriod() ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <Banknote className="h-4 w-4 mr-2" />
                  Submit Application
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

// LoanRequestForm Component
const LoanRequestForm = () => {
  const [formData, setFormData] = useState({
    "Employee Number": '',
    "Full Name": '',
    "Office Branch": '',
    "Basic Salary": '',
    "Loan Amount": '',
    "Repayment Installment": '',
    "First Payment Date": '',
    "Second Payment Date": '',
    "Reason for Loan": '',
    time_added: new Date().toISOString()
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [view, setView] = useState<'form' | 'list'>('form');

  // Calculate repayment dates (next two months)
  const calculateRepaymentDates = () => {
    const today = new Date();
    const firstPayment = new Date(today);
    firstPayment.setMonth(today.getMonth() + 1);
    
    const secondPayment = new Date(today);
    secondPayment.setMonth(today.getMonth() + 2);
    
    return {
      firstPayment: firstPayment.toISOString().split('T')[0],
      secondPayment: secondPayment.toISOString().split('T')[0]
    };
  };

  useEffect(() => {
    let subscription: any;

    const fetchEmployeeData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user?.email) {
        try {
          const { data, error } = await supabase
            .from('employees')
            .select('"Employee Number", "First Name", "Last Name", "Office", "Basic Salary"')
            .eq('"Work Email"', user.email)
            .single();

          if (error) throw error;
          
          if (data) {
            const basicSalary = data["Basic Salary"] || '0';
            const repaymentDates = calculateRepaymentDates();
            
            setFormData(prev => ({
              ...prev,
              "Employee Number": data["Employee Number"] || '',
              "Full Name": `${data["First Name"]} ${data["Last Name"]}` || '',
              "Office Branch": data["Office"] || '',
              "Basic Salary": basicSalary,
              "First Payment Date": repaymentDates.firstPayment,
              "Second Payment Date": repaymentDates.secondPayment
            }));

            await fetchApplications(data["Employee Number"]);

            subscription = supabase
              .channel('loan_request_changes')
              .on(
                'postgres_changes',
                {
                  event: '*',
                  schema: 'public',
                  table: 'loan_requests',
                  filter: `"Employee Number"=eq.${data["Employee Number"]}`
                },
                (payload) => {
                  console.log('Change detected:', payload);
                  fetchApplications(data["Employee Number"]);
                }
              )
              .subscribe();
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          toast.error('Could not fetch employee information');
        }
      }
    };

    fetchEmployeeData();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, []);

  useEffect(() => {
    if (formData["Loan Amount"]) {
      const loanAmount = parseFloat(formData["Loan Amount"]) || 0;
      const installment = (loanAmount / 2).toFixed(2);
      setFormData(prev => ({
        ...prev,
        "Repayment Installment": installment
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        "Repayment Installment": ''
      }));
    }
  }, [formData["Loan Amount"]]);

  const fetchApplications = async (employeeNumber: string) => {
    try {
      const { data, error } = await supabase
        .from('loan_requests')
        .select('*')
        .eq('"Employee Number"', employeeNumber)
        .order('time_added', { ascending: false });

      if (error) throw error;

      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData["Loan Amount"] || isNaN(Number(formData["Loan Amount"]))) {
      toast.error('Please enter a valid loan amount');
      setIsSubmitting(false);
      return;
    }

    if (!formData["Reason for Loan"] || formData["Reason for Loan"].trim().length < 10) {
      toast.error('Please provide a detailed reason (minimum 10 characters)');
      setIsSubmitting(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('loan_requests')
        .insert([{
          "Employee Number": formData["Employee Number"],
          "Full Name": formData["Full Name"],
          "Office Branch": formData["Office Branch"],
          "Basic Salary": formData["Basic Salary"],
          "Loan Amount": formData["Loan Amount"],
          "Repayment Installment": formData["Repayment Installment"],
          "First Payment Date": formData["First Payment Date"],
          "Second Payment Date": formData["Second Payment Date"],
          "Reason for Loan": formData["Reason for Loan"],
          status: 'Pending',
          time_added: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      toast.success('Loan application submitted successfully!');
      
      setView('list');
      
      setFormData(prev => ({
        ...prev,
        "Loan Amount": '',
        "Repayment Installment": '',
        "Reason for Loan": '',
        time_added: new Date().toISOString()
      }));

    } catch (error) {
      console.error('Error submitting loan application:', error);
      toast.error('Failed to submit loan application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
    }
  };

  if (view === 'list') {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Loan Applications</h2>
            <div className="flex items-center mt-2">
              <div className="h-1 w-8 bg-green-500 rounded-full mr-2"></div>
              <p className="text-sm text-green-600">View your loan application history</p>
            </div>
          </div>
          <button
            onClick={() => setView('form')}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 flex items-center"
            disabled={!navigator.geolocation || !('geolocation' in navigator)}
          >
            <Banknote className="h-4 w-4 mr-2" />
            New Application
          </button>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-8">
            <div className="max-w-md mx-auto bg-gray-50 p-6 rounded-lg">
              <div className="h-12 w-12 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <Banknote className="h-5 w-5 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No loan applications</h3>
              <p className="mt-1 text-sm text-gray-500">You haven't submitted any loan applications yet.</p>
              <button
                onClick={() => setView('form')}
                className="mt-4 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                disabled={!navigator.geolocation || !('geolocation' in navigator)}
              >
                Apply for Loan
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loan Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Installment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Repayment Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Submitted
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          Ksh{app["Loan Amount"]}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                          {app["Reason for Loan"]}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Ksh{app["Repayment Installment"]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(app["First Payment Date"]).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(app["Second Payment Date"]).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(app.time_added).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Loan Request</h2>
        <div className="flex items-center mt-2">
          <div className="h-1 w-8 bg-green-500 rounded-full mr-2"></div>
          <p className="text-sm text-green-600">Submit your request for a staff loan</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Employee Number</label>
              <input
                type="text"
                name="Employee Number"
                value={formData["Employee Number"]}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50"
                readOnly
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="Full Name"
                value={formData["Full Name"]}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50"
                readOnly
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Office Branch</label>
              <input
                type="text"
                name="Office Branch"
                value={formData["Office Branch"]}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50"
                readOnly
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Basic Salary</label>
              <input
                type="text"
                name="Basic Salary"
                value={`Ksh${formData["Basic Salary"]}`}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50"
                readOnly
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Loan Amount</label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">Ksh</span>
                </div>
                <input
                  type="number"
                  name="Loan Amount"
                  value={formData["Loan Amount"]}
                  onChange={handleChange}
                  className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 pr-12 py-2 sm:text-sm border border-gray-300 rounded-lg"
                  placeholder="0.00"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Monthly Installment</label>
              <input
                type="text"
                name="Repayment Installment"
                value={`Ksh${formData["Repayment Installment"]}`}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50"
                readOnly
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">First Payment Date</label>
              <input
                type="date"
                name="First Payment Date"
                value={formData["First Payment Date"]}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50"
                readOnly
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Second Payment Date</label>
              <input
                type="date"
                name="Second Payment Date"
                value={formData["Second Payment Date"]}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50"
                readOnly
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Reason for Loan</label>
            <textarea
              name="Reason for Loan"
              rows={4}
              value={formData["Reason for Loan"]}
              onChange={handleChange}
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Please explain why you need this loan"
              required
              minLength={10}
            />
          </div>

          <div className="pt-4 flex justify-between">
            
             <button
              type="button"
              onClick={() => setView('list')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
            >
              <FileText className="h-4 w-4 mr-2" />
              View History
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 flex items-center ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <Banknote className="h-4 w-4 mr-2" />
                  Submit Application
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};


const DashboardHome = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => (
  <div className="p-6">
    <div className="mb-8">
      <h2 className="text-2xl font-light text-gray-800 mb-1"></h2>
      <p className="text-sm text-gray-500"></p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <PortalCard 
        icon={<Wallet className="w-5 h-5 text-gray-600" />}
        title="Salary Advance"
        description="Request salary advance"
        onClick={() => setActiveTab('salary-advance')}
      />
      <PortalCard 
        icon={<Banknote className="w-5 h-5 text-gray-600" />}
        title="Loan Request"
        description="Apply for a staff loan"
        onClick={() => setActiveTab('loan')}
      />
      <PortalCard 
        icon={<MessageSquare className="w-5 h-5 text-gray-600" />}
        title="Communication Hub"
        description="Chat and video calls"
        onClick={() => setActiveTab('VideoConf')}
      />
      <PortalCard 
        icon={<Calendar className="w-5 h-5 text-gray-600" />}
        title="Leave Request"
        description="Submit time off requests"
        onClick={() => setActiveTab('leave')}
      />
      <PortalCard 
        icon={<Calendar className="w-5 h-5 text-gray-600" />}
        title="Leave History"
        description="View your leave applications"
        onClick={() => setActiveTab('leave-history')}
      />
      <PortalCard 
        icon={<FileSignature className="w-5 h-5 text-gray-600" />}
        title="Contracts"
        description="Review documents"
        onClick={() => setActiveTab('contract')}
      />
      <PortalCard 
        icon={<UserCog className="w-5 h-5 text-gray-600" />}
        title="Profile"
        description="Update your details"
        onClick={() => setActiveTab('details')}
      />
      <PortalCard 
        icon={<UploadCloud className="w-5 h-5 text-gray-600" />}
        title="Documents"
        description="Upload files"
        onClick={() => setActiveTab('documents')}
      />
    </div>
  </div>
);
type UserProfileHeaderProps = {
  userName: string;
 setActiveTab: (tab: string) => void; // ✅ Add this
};
// UserProfileHeader Component for the header
const UserProfileHeader = ({ userName, setActiveTab }: UserProfileHeaderProps) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex items-center space-x-4">
      
      <UserProfileDropdown
        onPasswordReset={() => setIsModalOpen(true)}
        loginStatus={{ isLoggedIn: true, lastLogin: "2025-08-21" }}
        userName={userName} 
        setActiveTab={setActiveTab} 
        />
 <PasswordResetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
    
  );
};

// Main StaffPortal Component with Geolocation and Time Tracking
const StaffPortal = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showResetModal, setShowResetModal] = useState(false);
  const [showGeolocationWarning, setShowGeolocationWarning] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [loginStatus, setLoginStatus] = useState({
    isLoggedIn: false,
    lastLogin: null as string | null
  });
  const [geolocationStatus, setGeolocationStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [userName, setUserName] = useState('Staff Member');
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [notifications, setNotifications] = useState<NotificationState>({
    items: [],
    lastUpdated: null
  });
  const [showNotificationDot, setShowNotificationDot] = useState(false);
  const [notificationSidebarOpen, setNotificationSidebarOpen] = useState(false);
  const [employeeNumber, setEmployeeNumber] = useState<string>('');


 const fetchCompanyProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('company_logo')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setCompanyProfile(data);
      }
    } catch (error) {
      console.error('Error fetching company profile:', error);
    }
  };

  // Create notification item from warning data
  const createNotificationItem = (warning: any): NotificationItem => {
    return {
      id: `warning-${warning.id}`,
      type: 'warning',
      title: `Warning: ${warning.type}`,
      message: warning.message,
      timestamp: new Date(warning.created_at || new Date()),
      isRead: false
    };
  };

  // Fetch notifications from warnings table
  const fetchNotifications = async () => {
    if (!employeeNumber) return;

    try {
      const { data: warnings, error } = await supabase
        .from('warnings')
        .select('*')
        .eq('employee_id', employeeNumber)
        .order('issued_at', { ascending: false });

      if (error) throw error;

      const notificationItems = (warnings || []).map(warning => 
        createNotificationItem(warning)
      );

      setNotifications(prev => ({
        items: notificationItems,
        lastUpdated: new Date()
      }));

      // Show notification dot if there are unread items
      const hasUnread = notificationItems.some(item => !item.isRead);
      setShowNotificationDot(hasUnread);

    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Setup real-time subscription for warnings
  useEffect(() => {
    if (!employeeNumber) return;

    const warningChannel = supabase
      .channel('warnings_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'warnings',
          filter: `employee_id=eq.${employeeNumber}`
        },
        (payload) => {
          const newNotification = createNotificationItem(payload.new);
          setNotifications(prev => ({
            items: [newNotification, ...prev.items],
            lastUpdated: new Date()
          }));
          setShowNotificationDot(true);
          toast.success('New warning notification received');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(warningChannel);
    };
  }, [employeeNumber]);


  // Check geolocation status on component mount
 useEffect(() => {
    checkGeolocationPermission();
    checkLoginStatus();
    fetchUserData();
    fetchCompanyProfile();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return;

      const { data: employeeData } = await supabase
        .from('employees')
        .select('"Employee Number", "First Name", "Last Name"')
        .eq('"Work Email"', user.email)
        .single();

      if (employeeData) {
        setUserName(`${employeeData["First Name"]} ${employeeData["Last Name"]}`);
        setEmployeeNumber(employeeData["Employee Number"]);
        
        // Fetch notifications after we have the employee number
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: NotificationItem) => {
    // Mark as read
    setNotifications(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === notification.id ? { ...item, isRead: true } : item
      )
    }));

    setShowNotificationDot(false);
  };

  // Handle clear all notifications
  const handleClearAll = () => {
    setNotifications(prev => ({
      ...prev,
      items: []
    }));
    setShowNotificationDot(false);
    toast.success('All notifications cleared');
  };

  // Handle remove single notification
  const handleRemoveNotification = (notificationId: string) => {
    setNotifications(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== notificationId)
    }));
  };

  const unreadNotifications = notifications.items.filter(item => !item.isRead);

  

  const checkGeolocationPermission = async () => {
    if (!navigator.geolocation) {
      setGeolocationStatus('denied');
      setShowGeolocationWarning(true);
      return;
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      
      if (result.state === 'granted') {
        setGeolocationStatus('granted');
      } else if (result.state === 'denied') {
        setGeolocationStatus('denied');
        setShowGeolocationWarning(true);
      } else {
        setGeolocationStatus('prompt');
        setShowGeolocationWarning(true);
      }

      // Listen for changes in permission state
      result.onchange = () => {
        setGeolocationStatus(result.state as 'granted' | 'denied');
        if (result.state === 'denied') {
          setShowGeolocationWarning(true);
        }
      };
    } catch (error) {
      console.error('Error checking geolocation permission:', error);
      setGeolocationStatus('denied');
      setShowGeolocationWarning(true);
    }
  };

  const checkLoginStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get employee number from user email
      const { data: employeeData } = await supabase
        .from('employees')
        .select('"Employee Number"')
        .eq('"Work Email"', user.email)
        .single();

      if (!employeeData) return;

      // Check if user has an active login session
      const { data: activeLog } = await supabase
        .from('attendance_logs')
        .select('login_time')
        .eq('employee_number', employeeData["Employee Number"])
        .is('logout_time', null)
        .order('login_time', { ascending: false })
        .limit(1)
        .single();

      setLoginStatus({
        isLoggedIn: !!activeLog,
        lastLogin: activeLog?.login_time || null
      });

      // If no active login session, create one
      if (!activeLog && geolocationStatus === 'granted') {
        const loggedIn = await logLoginTime(employeeData["Employee Number"]);
        if (loggedIn) {
          setLoginStatus({
            isLoggedIn: true,
            lastLogin: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  };

  const handleGeolocationConfirm = async () => {
    setShowGeolocationWarning(false);
    
    try {
      // Try to get current position to trigger permission prompt
      await getCurrentPosition();
      setGeolocationStatus('granted');
      
      // Log login time after permission is granted
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const { data: employeeData } = await supabase
          .from('employees')
          .select('"Employee Number"')
          .eq('"Work Email"', user.email)
          .single();

        if (employeeData) {
          const loggedIn = await logLoginTime(employeeData["Employee Number"]);
          if (loggedIn) {
            setLoginStatus({
              isLoggedIn: true,
              lastLogin: new Date().toISOString()
            });
            toast.success('Successfully logged in with geolocation');
          }
        }
      }
    } catch (error) {
      console.error('Error getting geolocation:', error);
      setGeolocationStatus('denied');
      toast.error('Geolocation is required to log in. Please enable it in your browser settings.');
    }
  };

  const toggleMenu = (menu: string) => {
    if (expandedMenu === menu) {
      setExpandedMenu(null);
    } else {
      setExpandedMenu(menu);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* <PasswordResetModal 
        isOpen={showResetModal} 
        onClose={() => setShowResetModal(false)} 
      /> */}

      <GeolocationWarningModal 
        isOpen={showGeolocationWarning} 
        onConfirm={handleGeolocationConfirm}
      />

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <div className={`fixed sidebar-scroll inset-y-0 left-0 z-30 w-64 bg-gray-200 border-r border-gray-200 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-200 ease-in-out`}>
        <div className="flex items-center space-x-3 h-16 px-6 px-y-3 border-b border-gray-300">
          <motion.div 
            className="w-10 h-10 flex-shrink-0 rounded-xl bg-gray-600 flex items-center justify-center shadow-inner"
            whileHover={{ rotate: 5, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <img src={solo} alt="Logo" className="w-8 h-8 filter brightness-110" />
          </motion.div>
          <h1 className="text-lg font-semibold text-gray-900">Staff Portal</h1>
          <button 
            className="md:hidden text-gray-500 hover:text-gray-600"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="h-full  ">
          <div className="p-4 space-y-3.5 text-sm">
            <SidebarNavItem 
              icon={<Home className="h-4 w-4" />}
              label="Dashboard"
              active={activeTab === 'home'}
              onClick={() => setActiveTab('home')}
            />
            
            <SidebarNavItem 
              icon={<BookOpen className="h-4 w-4" />}
              label="Training"
              active={activeTab === 'training'}
              onClick={() => setActiveTab('training')}
            />
             <SidebarNavItem 
              icon={<User className="h-4 w-4" />}
              label="Bio Data"
              active={activeTab === 'biodata'}
              onClick={() => setActiveTab('biodata')}
            />
            <SidebarNavItem 
              icon={<FileText className="h-4 w-4" />}
              label="Payslips"
              active={activeTab === 'payslips'}
              onClick={() => setActiveTab('payslips')}
            />
            
            <div>
              <SidebarNavItem 
                icon={<Banknote className="h-4 w-4" />}
                label="Financial"
                active={activeTab === 'salary-advance' || activeTab === 'loan'}
                onClick={() => toggleMenu('financial')}
                hasSubmenu
                isExpanded={expandedMenu === 'financial'}
              />
              {expandedMenu === 'financial' && (
                <div className="ml-4 mt-1 space-y-1">
                  <SidebarNavItem 
                    icon={<ChevronRight className="h-3 w-3" />}
                    label="Salary Advance"
                    active={activeTab === 'salary-advance'}
                    onClick={() => setActiveTab('salary-advance')}
                  />
                  <SidebarNavItem 
                    icon={<ChevronRight className="h-3 w-3" />}
                    label="Loan Request"
                    active={activeTab === 'loan'}
                    onClick={() => setActiveTab('loan')}
                  />
                </div>
              )}
            </div>
            
            <div>
              <SidebarNavItem 
                icon={<MessageSquare className="h-4 w-4" />}
                label="Communication"
                active={activeTab === 'chat' || activeTab === 'VideoConf'}
                onClick={() => toggleMenu('communication')}
                hasSubmenu
                isExpanded={expandedMenu === 'communication'}
              />
              {expandedMenu === 'communication' && (
                <div className="ml-4 mt-1 space-y-1">
                  <SidebarNavItem 
                    icon={<ChevronRight className="h-3 w-3" />}
                    label="Chat"
                    active={activeTab === 'chat'}
                    onClick={() => setActiveTab('chat')}
                  />
                  <SidebarNavItem 
                    icon={<ChevronRight className="h-3 w-3" />}
                    label="Video Conference"
                    active={activeTab === 'VideoConf'}
                    onClick={() => setActiveTab('VideoConf')}
                  />
                </div>
              )}
            </div>
            
            <div>
              <SidebarNavItem 
                icon={<Calendar className="h-4 w-4" />}
                label="Leave"
                active={activeTab === 'leave' || activeTab === 'leave-history'}
                onClick={() => toggleMenu('leave')}
                hasSubmenu
                isExpanded={expandedMenu === 'leave'}
              />
              {expandedMenu === 'leave' && (
                <div className="ml-4 mt-1 space-y-1">
                  <SidebarNavItem 
                    icon={<ChevronRight className="h-3 w-3" />}
                    label="Apply for Leave"
                    active={activeTab === 'leave'}
                    onClick={() => setActiveTab('leave')}
                  />
                  <SidebarNavItem 
                    icon={<ChevronRight className="h-3 w-3" />}
                    label="Leave History"
                    active={activeTab === 'leave-history'}
                    onClick={() => setActiveTab('leave-history')}
                  />
                </div>
              )}
            </div>
            
            <SidebarNavItem 
              icon={<FileSignature className="h-4 w-4" />}
              label="Contracts"
              active={activeTab === 'contract'}
              onClick={() => setActiveTab('contract')}
            />
            
            <SidebarNavItem 
              icon={<UserCog className="h-4 w-4" />}
              label="Profile"
              active={activeTab === 'details'}
              onClick={() => setActiveTab('details')}
            />
            
            <SidebarNavItem 
              icon={<UploadCloud className="h-4 w-4" />}
              label="Documents"
              active={activeTab === 'documents'}
              onClick={() => setActiveTab('documents')}
            />
          </div>
        </div>
        
        
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        {/* Mobile header */}
        <header className="bg-white border-b border-gray-200 md:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button 
              className="text-gray-500 hover:text-gray-600"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Staff Portal</h1>
            <UserProfileHeader userName={userName} setActiveTab={setActiveTab} />
          </div>
        </header>

        {/* Desktop header with status */}
         <header className="hidden md:flex bg-white border-b border-gray-200 h-16 items-center justify-between px-6">
        {/* Company Logo and Name */}
        <div className="flex items-center space-x-3">
          {companyProfile?.image_url ? (
            <img 
              src={companyProfile.image_url} 
              alt="Company Logo" 
              className="w-10 h-10 rounded-lg object-cover shadow-md"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-700 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">
                {companyProfile?.company_name?.[0] || 'C'}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {companyProfile?.company_name || 'Company Name'}
            </h1>
            <p className="text-xs text-gray-500 line-clamp-1">
              {companyProfile?.company_tagline || 'Staff Portal'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <motion.button
            className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setNotificationSidebarOpen(true)}
            aria-label="Notifications"
          >
            <Mail className="w-5 h-5" />
            {showNotificationDot && unreadNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3  rounded-full animate-pulse"></span>
            )}
            {notifications.items.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                {notifications.items.length}
              </span>
            )}
          </motion.button>

          <HeaderStatus 
            isLoggedIn={loginStatus.isLoggedIn} 
            lastLogin={loginStatus.lastLogin}
            geolocationStatus={geolocationStatus}
            userName={userName}
          />
          <UserProfileHeader userName={userName} setActiveTab={setActiveTab}/>
        </div>
      </header>

      {/* Notification Sidebar */}
      {notificationSidebarOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setNotificationSidebarOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />
          
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-gray-700" />
                  <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                  {notifications.items.length > 0 && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      {notifications.items.length}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {notifications.items.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                      title="Clear all notifications"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setNotificationSidebarOpen(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Bell className="w-12 h-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium">No notifications</p>
                  <p className="text-sm">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notifications.items.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors relative ${
                        !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveNotification(notification.id);
                        }}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-yellow-100 text-yellow-600">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {notification.timestamp.toLocaleDateString()} {notification.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.items.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-500 text-center">
                  {unreadNotifications.length} unread of {notifications.items.length} total
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}

        <main className="flex-1 overflow-y-auto bg-gray-100">
          <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {!loginStatus.isLoggedIn && (
              <div className="mb-6 bg-[#42fcff]/20 border-l-4 border-[#42fcff]/90 p-4 rounded-r-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      <strong>You are not logged in.</strong> Please enable geolocation to record your attendance.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'home' && <DashboardHome setActiveTab={setActiveTab} />}
              {activeTab === 'salary-advance' && <SalaryAdvanceForm />}
              {activeTab === 'biodata' && <EmployeeBioPage/>}
              {activeTab === 'payslips' && <PayslipViewer />}
              {activeTab === 'loan' && <LoanRequestForm />}
              {activeTab === 'training' && <TrainingModule />}
              {activeTab === 'leave' && <LeaveApplicationForm />}
              {activeTab === 'leave-history' && <LeaveApplicationsList />}
              {activeTab === 'contract' && <ComingSoon title="Contracts" />}
              {activeTab === 'details' && <Profile/>}
              {activeTab === 'documents' && <DocumentsUploadPage />}
              {activeTab === 'chat' && <ChatComponent />}
              {activeTab === 'VideoConf' && <VideoConferenceComponent />}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffPortal;