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
  Mail,
  PhoneCall
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import TrainingModule from './Training';
import Profile from './Profile';
import ChatComponent from './Chat';
import VideoConferenceComponent from './VideoConf';
import UserProfileDropdown from './UserProfile';
import PasswordResetModal from './PasswordRestModal';
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

// Enhanced SidebarNavItem Component with deep blue design
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
  <motion.button
    onClick={onClick}
    whileHover={{ x: 4 }}
    whileTap={{ scale: 0.98 }}
    className={`relative flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
      active 
        ? 'bg-blue-500/20 text-white shadow-lg shadow-blue-500/25 border-l-4 border-blue-400'
        : 'text-blue-100/80 hover:bg-blue-500/20 hover:text-white hover:shadow-md'
    }`}
  >
    <div className="flex items-center space-x-3">
      <div className={`transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-105'}`}>
        {icon}
      </div>
      <span className="font-medium">{label}</span>
    </div>
    
    {hasSubmenu && (
      <ChevronRight 
        className={`h-4 w-4 transition-transform duration-200 ${
          isExpanded ? 'rotate-90' : ''
        }`} 
      />
    )}

    {/* Active indicator dot */}
    {active && (
      <motion.div
        layoutId="activeIndicator"
        className="absolute left-0 w-1 h-6 bg-blue-400 rounded-r-full"
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    )}
  </motion.button>
);

// Submenu Item Component
const SubmenuItem = ({ 
  icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: React.ReactNode, 
  label: string, 
  active: boolean, 
  onClick: () => void 
}) => (
  <motion.button
    onClick={onClick}
    whileHover={{ x: 8 }}
    whileTap={{ scale: 0.95 }}
    className={`flex items-center w-full pl-12 pr-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-blue-400/30 text-white shadow-inner'
        : 'text-blue-100/70 hover:bg-blue-500/20 hover:text-white'
    }`}
  >
    <div className="flex items-center space-x-3">
      <div className="w-4 h-4 flex items-center justify-center">
        {icon}
      </div>
      <span className="text-sm">{label}</span>
    </div>
  </motion.button>
);

// PasswordResetModal Component
// const PasswordResetModal = ({ 
//   isOpen, 
//   onClose 
// }: { 
//   isOpen: boolean, 
//   onClose: () => void 
// }) => {
//   const [currentPassword, setCurrentPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (newPassword !== confirmPassword) {
//       toast.error('New passwords do not match');
//       return;
//     }
    
//     setIsLoading(true);
//     // Add your password reset logic here
//     await new Promise(resolve => setTimeout(resolve, 1000));
//     setIsLoading(false);
//     toast.success('Password updated successfully');
//     onClose();
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 w-full max-w-md">
//         <h3 className="text-lg font-semibold mb-4">Reset Password</h3>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Current Password
//             </label>
//             <input
//               type="password"
//               value={currentPassword}
//               onChange={(e) => setCurrentPassword(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               New Password
//             </label>
//             <input
//               type="password"
//               value={newPassword}
//               onChange={(e) => setNewPassword(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Confirm New Password
//             </label>
//             <input
//               type="password"
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>
//           <div className="flex justify-end space-x-3 pt-4">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
//             >
//               {isLoading ? 'Updating...' : 'Update Password'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

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
        
        <p className="text-xs text-gray-600 text-center mb-6">
          You must enable geolocation to log in and use the staff portal. 
          Your location will be used to verify your attendance and working hours.
        </p>
        
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-xs text-red-700">
                <strong>Warning:</strong> If you don't enable geolocation, you will not be considered logged in.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onConfirm}
            className="px-4 py-2 border border-transparent rounded-md text-xs font-medium text-white bg-red-600 hover:bg-red-700"
          >
            I Understand, Enable Geolocation
          </button>
        </div>
      </motion.div>
    </div>
  );
};

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
      <div className="flex items-center text-xs">
        {geolocationStatus === 'granted' ? (
          <MapPin className="h-4 w-4 text-green-500 mr-1" />
        ) : (
          <MapPinOff className="h-4 w-4 text-red-500 mr-1" />
        )}
        <span className={geolocationStatus === 'granted' ? 'text-green-600' : 'text-red-600'}>
          {geolocationStatus === 'granted' ? 'Location Enabled' : 'Location Disabled'}
        </span>
      </div>
      
      <div className="flex items-center text-xs">
        <Clock className="h-4 w-4 text-gray-500 mr-1" />
        {isLoggedIn ? (
          <span className="text-green-600">
            Logged in at {lastLogin ? new Date(lastLogin).toLocaleTimeString() : 'recently'}
          </span>
        ) : (
          <span className="text-red-600">Not logged in</span>
        )}
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
      <p className="mt-3 text-xs text-gray-500">
        This section is currently under development and will be available soon.
      </p>
      <div className="mt-6">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
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
        <h3 className="text-xs font-medium text-gray-900">{title}</h3>
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      </div>
    </div>
  </motion.div>
);

