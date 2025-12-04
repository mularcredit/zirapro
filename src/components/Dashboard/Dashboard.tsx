import React, { useState, useEffect } from "react";
import { Users, CalendarDays, Wallet, NotepadText, Phone, AlertCircle, Settings, HelpCircle, MapPin, RefreshCw, Cake, Video, BookOpen, FileText, TrendingUp, ChevronRight, Crown, Trophy, Star, Award, Send, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase"
import { TownProps } from '../../types/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

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
  description?: string;
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
  const [darkMode, setDarkMode] = useState(true);
  const [isNewsLoading, setIsNewsLoading] = useState(true);
  const [isSendingBirthdaySMS, setIsSendingBirthdaySMS] = useState(false);
  
  const navigate = useNavigate();

  // Phone formatting function for SMS
  const formatPhoneNumberForSMS = (phone: string): string => {
    if (!phone) return '';
    
    let cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      cleaned = '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('7') && cleaned.length === 9) {
      cleaned = '254' + cleaned;
    } else if (cleaned.startsWith('254') && cleaned.length === 12) {
      // Keep as is
    } else if (cleaned.startsWith('+254') && cleaned.length === 13) {
      cleaned = cleaned.substring(1);
    }
    
    if (cleaned.length === 12 && cleaned.startsWith('254')) {
      return cleaned;
    }
    
    return '';
  };

  // Send birthday SMS function
  const sendBirthdaySMS = async (employeeName: string, phoneNumber: string) => {
    try {
      const formattedPhone = formatPhoneNumberForSMS(phoneNumber);
      
      if (!formattedPhone) {
        throw new Error(`Invalid phone number: ${phoneNumber}`);
      }

      const birthdayMessage = `Happy Birthday ${employeeName}! 🎉 Wishing you a fantastic year ahead from Mular Credit Team`;
      const apiKey = '17323514aa8ce2613e358ee029e65d99';
      const partnerID = '928';
      const shortcode = 'MularCredit';
      const encodedMessage = encodeURIComponent(birthdayMessage);
      
      const url = `https://isms.celcomafrica.com/api/services/sendsms/?apikey=${apiKey}&partnerID=${partnerID}&message=${encodedMessage}&shortcode=${shortcode}&mobile=${formattedPhone}`;
      
      console.log('Sending birthday SMS to:', formattedPhone);
      
      await fetch(url, {
        method: 'GET',
        mode: 'no-cors'
      });
      
      // Log to database
      await supabase.from('sms_logs').insert({
        recipient_phone: formattedPhone,
        message: birthdayMessage,
        status: 'sent',
        sender_id: shortcode,
        created_at: new Date().toISOString()
      });
      
      return { success: true, message: 'SMS sent successfully' };
      
    } catch (error) {
      console.error('SMS Error:', error);
      return { success: false, error: error.message };
    }
  };

  // Send birthday SMS to all today's birthdays
  const sendAllBirthdaySMS = async () => {
    setIsSendingBirthdaySMS(true);
    
    try {
      // Find birthday employees
      const { data: employees } = await supabase
        .from('employees')
        .select('"First Name", "Last Name", "Mobile Number", "Personal Mobile", "Work Mobile", "Date of Birth"')
        .not('Date of Birth', 'is', null);

      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentDay = today.getDate();
      
      const birthdayEmployees = employees?.filter(emp => {
        if (!emp['Date of Birth']) return false;
        try {
          const birthDate = new Date(emp['Date of Birth']);
          return birthDate.getMonth() + 1 === currentMonth && 
                 birthDate.getDate() === currentDay;
        } catch (e) {
          return false;
        }
      }).map(emp => {
        const rawPhone = emp['Mobile Number'] || emp['Personal Mobile'] || emp['Work Mobile'] || '';
        const phone = formatPhoneNumberForSMS(rawPhone);
        const fullName = `${emp['First Name'] || ''} ${emp['Last Name'] || ''}`.trim();
        
        return { name: fullName, phone: phone };
      }).filter(emp => emp.phone && emp.phone.length === 12 && emp.phone.startsWith('254'));
      
      if (!birthdayEmployees || birthdayEmployees.length === 0) {
        toast.error('No birthdays with valid phone numbers today');
        setIsSendingBirthdaySMS(false);
        return;
      }

      let successCount = 0;
      let failCount = 0;
      
      for (let i = 0; i < birthdayEmployees.length; i++) {
        const employee = birthdayEmployees[i];
        
        try {
          const result = await sendBirthdaySMS(employee.name, employee.phone);
          
          if (result.success) {
            successCount++;
            toast.success(`Sent to ${employee.name}`, { duration: 1500 });
          } else {
            failCount++;
          }
          
          // Wait between SMS
          if (i < birthdayEmployees.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          failCount++;
        }
      }
      
      if (successCount > 0) {
        toast.success(`🎉 Sent ${successCount} birthday SMS successfully!`);
      }
      if (failCount > 0) {
        toast.error(`Failed to send ${failCount} SMS`);
      }
      
    } catch (error) {
      toast.error('Error sending birthday SMS');
      console.error(error);
    } finally {
      setIsSendingBirthdaySMS(false);
      // Refresh news
      fetchBirthdayNews();
    }
  };

  // Fetch birthday news from employees table
  const fetchBirthdayNews = async () => {
    setIsNewsLoading(true);
    try {
      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentDay = today.getDate();
      
      const { data: employees, error } = await supabase
        .from('employees')
        .select('"First Name", "Last Name", "Mobile Number", "Date of Birth", Town, Branch');

      if (error) {
        console.error('Error fetching employees for birthdays:', error);
        return;
      }

      // Filter employees with birthdays today
      const todaysBirthdays = employees?.filter(employee => {
        if (!employee['Date of Birth']) return false;
        
        try {
          const birthDate = new Date(employee['Date of Birth']);
          const birthMonth = birthDate.getMonth() + 1;
          const birthDay = birthDate.getDate();
          
          return birthMonth === currentMonth && birthDay === currentDay;
        } catch (e) {
          return false;
        }
      }) || [];

      // Create birthday news item
      const birthdayNewsItem: NewsItem = {
        id: 1,
        type: 'birthday',
        title: 'Today\'s Birthdays',
        description: todaysBirthdays.length > 0 
          ? `${todaysBirthdays.slice(0, 3).map(emp => `${emp['First Name']} ${emp['Last Name']}`).join(', ')}${todaysBirthdays.length > 3 ? ` and ${todaysBirthdays.length - 3} others` : ''}`
          : 'No birthdays today',
        date: 'Today',
        time: 'All day'
      };

      // Check for upcoming birthdays (next 7 days)
      const upcomingBirthdays = employees?.filter(employee => {
        if (!employee['Date of Birth']) return false;
        
        try {
          const birthDate = new Date(employee['Date of Birth']);
          const nextWeek = new Date();
          nextWeek.setDate(today.getDate() + 7);
          
          const birthDateThisYear = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
          
          return birthDateThisYear > today && birthDateThisYear <= nextWeek;
        } catch (e) {
          return false;
        }
      }) || [];

      const upcomingNewsItem: NewsItem = {
        id: 2,
        type: 'birthday',
        title: 'Upcoming Birthdays',
        description: upcomingBirthdays.length > 0 
          ? `${upcomingBirthdays.length} employees have birthdays next week`
          : 'No upcoming birthdays',
        date: 'Next week'
      };

      // Other static news items
      const otherNewsItems: NewsItem[] = [
        {
          id: 3,
          type: 'conference',
          title: 'Quarterly Review Meeting',
          description: 'All managers required to attend the virtual conference',
          date: 'Tomorrow',
          time: '10:00 AM'
        },
        {
          id: 4,
          type: 'training',
          title: 'New Safety Training',
          description: 'Mandatory training session for all employees',
          date: 'Next Monday',
          time: '2:00 PM'
        },
        {
          id: 5,
          type: 'payslip',
          title: 'Payslips Available',
          description: 'March payroll processed and available for download',
          date: 'Available now'
        }
      ];

      setNewsItems([birthdayNewsItem, upcomingNewsItem, ...otherNewsItems]);

    } catch (error) {
      console.error('Error in fetchBirthdayNews:', error);
    } finally {
      setIsNewsLoading(false);
    }
  };

  // Mock top performers data
  useEffect(() => {
    const mockTopPerformers: TopPerformer[] = [
      {
        id: 1,
        name: "Sarah Wanjiku",
        position: "Relationship Officer",
        branch: "Nairobi",
        performance: 98,
        isOverall: true
      },
      {
        id: 2,
        name: "Michael Wanyama",
        position: "Relationship Officer",
        branch: "Mombasa",
        performance: 95
      },
      {
        id: 3,
        name: "Grace Wanjiku",
        position: "Relationship Officer",
        branch: "Kisumu",
        performance: 92
      },
      {
        id: 4,
        name: "David Omondi",
        position: "Relationship Officer",
        branch: "Nairobi",
        performance: 90
      },
      {
        id: 5,
        name: "Emily Chebet",
        position: "Relationship Officer",
        branch: "Eldoret",
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

  // Load news when component mounts
  useEffect(() => {
    fetchBirthdayNews();
  }, []);

  // Fetch ALL data for dashboard
  const fetchDashboardData = async () => {
    setIsLoading(true);
    console.log('🔍 Fetching data for:', currentTown);
    
    try {
      // If ADMIN_ALL or no town selected, fetch all data
      if (currentTown === 'ADMIN_ALL' || !currentTown) {
        await fetchAllData();
      } else if (isArea && townsInArea.length > 0) {
        await fetchDataForArea();
      } else {
        await fetchDataForTown();
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDebugInfo(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all data (admin view)
  const fetchAllData = async () => {
    try {
      // Fetch all counts
      const [
        { count: employeesCount },
        { count: leaveRequestsCount },
        { count: salaryAdvancesCount },
        { count: expensesCount }
      ] = await Promise.all([
        supabase.from('employees').select('*', { count: 'exact', head: true }),
        supabase.from('leave_application').select('*', { count: 'exact', head: true }),
        supabase.from('salary_advance').select('*', { count: 'exact', head: true }),
        supabase.from('expenses').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        employees: employeesCount || 0,
        leaveRequests: leaveRequestsCount || 0,
        salaryAdvances: salaryAdvancesCount || 0,
        jobApplications: expensesCount || 0
      });

      setDebugInfo(`Showing ALL data | Employees: ${employeesCount} | Leaves: ${leaveRequestsCount} | Advances: ${salaryAdvancesCount} | Expenses: ${expensesCount}`);
    } catch (error) {
      console.error('Error fetching all data:', error);
      throw error;
    }
  };

  // Fetch data for specific town
  const fetchDataForTown = async () => {
    try {
      console.log('Fetching data for town:', currentTown);
      
      // Try multiple approaches to filter data
      let employeesCount = 0;
      let leaveRequestsCount = 0;
      let salaryAdvancesCount = 0;
      let expensesCount = 0;

      // 1. Try exact match in Town column
      let { count: townEmployees, error: townError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('Town', currentTown);

      if (!townError && townEmployees > 0) {
        console.log('Found employees by Town column:', townEmployees);
        employeesCount = townEmployees;
        
        // Try to find branch for this town
        const { data: branchData } = await supabase
          .from('kenya_branches')
          .select('"Branch Office"')
          .ilike('Area', `%${currentTown}%`)
          .limit(1);
        
        const branch = branchData?.[0]?.['Branch Office'];
        
        if (branch) {
          console.log('Using branch for filtering:', branch);
          
          const [
            { count: leaves },
            { count: advances },
            { count: exp }
          ] = await Promise.all([
            supabase.from('leave_application').select('*', { count: 'exact', head: true }).eq('Office Branch', branch),
            supabase.from('salary_advance').select('*', { count: 'exact', head: true }).eq('Office Branch', branch),
            supabase.from('expenses').select('*', { count: 'exact', head: true }).eq('branch', branch)
          ]);
          
          leaveRequestsCount = leaves || 0;
          salaryAdvancesCount = advances || 0;
          expensesCount = exp || 0;
        }
      }
      // 2. Try Branch column if Town didn't work
      else {
        console.log('Trying Branch column...');
        const { count: branchEmployees, error: branchError } = await supabase
          .from('employees')
          .select('*', { count: 'exact', head: true })
          .eq('Branch', currentTown);

        if (!branchError && branchEmployees > 0) {
          console.log('Found employees by Branch column:', branchEmployees);
          employeesCount = branchEmployees;
          
          const [
            { count: leaves },
            { count: advances },
            { count: exp }
          ] = await Promise.all([
            supabase.from('leave_application').select('*', { count: 'exact', head: true }).ilike('Office Branch', `%${currentTown}%`),
            supabase.from('salary_advance').select('*', { count: 'exact', head: true }).ilike('Office Branch', `%${currentTown}%`),
            supabase.from('expenses').select('*', { count: 'exact', head: true }).ilike('branch', `%${currentTown}%`)
          ]);
          
          leaveRequestsCount = leaves || 0;
          salaryAdvancesCount = advances || 0;
          expensesCount = exp || 0;
        }
        // 3. Try partial match as last resort
        else {
          console.log('Trying partial match...');
          const { count: partialEmployees, error: partialError } = await supabase
            .from('employees')
            .select('*', { count: 'exact', head: true })
            .ilike('Town', `%${currentTown}%`);

          if (!partialError) {
            employeesCount = partialEmployees || 0;
            
            const [
              { count: leaves },
              { count: advances },
              { count: exp }
            ] = await Promise.all([
              supabase.from('leave_application').select('*', { count: 'exact', head: true }).ilike('Office Branch', `%${currentTown}%`),
              supabase.from('salary_advance').select('*', { count: 'exact', head: true }).ilike('Office Branch', `%${currentTown}%`),
              supabase.from('expenses').select('*', { count: 'exact', head: true }).ilike('branch', `%${currentTown}%`)
            ]);
            
            leaveRequestsCount = leaves || 0;
            salaryAdvancesCount = advances || 0;
            expensesCount = exp || 0;
          }
        }
      }

      // If everything is 0, fetch all data
      if (employeesCount === 0 && leaveRequestsCount === 0 && salaryAdvancesCount === 0 && expensesCount === 0) {
        console.log('No data found for town, fetching all data...');
        await fetchAllData();
        return;
      }

      setStats({
        employees: employeesCount,
        leaveRequests: leaveRequestsCount,
        salaryAdvances: salaryAdvancesCount,
        jobApplications: expensesCount
      });

      setDebugInfo(`Town: "${currentTown}" | Employees: ${employeesCount} | Leaves: ${leaveRequestsCount} | Advances: ${salaryAdvancesCount} | Expenses: ${expensesCount}`);
      
    } catch (error) {
      console.error('Error in fetchDataForTown:', error);
      // On error, try to fetch all data
      await fetchAllData();
    }
  };

  // Fetch data for area
  const fetchDataForArea = async () => {
    try {
      console.log('Fetching data for area:', currentTown, 'Towns:', townsInArea);
      
      if (!townsInArea.length) {
        await fetchAllData();
        return;
      }

      // Fetch employees for all towns in area
      const { count: employeesCount } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .in('Town', townsInArea);

      // For other tables, we need to find branches for these towns
      const { data: branchesData } = await supabase
        .from('kenya_branches')
        .select('"Branch Office"')
        .in('Area', townsInArea);

      const branches = branchesData?.map(b => b['Branch Office']).filter(Boolean) || [];
      
      let leaveRequestsCount = 0;
      let salaryAdvancesCount = 0;
      let expensesCount = 0;

      if (branches.length > 0) {
        const [
          { count: leaves },
          { count: advances },
          { count: exp }
        ] = await Promise.all([
          supabase.from('leave_application').select('*', { count: 'exact', head: true }).in('Office Branch', branches),
          supabase.from('salary_advance').select('*', { count: 'exact', head: true }).in('Office Branch', branches),
          supabase.from('expenses').select('*', { count: 'exact', head: true }).in('branch', branches)
        ]);
        
        leaveRequestsCount = leaves || 0;
        salaryAdvancesCount = advances || 0;
        expensesCount = exp || 0;
      }

      setStats({
        employees: employeesCount || 0,
        leaveRequests: leaveRequestsCount,
        salaryAdvances: salaryAdvancesCount,
        jobApplications: expensesCount
      });

      setDebugInfo(`Area: "${currentTown}" (${townsInArea.length} towns) | Employees: ${employeesCount} | Leaves: ${leaveRequestsCount} | Advances: ${salaryAdvancesCount} | Expenses: ${expensesCount}`);
      
    } catch (error) {
      console.error('Error in fetchDataForArea:', error);
      await fetchAllData();
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
    fetchBirthdayNews();
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

  return (
    <div className="min-h-screen p-6" style={{
      background: darkMode 
        ? 'linear-gradient(135deg, rgba(0, 221, 255, 0.08) 0%, rgba(0, 252, 76, 0.05) 50%, rgba(255, 255, 255, 0.02) 100%)'
        : 'linear-gradient(135deg, #f0f9ff 0%, #f0fff4 50%, #faf5ff 100%)',
      fontFamily: "'Geist', sans-serif"
    }}>
      <style jsx global>{`
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

      {/* Welcome Section */}
      <div className="mb-8">
        <motion.div 
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: darkMode 
              ? 'linear-gradient(135deg, rgba(0, 221, 255, 0.15) 0%, rgba(0, 252, 76, 0.1) 50%, rgba(255, 255, 255, 0.05) 100%)'
              : 'linear-gradient(135deg, #d2f9dc 0%, #b6a6ff 50%, #85ffa7 100%)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-green-200/20 to-blue-200/20 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="mb-4 md:mb-0 flex items-center">
                <img src="/leaf3.png" className="w-20 h-25" alt="" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900 mb-1 tracking-tight">Welcome back</h1>
                  <p className="text-xs text-gray-900 font-medium">
                    Latest updates for{" "}
                    <span className="font-semibold text-gray-900 flex items-center mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {getDisplayName()}
                    </span>
                  </p>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex space-x-2 flex-wrap gap-2">
                <motion.button 
                  onClick={handleSupportClick}
                  className="px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 backdrop-blur-sm border border-white/20"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    color: darkMode ? '#1f2937' : '#1f2937'
                  }}
                  whileHover={{ scale: 1.05, background: 'rgba(255, 255, 255, 0.25)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <HelpCircle className="w-3 h-3 inline mr-1" />
                  Support
                </motion.button>
                
                <motion.button 
                  onClick={sendAllBirthdaySMS}
                  disabled={isSendingBirthdaySMS}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-white transition-all duration-300 flex items-center shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #ec4899, #f97316)'
                  }}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(236, 72, 153, 0.4)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSendingBirthdaySMS ? (
                    <RefreshCw className="w-3 h-3 inline mr-1 animate-spin" />
                  ) : (
                    <Cake className="w-3 h-3 inline mr-1" />
                  )}
                  {isSendingBirthdaySMS ? 'Sending...' : 'Send Birthday SMS'}
                </motion.button>
                
                <motion.button 
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 backdrop-blur-sm border border-white/20 flex items-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    color: darkMode ? '#1f2937' : '#1f2937'
                  }}
                  whileHover={{ scale: 1.05, background: 'rgba(255, 255, 255, 0.25)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw className={`w-3 h-3 inline mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </motion.button>
                
                <motion.button 
                  onClick={handleSettingsClick}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-white transition-all duration-300 flex items-center shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                  }}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Settings className="w-3 h-3 inline mr-1" />
                  Settings
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Debug info */}
      <div className="mb-4 p-3 bg-slate-100 rounded-lg">
        <p className="text-xs text-slate-600 font-mono">{debugInfo}</p>
      </div>

      {/* Dashboard Tabs */}
      <div className="mb-6">
        <div className="flex space-x-6">
          <motion.button 
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-1 font-medium text-sm relative ${
              activeTab === 'overview' ? 'text-gray-900' : 'text-gray-600 hover:text-gray-800'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Overview
            {activeTab === 'overview' && (
              <motion.div 
                className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                layoutId="activeTab"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <motion.div 
            className="rounded-full w-12 h-12 border-2 border-blue-500 border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Best Performing Employees Board */}
          <div className="lg:col-span-2">
            {/* Best Performing Employees Board */}
            <motion.div 
              className="rounded-2xl p-6 mb-6"
              style={{
                background: darkMode 
                  ? 'linear-gradient(135deg, rgba(0, 221, 255, 0.15) 0%, rgba(0, 252, 76, 0.1) 50%, rgba(255, 255, 255, 0.05) 100%)'
                  : 'linear-gradient(135deg, #d2f9dc 0%, #b6a6ff 50%, #85ffa7 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              }}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <motion.div 
                    className="w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg mr-3"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                  >
                    <Crown className="w-4 h-4 text-white" />
                  </motion.div>
                  <h2 className="text-lg font-bold text-gray-900 tracking-tight">Best Performing Employees</h2>
                </div>
                <span className="text-xs text-gray-900 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm font-medium">
                  {topPerformers.length} top performers
                </span>
              </div>
              
              <div className="space-y-4">
                {topPerformers.map((employee, index) => (
                  <motion.div 
                    key={employee.id}
                    className="p-4 rounded-xl transition-all duration-300 cursor-pointer group relative overflow-hidden"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                    whileHover={{ scale: 1.02, background: 'rgba(255, 255, 255, 0.25)' }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center space-x-4">
                      {/* Rank Badge */}
                      <motion.div 
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' : 
                          index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600 text-white' : 
                          index === 2 ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white' : 
                          'bg-gradient-to-br from-blue-400 to-purple-500 text-white'
                        }`}
                        whileHover={{ rotate: 5, scale: 1.1 }}
                      >
                        <span className="text-sm font-bold">#{index + 1}</span>
                      </motion.div>
                      
                      {/* Employee Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="text-sm font-bold text-gray-900 flex items-center">
                              {employee.name}
                              {employee.isOverall && (
                                <Crown className="w-3 h-3 text-yellow-500 ml-1" />
                              )}
                            </h3>
                            <p className="text-xs text-gray-900 font-medium">{employee.position}</p>
                          </div>
                          <motion.div 
                            className={`text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm ${
                              employee.performance >= 90 ? 'bg-green-100 text-green-700' :
                              employee.performance >= 80 ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}
                            whileHover={{ scale: 1.05 }}
                          >
                            {employee.performance}%
                          </motion.div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-900 font-medium flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {employee.branch}
                          </span>
                          <div className="flex items-center space-x-1">
                            {employee.performance >= 90 && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                            {employee.performance >= 95 && <Award className="w-3 h-3 text-purple-500" />}
                            <ChevronRight className="w-3 h-3 text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Performance Bar */}
                    <div className="mt-3 w-full bg-white/20 rounded-full h-1.5 backdrop-blur-sm">
                      <motion.div 
                        className={`h-1.5 rounded-full bg-white`} // WHITE PROGRESS BAR
                        initial={{ width: 0 }}
                        animate={{ width: `${employee.performance}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { 
                  key: 'employees', 
                  label: 'Total Employees', 
                  value: stats.employees, 
                  icon: Users,
                  color: 'from-blue-500 to-purple-500',
                  progress: stats.employees > 0 ? Math.min(96, (stats.employees / 100) * 100) : 0
                },
                { 
                  key: 'leaveRequests', 
                  label: 'Leave Requests', 
                  value: stats.leaveRequests, 
                  icon: CalendarDays,
                  color: 'from-green-500 to-emerald-500',
                  progress: stats.leaveRequests > 0 ? Math.min(89, (stats.leaveRequests / 50) * 100) : 0
                },
                { 
                  key: 'salaryAdvances', 
                  label: 'Salary Advances', 
                  value: stats.salaryAdvances, 
                  icon: Wallet,
                  color: 'from-orange-500 to-red-500',
                  progress: stats.salaryAdvances > 0 ? Math.min(88, (stats.salaryAdvances / 30) * 100) : 0
                },
                { 
                  key: 'jobApplications', 
                  label: 'Expenses', 
                  value: stats.jobApplications, 
                  icon: NotepadText,
                  color: 'from-indigo-500 to-blue-500',
                  progress: stats.jobApplications > 0 ? Math.min(100, (stats.jobApplications / 20) * 100) : 0
                }
              ].map((stat, index) => (
                <motion.div 
                  key={stat.key}
                  className="rounded-2xl p-5"
                  style={{
                    background: darkMode 
                      ? 'linear-gradient(135deg, rgba(0, 221, 255, 0.15) 0%, rgba(0, 252, 76, 0.1) 50%, rgba(255, 255, 255, 0.05) 100%)'
                      : 'linear-gradient(135deg, #d2f9dc 0%, #b6a6ff 50%, #85ffa7 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  }}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-900 font-medium mb-2">{stat.label}</p>
                      <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                    </div>
                    <motion.div 
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}
                      whileHover={{ rotate: 5, scale: 1.1 }}
                    >
                      <stat.icon className="w-5 h-5 text-white" />
                    </motion.div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="flex justify-between text-xs text-gray-900 font-medium mb-2">
                      <span>Progress</span>
                      <span>{stat.progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-1.5 backdrop-blur-sm">
                      <motion.div 
                        className="h-1.5 rounded-full bg-white" // WHITE PROGRESS BAR
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.progress}%` }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column - News Section */}
          <div className="lg:col-span-1">
            <motion.div 
              className="rounded-2xl p-6"
              style={{
                background: darkMode 
                  ? 'linear-gradient(135deg, rgba(0, 221, 255, 0.15) 0%, rgba(0, 252, 76, 0.1) 50%, rgba(255, 255, 255, 0.05) 100%)'
                  : 'linear-gradient(135deg, #d2f9dc 0%, #b6a6ff 50%, #85ffa7 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              }}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">Updates & News</h2>
                <span className="text-xs text-gray-900 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm font-medium">
                  {newsItems.length} items
                </span>
              </div>
              
              {isNewsLoading ? (
                <div className="flex justify-center items-center h-32">
                  <motion.div 
                    className="rounded-full w-6 h-6 border-2 border-blue-500 border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {newsItems.map((item, index) => (
                    <motion.div 
                      key={item.id}
                      className="p-4 rounded-xl transition-all duration-300 cursor-pointer group relative overflow-hidden"
                      style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                      whileHover={{ scale: 1.02, background: 'rgba(255, 255, 255, 0.25)' }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <div className="flex items-start space-x-3">
                        <motion.div 
                          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${getNewsBgColor(item.type)}`}
                          whileHover={{ rotate: 5, scale: 1.1 }}
                        >
                          <span className={getNewsTextColor(item.type)}>
                            {getNewsIcon(item.type)}
                          </span>
                        </motion.div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="text-sm font-bold text-gray-900 truncate">
                              {item.title}
                            </h3>
                            {item.type === 'birthday' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  sendAllBirthdaySMS();
                                }}
                                disabled={isSendingBirthdaySMS}
                                className="text-xs text-pink-600 hover:text-pink-700 font-medium flex items-center"
                              >
                                <Send className="w-3 h-3 mr-1" />
                                Send
                              </button>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-gray-900 font-medium line-clamp-2 mb-2">
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-900 font-medium">{item.date}</span>
                            {item.time && (
                              <span className="text-xs text-gray-900 bg-white/20 px-2 py-1 rounded-full font-medium backdrop-blur-sm">
                                {item.time}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              
              <div className="mt-6 pt-4 border-t border-white/20">
                <motion.button 
                  className="w-full text-xs text-gray-900 hover:text-gray-800 font-bold py-3 rounded-xl transition-all duration-300 backdrop-blur-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                  whileHover={{ scale: 1.02, background: 'rgba(255, 255, 255, 0.25)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  View All Updates
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}