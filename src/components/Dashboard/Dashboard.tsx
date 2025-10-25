import React, { useState, useEffect } from "react";
import { Users, CalendarDays, Wallet, NotepadText, Phone, AlertCircle, Settings, HelpCircle, MapPin, RefreshCw, Cake, Video, BookOpen, FileText, TrendingUp, ChevronRight, Crown, Trophy, Star, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase"
import { TownProps } from '../../types/supabase';

interface AreaTownMapping {
  [area: string]: string[];
}

interface BranchAreaMapping {
  [branch: string]: string;
}

interface NewsItem {
  id: number;
  type: 'birthday' | 'conference' | 'training' | 'payslip' | 'report';
  title: string;
  description: string;
  date: string;
  time?: string;
  participants?: string;
}

interface TopPerformer {
  id: number;
  name: string;
  position: string;
  branch: string;
  performance: number;
  avatar?: string;
  isOverall?: boolean;
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
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  
  const navigate = useNavigate();

  // Mock news data - replace with actual API calls
  useEffect(() => {
    const mockNews: NewsItem[] = [
      {
        id: 1,
        type: 'birthday',
        title: 'Upcoming Birthdays',
        description: 'John Doe, Sarah Smith, and 3 others have birthdays this week',
        date: 'This week'
      },
      {
        id: 2,
        type: 'conference',
        title: 'Quarterly Review Meeting',
        description: 'All managers required to attend the virtual conference',
        date: 'Tomorrow',
        time: '10:00 AM'
      },
      {
        id: 3,
        type: 'training',
        title: 'New Safety Training',
        description: 'Mandatory training session for all employees',
        date: 'Next Monday',
        time: '2:00 PM'
      },
      {
        id: 4,
        type: 'payslip',
        title: 'Payslips Available',
        description: 'March payroll processed and available for download',
        date: 'Available now'
      },
      {
        id: 5,
        type: 'report',
        title: 'Performance Reports',
        description: 'Q1 performance reports are ready for review',
        date: 'New'
      }
    ];
    setNewsItems(mockNews);
  }, []);

  // Mock top performers data - replace with actual API calls
  useEffect(() => {
    const mockTopPerformers: TopPerformer[] = [
      {
        id: 1,
        name: "Sarah Johnson",
        position: "Sales Manager",
        branch: "Nairobi Central",
        performance: 98,
        isOverall: true
      },
      {
        id: 2,
        name: "Michael Chen",
        position: "Operations Lead",
        branch: "Mombasa Branch",
        performance: 95
      },
      {
        id: 3,
        name: "Grace Wanjiku",
        position: "Customer Service",
        branch: "Kisumu Office",
        performance: 92
      },
      {
        id: 4,
        name: "David Omondi",
        position: "IT Specialist",
        branch: "Nairobi West",
        performance: 90
      },
      {
        id: 5,
        name: "Emily Atieno",
        position: "Marketing Head",
        branch: "Eldoret Branch",
        performance: 88
      }
    ];
    setTopPerformers(mockTopPerformers);
  }, []);

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

  // Get icon for news type
  const getNewsIcon = (type: NewsItem['type']) => {
    switch (type) {
      case 'birthday': return <Cake className="w-4 h-4" />;
      case 'conference': return <Video className="w-4 h-4" />;
      case 'training': return <BookOpen className="w-4 h-4" />;
      case 'payslip': return <FileText className="w-4 h-4" />;
      case 'report': return <TrendingUp className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Get background color for news type
  const getNewsBgColor = (type: NewsItem['type']) => {
    switch (type) {
      case 'birthday': return 'bg-pink-50';
      case 'conference': return 'bg-blue-50';
      case 'training': return 'bg-green-50';
      case 'payslip': return 'bg-purple-50';
      case 'report': return 'bg-orange-50';
      default: return 'bg-gray-50';
    }
  };

  // Get text color for news type
  const getNewsTextColor = (type: NewsItem['type']) => {
    switch (type) {
      case 'birthday': return 'text-pink-600';
      case 'conference': return 'text-blue-600';
      case 'training': return 'text-green-600';
      case 'payslip': return 'text-purple-600';
      case 'report': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  // Get performance color based on score
  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-gray-600';
  };

  // Get performance badge color
  const getPerformanceBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-700';
    if (score >= 80) return 'bg-blue-100 text-blue-700';
    if (score >= 70) return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-700';
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
          transition: box-shadow 0.3s ease;
          border: 0.5px solid rgba(0, 0, 0, 0.08);
        }
        .card-hover {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
        }
        .popup {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 16px;
          border-radius: 8px;
          color: white;
          z-index: 1000;
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
        @keyframes pulse-gold {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .pulse-gold { animation: pulse-gold 2s ease-in-out infinite; }
      `}</style>

      {/* Popup Messages */}
      {showUnauthorizedPopup && (
        <div className="popup unauthorized-popup">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span className="text-sm">Unauthorized access</span>
          </div>
        </div>
      )}
      
      {showSupportPopup && (
        <div className="popup support-popup">
          <div className="flex items-center">
            <Phone className="w-4 h-4 mr-2" />
            <span className="text-sm">Support: 0700594586</span>
          </div>
        </div>
      )}

      {/* Welcome Section with Faint Gradient Background */}
      <div className="mb-8">
        <div className="rounded-xl p-6 relative overflow-hidden card-hover glow-effect bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/60">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full -ml-12 -mb-12"></div>
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-gradient-to-r from-indigo-100/10 to-blue-100/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="mb-4 md:mb-0 flex items-center">
                <img
                  src="/vector.png" 
                  alt="Decorative illustration"
                  className="h-20 w-20 object-cover mr-4"
                />
                <div>
                  <h1 className="text-xl font-semibold text-gray-800 mb-1">Welcome back</h1>
                  <p className="text-xs text-gray-600">
                    Latest updates for{" "}
                    <span className="font-medium text-indigo-600 flex items-center mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {getDisplayName()}
                    </span>
                  </p>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex space-x-2">
                <button 
                  onClick={handleSupportClick}
                  className="px-3 py-2 bg-white/80 backdrop-blur-sm rounded-lg text-xs font-medium text-gray-600 hover:bg-white transition-colors border border-gray-200/60"
                >
                  <HelpCircle className="w-3 h-3 inline mr-1" />
                  Support
                </button>
                <button 
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="px-3 py-2 bg-white/80 backdrop-blur-sm rounded-lg text-xs font-medium text-gray-600 hover:bg-white transition-colors border border-gray-200/60 flex items-center"
                >
                  <RefreshCw className={`w-3 h-3 inline mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button 
                  onClick={handleSettingsClick}
                  className="px-3 py-2 bg-indigo-600 rounded-lg text-xs font-medium text-white hover:bg-indigo-700 transition-colors flex items-center shadow-sm"
                >
                  <Settings className="w-3 h-3 inline mr-1" />
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <div className="mb-6">
        <div className="flex space-x-6 border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-1 font-medium text-sm ${activeTab === 'overview' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Overview
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Best Performing Employees Board FIRST */}
          <div className="lg:col-span-2">
            {/* Best Performing Employees Board */}
            <div className="bg-white rounded-xl p-5 card-hover glow-effect mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Crown className="w-5 h-5 text-yellow-500 mr-2 pulse-gold" />
                  <h2 className="text-lg font-semibold text-gray-800">Best Performing Employees</h2>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {topPerformers.length} top performers
                </span>
              </div>
              
              <div className="space-y-3">
                {topPerformers.map((employee, index) => (
                  <div 
                    key={employee.id}
                    className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer group relative"
                  >
                    {employee.isOverall && (
                      <div className="absolute -top-2 -left-2">
                        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-normal px-2 py-1 rounded-full flex items-center shadow-lg">
                          <Trophy className="w-3 h-3 mr-1" />
                          Overall Best
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-3">
                      {/* Rank Badge */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                        index === 1 ? 'bg-gray-100 text-gray-700' : 
                        index === 2 ? 'bg-orange-100 text-orange-700' : 
                        'bg-blue-100 text-blue-700'
                      }`}>
                        <span className="text-xs font-bold">#{index + 1}</span>
                      </div>
                      
                      {/* Employee Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-gray-800 flex items-center">
                              {employee.name}
                              {employee.isOverall && (
                                <Crown className="w-3 h-3 text-yellow-500 ml-1" />
                              )}
                            </h3>
                            <p className="text-xs text-gray-600">{employee.position}</p>
                          </div>
                          <div className={`text-xs font-semibold px-2 py-1 rounded-full ${getPerformanceBadgeColor(employee.performance)}`}>
                            {employee.performance}%
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {employee.branch}
                          </span>
                          <div className="flex items-center space-x-1">
                            {employee.performance >= 90 && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                            {employee.performance >= 95 && <Award className="w-3 h-3 text-purple-500" />}
                            <ChevronRight className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Performance Bar */}
                    <div className="mt-2 w-full bg-gray-100 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full ${
                          employee.performance >= 90 ? 'bg-green-500' : 
                          employee.performance >= 80 ? 'bg-blue-500' : 
                          employee.performance >= 70 ? 'bg-yellow-500' : 
                          'bg-gray-500'
                        }`}
                        style={{width: `${employee.performance}%`}}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="w-full text-xs text-indigo-600 hover:text-indigo-700 font-medium py-2 hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  View Full Performance Report
                </button>
              </div>
            </div>

            {/* Stats Cards - NOW AFTER the performance board */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Employee Card */}
              <div className="bg-white rounded-xl p-5 card-hover glow-effect">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1 font-medium">Total Employees</p>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-3">{stats.employees}</h3>
                  </div>
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-indigo-600" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>Active</span>
                    <span>{Math.floor(stats.employees * 0.96)}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1">
                    <div className="bg-indigo-500 h-1 rounded-full" style={{width: '96%'}}></div>
                  </div>
                </div>
              </div>

              {/* Leave Requests Card */}
              <div className="bg-white rounded-xl p-5 card-hover glow-effect">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1 font-medium">Leave Requests</p>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-3">{stats.leaveRequests}</h3>
                  </div>
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <CalendarDays className="w-4 h-4 text-indigo-600" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>Pending</span>
                    <span>{Math.ceil(stats.leaveRequests * 0.11)}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1">
                    <div className="bg-indigo-500 h-1 rounded-full" style={{width: '89%'}}></div>
                  </div>
                </div>
              </div>

              {/* Advances Card */}
              <div className="bg-white rounded-xl p-5 card-hover glow-effect">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1 font-medium">Salary Advances</p>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-3">{stats.salaryAdvances}</h3>
                  </div>
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-indigo-600" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>Approved</span>
                    <span>{Math.floor(stats.salaryAdvances * 0.88)}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1">
                    <div className="bg-indigo-500 h-1 rounded-full" style={{width: '88%'}}></div>
                  </div>
                </div>
              </div>

              {/* Expenses Card */}
              <div className="bg-white rounded-xl p-5 card-hover glow-effect">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1 font-medium">Expenses</p>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-3">{stats.jobApplications}</h3>
                  </div>
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <NotepadText className="w-4 h-4 text-indigo-600" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>This cycle</span>
                    <span>100%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1">
                    <div className="bg-indigo-500 h-1 rounded-full w-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - News Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-5 card-hover glow-effect">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Updates & News</h2>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {newsItems.length} items
                </span>
              </div>
              
              <div className="space-y-4">
                {newsItems.map((item) => (
                  <div 
                    key={item.id}
                    className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getNewsBgColor(item.type)}`}>
                        <span className={getNewsTextColor(item.type)}>
                          {getNewsIcon(item.type)}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h3 className="text-sm font-medium text-gray-800 truncate">
                            {item.title}
                          </h3>
                          <ChevronRight className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                        </div>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">{item.date}</span>
                          {item.time && (
                            <span className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                              {item.time}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="w-full text-xs text-indigo-600 hover:text-indigo-700 font-medium py-2 hover:bg-indigo-50 rounded-lg transition-colors">
                  View All Updates
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}