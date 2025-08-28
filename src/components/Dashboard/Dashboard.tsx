import React, { useState, useEffect } from "react";
import { Users, CalendarDays, Wallet, NotepadText, Phone, AlertCircle, Settings, HelpCircle, MapPin, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase"
import { TownProps } from '../../types/supabase';

interface AreaTownMapping {
  [area: string]: string[];
}

interface BranchAreaMapping {
  [branch: string]: string;
}

export default function DashboardMain({ selectedTown, onTownChange, selectedRegion }: TownProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showSupportPopup, setShowSupportPopup] = useState(false);
  const [showUnauthorizedPopup, setShowUnauthorizedPopup] = useState(false);
  const [stats, setStats] = useState({
    employees: 0,
    leaveRequests: 0,
    salaryAdvances: 0,
    jobApplications: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>("Initializing...");
  const [currentTown, setCurrentTown] = useState<string>(selectedTown || '');
  const [areaTownMapping, setAreaTownMapping] = useState<AreaTownMapping>({});
  const [branchAreaMapping, setBranchAreaMapping] = useState<BranchAreaMapping>({});
  const [isArea, setIsArea] = useState<boolean>(false);
  const [townsInArea, setTownsInArea] = useState<string[]>([]);
  
  const navigate = useNavigate();

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

  // Fetch data from Supabase with town/area filtering
  useEffect(() => {
    if (currentTown) {
      fetchDashboardData();
    } else {
      setDebugInfo("No town selected");
      setIsLoading(false);
    }
  }, [currentTown, townsInArea, isArea]);

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

  const fetchDashboardData = async () => {
    setIsLoading(true);
    
    if (isArea && townsInArea.length > 0) {
      setDebugInfo(`Fetching data for area "${currentTown}" with towns: ${townsInArea.join(', ')}`);
      await fetchDataForArea();
    } else {
      setDebugInfo(`Fetching data for town: "${currentTown}"`);
      await fetchDataForTown();
    }
  };

  const fetchDataForTown = async () => {
    try {
      // First, let's check if the currentTown exists in the Town column
      let { count: townCount, error: townError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('Town', currentTown);

      // If not found in Town column, check Area column
      let columnToUse = 'Town';
      if ((townCount === 0 || townError) && currentTown !== 'ADMIN_ALL') {
        const { count: areaCount, error: areaError } = await supabase
          .from('employees')
          .select('*', { count: 'exact', head: true })
          .eq('Branch', currentTown);
        
        if (areaCount > 0 && !areaError) {
          columnToUse = 'Branch';
          setDebugInfo(`Using "Area" column for filtering with value: ${currentTown}`);
        } else {
          setDebugInfo(`"${currentTown}" not found in Town or Area columns, showing all data`);
        }
      } else if (currentTown === 'ADMIN_ALL') {
        setDebugInfo(`Admin view: Showing data for all towns`);
      } else {
        setDebugInfo(`Using "Town" column for filtering with value: ${currentTown}`);
      }

      // Fetch employees count
      let employeesQuery = supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });
      
      if (currentTown && currentTown !== 'ADMIN_ALL') {
        employeesQuery = employeesQuery.eq(columnToUse, currentTown);
      }
      
      const { count: employeesCount, error: employeesError } = await employeesQuery;
      
      // Fetch leave requests count - use branch lookup for town
      let leaveRequestsQuery = supabase
        .from('leave_application')
        .select('*', { count: 'exact', head: true });
      
      if (currentTown && currentTown !== 'ADMIN_ALL') {
        // Try to find the branch for this town
        const branchForTown = branchAreaMapping[currentTown] || await getBranchFromTown(currentTown);
        
        if (branchForTown) {
          leaveRequestsQuery = leaveRequestsQuery.eq('Office Branch', branchForTown);
          setDebugInfo(`Using branch "${branchForTown}" for town "${currentTown}" in leave requests`);
        } else {
          // If no branch found, try to match by town name directly
          leaveRequestsQuery = leaveRequestsQuery.ilike('Office Branch', `%${currentTown}%`);
          setDebugInfo(`No branch found for town "${currentTown}", trying direct match`);
        }
      }
      
      const { count: leaveRequestsCount, error: leaveRequestsError } = await leaveRequestsQuery;
      
      // Fetch salary advances count - use branch lookup for town
      let salaryAdvancesQuery = supabase
        .from('salary_advance')
        .select('*', { count: 'exact', head: true });
      
      if (currentTown && currentTown !== 'ADMIN_ALL') {
        // Try to find the branch for this town
        const branchForTown = branchAreaMapping[currentTown] || await getBranchFromTown(currentTown);
        
        if (branchForTown) {
          salaryAdvancesQuery = salaryAdvancesQuery.eq('Office Branch', branchForTown);
          setDebugInfo(`Using branch "${branchForTown}" for town "${currentTown}" in salary advances`);
        } else {
          // If no branch found, try to match by town name directly
          salaryAdvancesQuery = salaryAdvancesQuery.ilike('Office Branch', `%${currentTown}%`);
          setDebugInfo(`No branch found for town "${currentTown}", trying direct match`);
        }
      }
      
      const { count: salaryAdvancesCount, error: salaryAdvancesError } = await salaryAdvancesQuery;
      
      // Fetch expenses count - use branch lookup for town
      let expensesQuery = supabase
        .from('expenses')
        .select('*', { count: 'exact', head: true });
      
      if (currentTown && currentTown !== 'ADMIN_ALL') {
        // Try to find the branch for this town
        const branchForTown = branchAreaMapping[currentTown] || await getBranchFromTown(currentTown);
        
        if (branchForTown) {
          expensesQuery = expensesQuery.eq('branch', branchForTown);
          setDebugInfo(`Using branch "${branchForTown}" for town "${currentTown}" in expenses`);
        } else {
          // If no branch found, try to match by town name directly
          expensesQuery = expensesQuery.ilike('branch', `%${currentTown}%`);
          setDebugInfo(`No branch found for town "${currentTown}", trying direct match`);
        }
      }
      
      const { count: expensesCount, error: expensesError } = await expensesQuery;

      setStats({
        employees: employeesCount || 0,
        leaveRequests: leaveRequestsCount || 0,
        salaryAdvances: salaryAdvancesCount || 0,
        jobApplications: expensesCount || 0
      });

      setDebugInfo(
        `Filtering by: "${currentTown}" | ` +
        `Employees: ${employeesCount} | ` +
        `Leaves: ${leaveRequestsCount} | ` +
        `Advances: ${salaryAdvancesCount} | ` +
        `Expenses: ${expensesCount}`
      );
    } catch (error) {
      console.error("Error in fetchDataForTown:", error);
      setDebugInfo(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDataForArea = async () => {
    try {
      // Fetch employees count for all towns in the area
      let employeesQuery = supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });
      
      if (currentTown !== 'ADMIN_ALL') {
        employeesQuery = employeesQuery.in('Town', townsInArea);
      }
      
      const { count: employeesCount, error: employeesError } = await employeesQuery;
      
      // For leave requests, salary advances, and expenses, we need to get branches for all towns in the area
      let branchesForArea: string[] = [];
      
      if (currentTown !== 'ADMIN_ALL') {
        // Get unique branches for all towns in the area
        const branchPromises = townsInArea.map(async (town) => {
          return branchAreaMapping[town] || await getBranchFromTown(town);
        });
        
        const branches = await Promise.all(branchPromises);
        branchesForArea = branches.filter(branch => branch !== null) as string[];
        
        // Remove duplicates
        branchesForArea = [...new Set(branchesForArea)];
        
        setDebugInfo(`Found branches for area: ${branchesForArea.join(', ')}`);
      }
      
      // Fetch leave requests count for all branches in the area
      let leaveRequestsQuery = supabase
        .from('leave_application')
        .select('*', { count: 'exact', head: true });
      
      if (currentTown !== 'ADMIN_ALL' && branchesForArea.length > 0) {
        leaveRequestsQuery = leaveRequestsQuery.in('Office Branch', branchesForArea);
      }
      
      const { count: leaveRequestsCount, error: leaveRequestsError } = await leaveRequestsQuery;
      
      // Fetch salary advances count for all branches in the area
      let salaryAdvancesQuery = supabase
        .from('salary_advance')
        .select('*', { count: 'exact', head: true });
      
      if (currentTown !== 'ADMIN_ALL' && branchesForArea.length > 0) {
        salaryAdvancesQuery = salaryAdvancesQuery.in('Office Branch', branchesForArea);
      }
      
      const { count: salaryAdvancesCount, error: salaryAdvancesError } = await salaryAdvancesQuery;
      
      // Fetch expenses count for all branches in the area
      let expensesQuery = supabase
        .from('expenses')
        .select('*', { count: 'exact', head: true });
      
      if (currentTown !== 'ADMIN_ALL' && branchesForArea.length > 0) {
        expensesQuery = expensesQuery.in('branch', branchesForArea);
      }
      
      const { count: expensesCount, error: expensesError } = await expensesQuery;

      setStats({
        employees: employeesCount || 0,
        leaveRequests: leaveRequestsCount || 0,
        salaryAdvances: salaryAdvancesCount || 0,
        jobApplications: expensesCount || 0
      });

      setDebugInfo(
        `Filtering by area: "${currentTown}" (${townsInArea.length} towns, ${branchesForArea.length} branches) | ` +
        `Employees: ${employeesCount} | ` +
        `Leaves: ${leaveRequestsCount} | ` +
        `Advances: ${salaryAdvancesCount} | ` +
        `Expenses: ${expensesCount}`
      );
    } catch (error) {
      console.error("Error in fetchDataForArea:", error);
      setDebugInfo(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsClick = () => {
    const hasAccess = checkUserAccess();
    
    if (hasAccess) {
      navigate("/settings");
    } else {
      setShowUnauthorizedPopup(true);
      setTimeout(() => setShowUnauthorizedPopup(false), 3000);
    }
  };

  const checkUserAccess = () => {
    return false;
  };

  const handleSupportClick = () => {
    setShowSupportPopup(true);
    setTimeout(() => setShowSupportPopup(false), 5000);
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Get town/area display name
  const getDisplayName = () => {
    if (!currentTown) return "All Towns";
    if (currentTown === 'ADMIN_ALL') return "All Towns";
    
    if (isArea) {
      return `${currentTown} Region`;
    }
    
    return currentTown;
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <style jsx global>{`
        @keyframes wave {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(5deg); }
          50% { transform: rotate(0deg); }
          75% { transform: rotate(-5deg); }
          100% { transform: rotate(0deg); }
        }
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

      {/* Welcome Section with Town/Area Filter Indicator */}
      <div className="mb-8 relative">
        <div className="bg-white rounded-2xl p-6 relative overflow-hidden card-hover glow-effect">
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
                      {getDisplayName()}
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
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="px-4 py-2 bg-white rounded-xl text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center"
                >
                  <RefreshCw className={`w-4 h-4 inline mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
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
        </div>
      </div>

      {/* Debug Info */}
      

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {/* Stats Grid with Hover Effects */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Employee Card */}
            <div className="bg-white rounded-2xl p-6 card-hover relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-100 rounded-full -mr-4 -mt-4 opacity-20"></div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Employees</p>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{stats.employees}</h3>
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

            {/* Expenses Card */}
            <div className="bg-white rounded-2xl p-6 card-hover relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-green-100 rounded-full -mr-4 -mt-4 opacity-20"></div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Expenses</p>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{stats.jobApplications}</h3>
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
        </>
      )}
    </div>
  );
}