// LeaveApplicationForm Component
const LeaveApplicationForm = () => {
  // ... (keep your existing LeaveApplicationForm implementation)
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Leave Application</h2>
        <p className="text-xs text-green-600">Staff members accrue two leave days each calendar month.</p>
      </div>
      {/* Your existing form content */}
    </div>
  );
};

// LeaveApplicationsList Component
const LeaveApplicationsList = () => {
  // ... (keep your existing LeaveApplicationsList implementation)
  return <div>Leave Applications List</div>;
};

// Enhanced SalaryAdvanceForm Component
const SalaryAdvanceForm = () => {
  // ... (keep your existing SalaryAdvanceForm implementation)
  return <div>Salary Advance Form</div>;
};

// Enhanced LoanRequestForm Component
const LoanRequestForm = () => {
  // ... (keep your existing LoanRequestForm implementation)
  return <div>Loan Request Form</div>;
};

// Document Upload Form Component
const DocumentUploadForm = ({ 
  onUpload, 
  availableTypes, 
  uploading 
}: { 
  onUpload: (file: File, type: string) => Promise<boolean>;
  availableTypes: string[];
  uploading: boolean;
}) => {
  // ... (keep your existing DocumentUploadForm implementation)
  return <div>Document Upload Form</div>;
};

// Enhanced DashboardHome with Payslip button
const DashboardHome = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => (
  <div className="p-6">
    <div className="mb-8">
      <h2 className="text-2xl font-light text-gray-800 mb-1">Staff Dashboard</h2>
      <p className="text-xs text-gray-500">Access all staff services and resources</p>
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
        icon={<FileText className="w-5 h-5 text-gray-600" />}
        title="Payslips"
        description="View your payslips"
        onClick={() => setActiveTab('payslips')}
      />
      <PortalCard 
        icon={<PhoneCall className="w-5 h-5 text-gray-600" />}
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
  setActiveTab: (tab: string) => void;
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

// Enhanced StaffPortal Component with deep blue sidebar and single custom scrollbar
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

      const hasUnread = notificationItems.some(item => !item.isRead);
      setShowNotificationDot(hasUnread);

    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

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
        
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    setNotifications(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === notification.id ? { ...item, isRead: true } : item
      )
    }));

    setShowNotificationDot(false);
  };

  const handleClearAll = () => {
    setNotifications(prev => ({
      ...prev,
      items: []
    }));
    setShowNotificationDot(false);
    toast.success('All notifications cleared');
  };

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

      const { data: employeeData } = await supabase
        .from('employees')
        .select('"Employee Number"')
        .eq('"Work Email"', user.email)
        .single();

      if (!employeeData) return;

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
      await getCurrentPosition();
      setGeolocationStatus('granted');
      
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
      <GeolocationWarningModal 
        isOpen={showGeolocationWarning} 
        onConfirm={handleGeolocationConfirm}
      />

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Enhanced Sidebar with Deep Blue Background and Single Custom Scrollbar */}
      <div 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 shadow-2xl border-r border-blue-700/50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-200 ease-in-out flex flex-col sidebar-scroll`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-blue-700/50">
          <div className="flex items-center space-x-3">
            <motion.div 
              className="w-10 h-10 flex-shrink-0 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20"
              whileHover={{ rotate: 5, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <img src={solo} alt="Logo" className="w-8 h-8 filter brightness-0 invert" />
            </motion.div>
            <div>
              <h1 className="text-white font-bold text-lg">Staff Portal</h1>
              <p className="text-blue-200/80 text-xs">Employee Dashboard</p>
            </div>
          </div>
          <button 
            className="md:hidden text-blue-200/70 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Navigation Items - Single scroll container */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          <SidebarNavItem 
            icon={<Home className="h-5 w-5" />}
            label="Dashboard"
            active={activeTab === 'home'}
            onClick={() => setActiveTab('home')}
          />
          
          <SidebarNavItem 
            icon={<BookOpen className="h-5 w-5" />}
            label="Training"
            active={activeTab === 'training'}
            onClick={() => setActiveTab('training')}
          />
          
          <SidebarNavItem 
            icon={<User className="h-5 w-5" />}
            label="Bio Data"
            active={activeTab === 'biodata'}
            onClick={() => setActiveTab('biodata')}
          />
          
          <SidebarNavItem 
            icon={<FileText className="h-5 w-5" />}
            label="Payslips"
            active={activeTab === 'payslips'}
            onClick={() => setActiveTab('payslips')}
          />
          
          {/* Financial Submenu */}
          <div>
            <SidebarNavItem 
              icon={<Wallet className="h-5 w-5" />}
              label="Financial"
              active={activeTab === 'salary-advance' || activeTab === 'loan'}
              onClick={() => toggleMenu('financial')}
              hasSubmenu
              isExpanded={expandedMenu === 'financial'}
            />
            {expandedMenu === 'financial' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="ml-4 mt-2 space-y-1 border-l-2 border-blue-500/30 pl-2"
              >
                <SubmenuItem
                  icon={<ChevronRight className="h-4 w-4" />}
                  label="Salary Advance"
                  active={activeTab === 'salary-advance'}
                  onClick={() => setActiveTab('salary-advance')}
                />
                <SubmenuItem
                  icon={<ChevronRight className="h-4 w-4" />}
                  label="Loan Request"
                  active={activeTab === 'loan'}
                  onClick={() => setActiveTab('loan')}
                />
              </motion.div>
            )}
          </div>
          
          {/* Communication Submenu */}
          <div>
            <SidebarNavItem 
              icon={<PhoneCall className="h-5 w-5" />}
              label="Communication"
              active={activeTab === 'chat' || activeTab === 'VideoConf'}
              onClick={() => toggleMenu('communication')}
              hasSubmenu
              isExpanded={expandedMenu === 'communication'}
            />
            {expandedMenu === 'communication' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="ml-4 mt-2 space-y-1 border-l-2 border-blue-500/30 pl-2"
              >
                <SubmenuItem
                  icon={<ChevronRight className="h-4 w-4" />}
                  label="Chat"
                  active={activeTab === 'chat'}
                  onClick={() => window.location.href = "/teams"}
                />
                <SubmenuItem
                  icon={<ChevronRight className="h-4 w-4" />}
                  label="Video Conference"
                  active={activeTab === 'VideoConf'}
                  onClick={() => setActiveTab('VideoConf')}
                />
              </motion.div>
            )}
          </div>
          
          {/* Leave Submenu */}
          <div>
            <SidebarNavItem 
              icon={<Calendar className="h-5 w-5" />}
              label="Leave"
              active={activeTab === 'leave' || activeTab === 'leave-history'}
              onClick={() => toggleMenu('leave')}
              hasSubmenu
              isExpanded={expandedMenu === 'leave'}
            />
            {expandedMenu === 'leave' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="ml-4 mt-2 space-y-1 border-l-2 border-blue-500/30 pl-2"
              >
                <SubmenuItem
                  icon={<ChevronRight className="h-4 w-4" />}
                  label="Apply for Leave"
                  active={activeTab === 'leave'}
                  onClick={() => setActiveTab('leave')}
                />
                <SubmenuItem
                  icon={<ChevronRight className="h-4 w-4" />}
                  label="Leave History"
                  active={activeTab === 'leave-history'}
                  onClick={() => setActiveTab('leave-history')}
                />
              </motion.div>
            )}
          </div>
          
          <SidebarNavItem 
            icon={<FileSignature className="h-5 w-5" />}
            label="Contracts"
            active={activeTab === 'contract'}
            onClick={() => setActiveTab('contract')}
          />
          
          <SidebarNavItem 
            icon={<UserCog className="h-5 w-5" />}
            label="Profile"
            active={activeTab === 'details'}
            onClick={() => setActiveTab('details')}
          />
          
          <SidebarNavItem 
            icon={<UploadCloud className="h-5 w-5" />}
            label="Documents"
            active={activeTab === 'documents'}
            onClick={() => setActiveTab('documents')}
          />
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-t border-blue-700/50">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-blue-500/20">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">{userName}</p>
              <p className="text-blue-200/80 text-xs">Staff Member</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
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

        {/* Desktop header */}
        <header className="hidden md:flex bg-white border-b border-gray-200 h-16 items-center justify-between px-6">
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
            <motion.button
              className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setNotificationSidebarOpen(true)}
              aria-label="Notifications"
            >
              <Mail className="w-5 h-5" />
              {showNotificationDot && unreadNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
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

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-100">
          <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {!loginStatus.isLoggedIn && (
              <div className="mb-6 bg-[#42fcff]/20 border-l-4 border-[#42fcff]/90 p-4 rounded-r-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-red-700">
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
              {activeTab === 'chat' && (
                <div className="relative h-screen">
                  <ChatComponent chatUrl="https://zira.zulipchat.com/"/>
                </div>
              )}
              {activeTab === 'VideoConf' && <VideoConferenceComponent />}
            </motion.div>
          </div>
        </main>
      </div>

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
            {/* Notification header and content - keep your existing implementation */}
          </motion.div>
        </>
      )}

      {/* Add this to your global CSS file or in a style tag in your main layout */}
      <style>
        {`
          .sidebar-scroll {
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1);
          }
          
          .sidebar-scroll::-webkit-scrollbar {
            width: 4px;
          }
          
          .sidebar-scroll::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px;
          }
          
          .sidebar-scroll::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 2px;
          }
          
          .sidebar-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.5);
          }
        `}
      </style>
    </div>
  );
};

export default StaffPortal;