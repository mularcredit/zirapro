import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  FileSignature, 
  UserCog, 
  UploadCloud,
  Home,
  PartyPopper,
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
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

// NavButton Component
const NavButton = ({ icon, label, active, onClick, isDarkHeader = false }: { 
  icon: React.ReactNode, 
  label: string, 
  active: boolean, 
  onClick: () => void,
  isDarkHeader?: boolean
}) => (
  <button
    onClick={onClick}
    className={`flex items-center px-4 h-full text-sm font-medium ${
      active 
        ? isDarkHeader 
          ? 'text-white border-b-2 border-white' 
          : 'text-gray-900 border-b-2 border-green-600'
        : isDarkHeader
          ? 'text-gray-200 hover:text-white'
          : 'text-gray-500 hover:text-gray-700'
    } transition-colors`}
  >
    <span className="mr-2">{icon}</span>
    {label}
  </button>
);

// PasswordResetModal Component
const PasswordResetModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setEmail(user.email);
      }
    };
    fetchUserEmail();
  }, []);

  const handleResetPassword = async () => {
    if (!email) {
      setMessage({ text: 'Please enter your email', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;

      setMessage({ 
        text: 'Password reset link sent to your email!', 
        type: 'success' 
      });
      toast.success('Password reset link sent successfully');
    } catch (error) {
      console.error('Error sending reset link:', error);
      setMessage({ 
        text: 'Failed to send reset link. Please try again.', 
        type: 'error' 
      });
      toast.error('Error sending password reset link');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <LockKeyhole className="h-5 w-5 mr-2 text-green-600" />
            Reset Password
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="your@email.com"
            />
          </div>

          {message.text && (
            <div className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={isSubmitting}
              className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// UserProfileDropdown Component
const UserProfileDropdown = ({ onPasswordReset }: { onPasswordReset: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Error signing out');
      console.error('Sign out error:', error);
    }
  };
  
  return (
    <div className="ml-4 relative">
      <button 
        className="flex items-center text-sm rounded-full focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="sr-only">Open user menu</span>
        <div className="h-8 w-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
        <ChevronDown className="ml-1 h-4 w-4 text-white" />
      </button>
      
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 z-10"
          onClick={() => setIsOpen(false)}
        >
          <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Profile</a>
          <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
          <button 
            onClick={onPasswordReset}
            className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          >
            <LockKeyhole className="h-4 w-4 mr-2" />
            Reset Password
          </button>
          <button 
            onClick={handleSignOut}
            className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </button>
        </motion.div>
      )}
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

// LeaveApplicationForm Component
const LeaveApplicationForm = () => {
  const [formData, setFormData] = useState({
    "Employee Number": '',
    "Name": '',
    "Office Branch": '',
    "Leave Type": 'annual',
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
          }
        } catch (error) {
          console.error('Error fetching employee data:', error);
          // toast.error('Could not fetch employee information');
        }
      }
    };

    fetchEmployeeData();
  }, []);

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
      
      setFormData(prev => ({
        ...prev,
        "Leave Type": 'annual',
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
    <div className="p-8 shadow-lg">
      <div className="mb-6 pb-6">
        <h2 className="text-lg font-medium text-gray-900">Leave Application</h2>
        <p className="text-xs text-green-500 mt-1">Staff members accrue two leave days each calendar month.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee Number</label>
            <input
              type="text"
              name="Employee Number"
              value={formData["Employee Number"]}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="Name"
              value={formData["Name"]}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Office Branch</label>
            <input
              type="text"
              name="Office Branch"
              value={formData["Office Branch"]}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50"
              readOnly
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
            <select
              name="Leave Type"
              value={formData["Leave Type"]}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
              required
            >  
              <option value="month">Monthly Leave</option>
              <option value="annual">Annual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="maternity">Maternity Leave</option>
              <option value="paternity">Paternity Leave</option>
              <option value="compassionate">Compassionate Leave</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Application Type</label>
            <select
              name="Application Type"
              value={formData["Application Type"]}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
              required
            >
              <option value="First Application">First Application</option>
              <option value="Extension">Extension</option>
              <option value="Recall">Recall</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="Start Date"
              value={formData["Start Date"]}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              name="End Date"
              value={formData["End Date"]}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
              required
              min={formData["Start Date"] || new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Days</label>
            <input
              type="number"
              name="Days"
              value={formData["Days"]}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50"
              readOnly
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Leave Duration Type</label>
          <div className="flex space-x-4">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
          <textarea
            name="Reason"
            rows={3}
            value={formData["Reason"]}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
            placeholder="Please provide details for your leave request"
            required
            minLength={10}
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-green-600 text-white py-2.5 px-4 rounded text-sm font-medium hover:bg-green-700 transition-colors ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
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
          // First get employee number from employees table
          const { data: employeeData, error: employeeError } = await supabase
            .from('employees')
            .select('"Employee Number"')
            .eq('"Work Email"', user.email)
            .single();

          if (employeeError) throw employeeError;

          if (employeeData?.["Employee Number"]) {
            // Then get all leave applications for this employee
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

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <HelpCircle className="h-4 w-4 text-gray-500" />;
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
      <div className="p-8 text-center text-gray-500">
        You haven't submitted any leave applications yet.
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900">My Leave Applications</h2>
        <p className="text-sm text-gray-500">View the status of your leave requests</p>
      </div>

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
                Reason
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
              <tr key={app.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                  {app["Leave Type"].replace(/-/g, ' ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(app["Start Date"]).toLocaleDateString()} - {new Date(app["End Date"]).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {app["Days"]}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {app["Reason"]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(app["Status"])}
                    <span className="ml-2 text-sm text-gray-500 capitalize">{app["Status"]}</span>
                  </div>
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
  );
};

// SalaryAdvanceForm Component
const SalaryAdvanceForm = () => {
  const [formData, setFormData] = useState({
    "Employee Number": '',
    "Full Name": '',
    "Office Branch": '',
    "Amount Requested": '',
    "Reason for Advance": '',
    time_added: new Date().toISOString()
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [view, setView] = useState<'form' | 'list'>('form');

  // Fetch employee data and set up real-time subscription
  useEffect(() => {
    let subscription: any;

    const fetchEmployeeData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user?.email) {
        try {
          // Fetch employee details
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
              "Full Name": `${data["First Name"]} ${data["Last Name"]}` || '',
              "Office Branch": data["Office"] || ''
            }));

            // Initial fetch of applications
            await fetchApplications(data["Employee Number"]);

            // Set up real-time subscription
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

    // Cleanup function to unsubscribe
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, []);

  // Fetch applications for the employee
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData["Amount Requested"] || isNaN(Number(formData["Amount Requested"]))) {
      toast.error('Please enter a valid amount');
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
          "Amount Requested": formData["Amount Requested"],
          "Reason for Advance": formData["Reason for Advance"],
          status: 'Pending', // Ensure status is set initially
          time_added: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      toast.success('Salary advance application submitted successfully!');
      
      // Switch to list view after submission
      setView('list');
      
      // Reset form
      setFormData(prev => ({
        ...prev,
        "Amount Requested": '',
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

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  if (view === 'list') {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">My Salary Advance Applications</h2>
          <button
            onClick={() => setView('form')}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700"
          >
            New Application
          </button>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            You haven't submitted any salary advance applications yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
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
                  <tr key={app.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {app["Amount Requested"]}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {app["Reason for Advance"]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(app.status)}
                        <span className="ml-2 text-sm text-gray-500 capitalize">
                          {app.status || 'Pending'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(app.time_added).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-8 shadow-lg">
      <div className="mb-6 pb-6 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Salary Advance Application</h2>
        <p className="text-xs text-green-500 mt-1">
          Submit your request for a salary advance
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee Number</label>
            <input
              type="text"
              name="Employee Number"
              value={formData["Employee Number"]}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="Full Name"
              value={formData["Full Name"]}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Office Branch</label>
            <input
              type="text"
              name="Office Branch"
              value={formData["Office Branch"]}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50"
              readOnly
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount Requested</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              name="Amount Requested"
              value={formData["Amount Requested"]}
              onChange={handleChange}
              className="focus:ring-green-500 focus:border-green-500 block w-full pl-7 pr-12 py-2 sm:text-sm border border-gray-300 rounded-md"
              placeholder="0.00"
              required
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Advance</label>
          <textarea
            name="Reason for Advance"
            rows={3}
            value={formData["Reason for Advance"]}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
            placeholder="Please explain why you need this salary advance"
            required
            minLength={10}
          />
        </div>

        <div className="pt-2 flex justify-between">
          <button
            type="button"
            onClick={() => setView('list')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            View My Applications
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
};

// DashboardHome Component
const DashboardHome = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => (
  <div className="p-8">
    <div className="mb-8">
      <h2 className="text-xl font-light text-gray-800 mb-1">Welcome back</h2>
      <p className="text-sm text-gray-500"></p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <PortalCard 
        icon={<DollarSign className="w-5 h-5 text-gray-600" />}
        title="Salary Advance"
        description="Request salary advance"
        onClick={() => setActiveTab('salary-advance')}
      />
      <PortalCard 
        icon={<FileText className="w-5 h-5 text-gray-600" />}
        title="Loan Application"
        description="Apply for staff loans"
        onClick={() => setActiveTab('loan')}
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

// Main StaffPortal Component
const StaffPortal = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showResetModal, setShowResetModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Password Reset Modal */}
      <PasswordResetModal 
        isOpen={showResetModal} 
        onClose={() => setShowResetModal(false)} 
      />

      <nav className="bg-green-600 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-lg font-light tracking-normal text-white"></span>
            </div>
            <div className="hidden md:flex space-x-1">
              <NavButton 
                icon={<Home size={18} />}
                label="Home"
                active={activeTab === 'home'}
                onClick={() => setActiveTab('home')}
                isDarkHeader={true}
              />
              <NavButton 
                icon={<DollarSign size={18} />}
                label="Salary Advance"
                active={activeTab === 'salary-advance'}
                onClick={() => setActiveTab('salary-advance')}
                isDarkHeader={true}
              />
              <NavButton 
                icon={<FileText size={18} />}
                label="Loans"
                active={activeTab === 'loan'}
                onClick={() => setActiveTab('loan')}
                isDarkHeader={true}
              />
              <NavButton 
                icon={<Calendar size={18} />}
                label="Leave"
                active={activeTab === 'leave'}
                onClick={() => setActiveTab('leave')}
                isDarkHeader={true}
              />
              <NavButton 
                icon={<Calendar size={18} />}
                label="Leave History"
                active={activeTab === 'leave-history'}
                onClick={() => setActiveTab('leave-history')}
                isDarkHeader={true}
              />
              <NavButton 
                icon={<FileSignature size={18} />}
                label="Contracts"
                active={activeTab === 'contract'}
                onClick={() => setActiveTab('contract')}
                isDarkHeader={true}
              />
              <NavButton 
                icon={<UserCog size={18} />}
                label="Profile"
                active={activeTab === 'details'}
                onClick={() => setActiveTab('details')}
                isDarkHeader={true}
              />
              <NavButton 
                icon={<UploadCloud size={18} />}
                label="Documents"
                active={activeTab === 'documents'}
                onClick={() => setActiveTab('documents')}
                isDarkHeader={true}
              />
            </div>
            <div className="flex items-center">
              <UserProfileDropdown onPasswordReset={() => setShowResetModal(true)} />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-8 px-5">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100"
        >
          {activeTab === 'home' && <DashboardHome setActiveTab={setActiveTab} />}
          {activeTab === 'salary-advance' && <SalaryAdvanceForm />}
          {activeTab === 'loan' && <ComingSoon title="Loans" />}
          {activeTab === 'leave' && <LeaveApplicationForm />}
          {activeTab === 'leave-history' && <LeaveApplicationsList />}
          {activeTab === 'contract' && <ComingSoon title="Contracts" />}
          {activeTab === 'details' && <ComingSoon title="Profile" />}
          {activeTab === 'documents' && <ComingSoon title="Documents" />}
        </motion.div>
      </main>
    </div>
  );
};

export default StaffPortal;