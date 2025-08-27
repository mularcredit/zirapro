import React, { useState, useEffect } from "react";
import { Users, DollarSign, CreditCard, UserRound, CalendarDays, NotepadText, BellDot, Blocks, Wallet, Phone, TrendingUp, HelpCircle, Calendar, CheckCircle, Clock, AlertCircle, ChevronRight, Zap, BarChart2, PieChart, Settings, FileText, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase"
import { TownProps } from '../../types/supabase';

export default function DashboardMain({ selectedTown, selectedRegion }: TownProps) {
  const [phoneNumber, setPhoneNumber] = useState("+254");
  const [activeTab, setActiveTab] = useState("overview");
  const [showSupportPopup, setShowSupportPopup] = useState(false);
  const [showUnauthorizedPopup, setShowUnauthorizedPopup] = useState(false);
  const [stats, setStats] = useState({
    employees: 0,
    leaveRequests: 0,
    salaryAdvances: 0,
    jobApplications: 0
  });
  
  const navigate = useNavigate();

  // Fetch data from Supabase with town filtering
  useEffect(() => {
    fetchDashboardData();
  }, [selectedTown,selectedRegion]); // A
  // dd selectedTown as 
  
  

  const fetchDashboardData = async () => {
    try {
      // Fetch employees count with town filter
      let employeesQuery = supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });
      
      if (selectedTown && selectedTown !== 'ADMIN_ALL') {
        employeesQuery = employeesQuery.eq('Town', selectedTown);
      }
        if (selectedRegion && selectedRegion !== 'All Regions') {
        employeesQuery = employeesQuery.eq('Area', selectedRegion);
      }
      
      const { count: employeesCount, error: employeesError } = await employeesQuery;
      
      // Fetch leave requests count
      let leaveRequestsQuery = supabase
        .from('leave_application')
        .select('*', { count: 'exact', head: true });
      
  
      if (selectedTown && selectedTown !== 'ADMIN_ALL') {
        leaveRequestsQuery = leaveRequestsQuery.eq('Office Branch', selectedTown);
      }
      
      const { count: leaveRequestsCount, error: leaveRequestsError } = await leaveRequestsQuery;
      
      // Fetch salary advances count
      let salaryAdvancesQuery = supabase
        .from('salary_advance')
        .select('*', { count: 'exact', head: true });
      
      // If you have town filtering for salary advances, add it here
     if (selectedTown && selectedTown !== 'ADMIN_ALL') {
         salaryAdvancesQuery = salaryAdvancesQuery.eq('Office Branch', selectedTown);
       }
      
      const { count: salaryAdvancesCount, error: salaryAdvancesError } = await salaryAdvancesQuery;
      
      // Fetch job applications count
      let jobApplicationsQuery = supabase
        .from('expenses')
        .select('*', { count: 'exact', head: true });
      
      // If you have town filtering for job applications, add it here
       if (selectedTown && selectedTown !== 'ADMIN_ALL') {
         jobApplicationsQuery = jobApplicationsQuery.eq('branch', selectedTown);
       }
      
      const { count: jobApplicationsCount, error: jobApplicationsError } = await jobApplicationsQuery;

      if (employeesError || leaveRequestsError || salaryAdvancesError || jobApplicationsError) {
        console.error("Error fetching data:", {
          employeesError,
          leaveRequestsError,
          salaryAdvancesError,
          jobApplicationsError
        });
        return;
      }

      setStats({
        employees: employeesCount || 0,
        leaveRequests: leaveRequestsCount || 0,
        salaryAdvances: salaryAdvancesCount || 0,
        jobApplications: jobApplicationsCount || 0
      });
    } catch (error) {
      console.error("Error in fetchDashboardData:", error);
    }
  };

  const handleSettingsClick = () => {
    // Check if user has access (you'll need to implement your own access control logic)
    const hasAccess = checkUserAccess(); // Implement this function based on your auth system
    
    if (hasAccess) {
      navigate("/settings");
    } else {
      setShowUnauthorizedPopup(true);
      // Auto-hide the popup after 3 seconds
      setTimeout(() => setShowUnauthorizedPopup(false), 3000);
    }
  };

  const checkUserAccess = () => {
    // Implement your access control logic here
    // This is a placeholder - you'll need to check against your user roles/permissions
    return false; // For demonstration, always return false to show the popup
  };

  const handleSupportClick = () => {
    setShowSupportPopup(true);
    // Auto-hide the popup after 5 seconds
    setTimeout(() => setShowSupportPopup(false), 5000);
  };

  // Get town display name
  const getTownDisplayName = () => {
    if (!selectedTown) return "All Towns";
    if (selectedTown === 'ADMIN_ALL') return "All Towns";
    return selectedTown;
  };

  return (
    <div className="min-h-screen p-6">
      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes wave {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(5deg); }
          50% { transform: rotate(0deg); }
          75% { transform: rotate(-5deg); }
          100% { transform: rotate(0deg); }
        }
        .float-animation { animation: float 4s ease-in-out infinite; }
        .pulse-animation { animation: pulse 3s ease-in-out infinite; }
        .wave-animation { animation: wave 8s ease-in-out infinite; }
        .glow-effect {
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
          transition: box-shadow 0.3s ease;
        }
        .glow-effect:hover {
          box-shadow: 0 0 25px rgba(99, 102, 241, 0.5);
        }
        .card-hover {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        .popup {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 16px;
          border-radius: 8px;
          color: white;
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .unauthorized-popup {
          background-color: #ef4444;
        }
        .support-popup {
          background-color: #10b981;
        }
      `}</style>

      {/* Popup Messages */}
      {showUnauthorizedPopup && (
        <div className="popup unauthorized-popup">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>Unauthorized access</span>
          </div>
        </div>
      )}
      
      {showSupportPopup && (
        <div className="popup support-popup">
          <div className="flex items-center">
            <Phone className="w-5 h-5 mr-2" />
            <span>Support: 0700594586</span>
          </div>
        </div>
      )}

      {/* Welcome Section with Town Filter Indicator */}
      <div className="mb-8 relative">
        <div className="bg-white rounded-2xl p-6 relative overflow-hidden card-hover glow-effect">
          {/* Floating gradient circles - smaller */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full -ml-10 -mb-10"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="mb-4 md:mb-0 flex items-center">
                <img
                  src="/vector.png" 
                  alt="Decorative illustration"
                  className="h-20 w-20 object-cover mr-4"
                />
                <div>
                  <h1 className="text-xl font-bold text-gray-800 mb-1">Welcome back<span className="wave-animation">👋</span></h1>
                  <p className="text-sm text-gray-600 max-w-md">
                    Your dashboard is ready with the latest updates for{" "}
                    <span className="font-medium text-indigo-600 flex items-center mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      {getTownDisplayName()}
                    </span>
                  </p>
                </div>
              </div>
              
              {/* Compact stats card */}
              <div className="flex space-x-2">
                <button 
                  onClick={handleSupportClick}
                  className="px-4 py-2 bg-white rounded-xl text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <HelpCircle className="w-4 h-4 inline mr-2" />
                  Support
                </button>
                <button 
                  onClick={handleSettingsClick}
                  className="px-4 py-2 bg-indigo-600 rounded-xl text-sm font-medium text-white hover:bg-indigo-700 transition-colors flex items-center"
                >
                  <Settings className="w-4 h-4 inline mr-2" />
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <div className="mb-6">
        <div className="flex space-x-4 border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-1 font-medium text-sm ${activeTab === 'overview' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('payroll')}
            className={`pb-3 px-1 font-medium text-sm ${activeTab === 'payroll' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            
          </button>
          <button 
            onClick={() => setActiveTab('loans')}
            className={`pb-3 px-1 font-medium text-sm ${activeTab === 'loans' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`pb-3 px-1 font-medium text-sm ${activeTab === 'reports' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            
          </button>
        </div>
      </div>

      {/* Stats Grid with Hover Effects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Employee Card */}
        <div className="bg-white rounded-2xl p-6 card-hover relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-100 rounded-full -mr-4 -mt-4 opacity-20"></div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Employees</p>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{stats.employees}</h3>
              <div className="flex items-center text-sm text-green-600"></div>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Active</span>
              <span>{Math.floor(stats.employees * 0.96)}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-indigo-600 h-2 rounded-full" style={{width: '96%'}}></div>
            </div>
          </div>
        </div>

        {/* Leave Requests Card */}
        <div className="bg-white rounded-2xl p-6 card-hover relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-100 rounded-full -mr-4 -mt-4 opacity-20"></div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Leave Requests</p>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{stats.leaveRequests}</h3>
              <div className="flex items-center text-sm text-blue-600"></div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Pending</span>
              <span>{Math.ceil(stats.leaveRequests * 0.11)}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{width: '89%'}}></div>
            </div>
          </div>
        </div>

        {/* Advances Card */}
        <div className="bg-white rounded-2xl p-6 card-hover relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-full -mr-4 -mt-4 opacity-20"></div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Salary Advances</p>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{stats.salaryAdvances}</h3>
              <div className="flex items-center text-sm text-orange-600"></div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Approved</span>
              <span>{Math.floor(stats.salaryAdvances * 0.88)}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{width: '88%'}}></div>
            </div>
          </div>
        </div>

        {/* Job Applications Card */}
        <div className="bg-white rounded-2xl p-6 card-hover relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-green-100 rounded-full -mr-4 -mt-4 opacity-20"></div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Expenses</p>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{stats.jobApplications}</h3>
              <div className="flex items-center text-sm text-purple-600"></div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <NotepadText className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>This cycle</span>
              <span>100%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}