import { useState } from 'react';
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
  LogOut
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

// UserProfileDropdown Component
const UserProfileDropdown = () => {
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

// DashboardHome Component
const DashboardHome = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => (
  <div className="p-8">
    <div className="mb-8">
      <h2 className="text-xl font-light text-gray-800 mb-1">Welcome back</h2>
      <p className="text-sm text-gray-500"></p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [branchLocation, setBranchLocation] = useState('');
  const [leaveType, setLeaveType] = useState('annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Leave application submitted successfully');
  };

  return (
    <div className="p-8 shadow-lg">
      <div className="mb-6 pb-6 ">
        <h2 className="text-lg font-medium text-gray-900">Leave Application</h2>
        <p className="text-xs text-green-500 mt-1">Staff members accrue two leave days each calendar month.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 tracking-normal">Employee Number</label>
            <input
              type="text"
              value={employeeNumber}
              onChange={(e) => setEmployeeNumber(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
              required
              placeholder="Enter your employee number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 tracking-normal">Branch Office Location</label>
            <select
              value={branchLocation}
              onChange={(e) => setBranchLocation(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
              required
            >
              <option value="">Select branch location</option>
              <option value="nairobi">Nairobi Head Office</option>
              <option value="mombasa">Mombasa Branch</option>
              <option value="kisumu">Kisumu Branch</option>
              <option value="eldoret">Eldoret Branch</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 tracking-normal">Leave Type</label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
          >
            <option value="annual">Annual Leave</option>
            <option value="sick">Sick Leave</option>
            <option value="maternity">Maternity Leave</option>
            <option value="paternity">Paternity Leave</option>
            <option value="compassionate">Compassionate Leave</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 tracking-normal">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 tracking-normal">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 tracking-normal">Reason</label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
            placeholder="Please provide details for your leave request"
            required
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2.5 px-4 rounded text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Submit Application
          </button>
        </div>
      </form>
    </div>
  );
};

// Main StaffPortal Component
const StaffPortal = () => {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-green-600 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-lg font-light tracking-normal text-white">STAFF PORTAL</span>
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
              <UserProfileDropdown />
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
          {activeTab === 'loan' && <ComingSoon title="Loans" />}
          {activeTab === 'leave' && <LeaveApplicationForm />}
          {activeTab === 'contract' && <ComingSoon title="Contracts" />}
          {activeTab === 'details' && <ComingSoon title="Profile" />}
          {activeTab === 'documents' && <ComingSoon title="Documents" />}
        </motion.div>
      </main>
    </div>
  );
};

export default StaffPortal;