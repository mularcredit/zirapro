import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
import { CSSProperties } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import AdminVideoUpload from './components/training/Training'
import Footer from './components/Layout/Footer';
import Login from './pages/Login';
import Dashboard from './components/Dashboard/Dashboard';
import EmployeeList from './components/Employees/EmployeeList';
import PayrollDashboard from './components/Payroll/PayrollDashboard';
import StaffSignupRequests from './../src/pages/admin';
import StaffPortalLanding from './components/staff portal/StaffPortal';
import RecruitmentDashboard from './components/Recruitment/RecruitmentDashboard';
import LeaveManagementSystem from './components/Leave/LeaveManagement';
import PerformanceDashboard from './components/Perfomance/PerfomanceDashboard';
import AddEmployeePage from './components/Add Form/AddEmployeePage';
import ViewEmployeePage from './components/view_form/EmployeeDetails';
import SuccessPage from './components/Add Form/SuccessPage';
import EmployeeDataTable from './components/Payroll/fog';
import EditEmployeePage from './components/Add Form/EditEmployee';
import { AIAssistantPage } from './components/AI/AIAssistantPage';
import UserRolesSettings from './components/Settings/UserRole';
import AuthRoute from './components/ProtectedRoutes/AuthRoute';
import NotFound from '../src/components/NOT FOUND/NotFound';
import UpdatePasswordPage from './pages/UpdatePassword';
import SalaryAdvanceAdmin from './components/Settings/SalaryAdmin';
import { ApplicationsTable } from './components/Recruitment/components/ApplicationsTable';

interface User {
  email: string;
  role: string;
  town?: string;
}

interface Branch {
  'Branch Office': string;
}

const Loader = () => {
  const loaderStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  };

  const spinnerStyle: CSSProperties = {
    width: '50px',
    height: '50px',
    border: '5px solid rgba(16, 185, 129, 0.2)',
    borderTop: '5px solid #10b981',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  return (
    <div style={loaderStyle}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={spinnerStyle}></div>
    </div>
  );
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedTown, setSelectedTown] = useState<string>('');
  const [branches, setBranches] = useState<string[]>([]);
  const [isFetchingBranches, setIsFetchingBranches] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Fetch branches from Supabase
  useEffect(() => {
    const fetchBranches = async () => {
      setIsFetchingBranches(true);
      try {
        const { data, error } = await supabase
          .from('kenya_branches')
          .select('"Branch Office"')
          .order('"Branch Office"', { ascending: true });

        if (error) throw error;
        
        const branchNames = data?.map(item => item['Branch Office']) || [];
        setBranches(branchNames);
      } catch (error) {
        console.error('Error fetching branches:', error);
        toast.error('Failed to load branch offices');
        setBranches(['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru']);
      } finally {
        setIsFetchingBranches(false);
      }
    };

    fetchBranches();
  }, []);

  const handleTownChange = useCallback((town: string) => {
    setSelectedTown(town);
    localStorage.setItem('selectedTown', town);
    
    supabase.auth.updateUser({
      data: { town }
    }).then(({ error }) => {
      if (error) console.error('Error updating user metadata:', error);
    });
  }, []);

  const handleLogout = useCallback(async () => {
    console.log('Logging out...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Logged out successfully');
      setUser(null);
      setSession(null);
      setSelectedTown('');
      localStorage.removeItem('selectedTown');
      navigate('/login');
    }
    toast.dismiss();
  }, [navigate]);

  const handleLoginSuccess = useCallback((town: string, userRole: string) => {
    handleTownChange(town);
    if (userRole === 'STAFF') {
      navigate('/staff');
    } else {
      navigate('/dashboard');
    }
  }, [navigate, handleTownChange]);

  // Handle email confirmation redirect
  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const type = searchParams.get('type');
      if (type === 'signup' || type === 'recovery') {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) throw error;

          if (session) {
            const userRole = session.user?.user_metadata?.role || 'STAFF';
            toast.success('Email verified successfully! Welcome to Zira HR.');
            
            setSession(session);
            setUser({
              email: session.user.email || '',
              role: userRole,
              town: session.user.user_metadata?.town || ''
            });

            navigate(userRole === 'STAFF' ? '/staff' : '/dashboard');
          }
        } catch (error) {
          console.error('Error handling email confirmation:', error);
          toast.error('Failed to verify email. Please try logging in.');
          navigate('/login');
        }
      }
    };

    handleEmailConfirmation();
  }, [navigate, searchParams]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthChecked(true);

      if (session?.user?.email) {
        const userData = {
          email: session.user.email,
          role: session.user.user_metadata?.role || 'STAFF',
          town: session.user.user_metadata?.town || ''
        };
        
        setUser(userData);
        
        const savedTown = localStorage.getItem('selectedTown') || 
                          session.user.user_metadata?.town || '';
        setSelectedTown(savedTown);

        if (location.pathname === '/' || location.pathname === '/login') {
          if (userData.role === 'STAFF') {
            navigate('/staff');
          } else {
            navigate('/dashboard');
          }
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setAuthChecked(true);

      if (session?.user?.email) {
        const userData = {
          email: session.user.email,
          role: session.user.user_metadata?.role || 'STAFF',
          town: session.user.user_metadata?.town || ''
        };
        
        setUser(userData);
        
        if (event === 'SIGNED_IN' && (location.pathname === '/' || location.pathname === '/login')) {
          if (userData.role === 'STAFF') {
            navigate('/staff');
          } else {
            navigate('/dashboard');
          }
        }
      } else {
        setUser(null);
        setSelectedTown('');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  const renderMainLayout = () => {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-100/30 via-transparent to-transparent"></div>
        <div className="relative flex flex-1 w-full overflow-x-hidden">
          <Sidebar selectedTown={selectedTown} />
          <div className="flex-1 min-w-0 flex flex-col">
            <Header 
              user={user} 
              onLogout={handleLogout} 
              selectedTown={selectedTown}
              onTownChange={handleTownChange}
              towns={branches}
            />
            <main className="flex-1 overflow-x-hidden p-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  <Routes>
                    <Route path="/dashboard" element={<AuthRoute allowedRoles={['ADMIN','MANAGER']}><Dashboard selectedTown={selectedTown} /></AuthRoute>} />
                    <Route path="/employees" element={<EmployeeList selectedTown={selectedTown} />} />
                    <Route path="/payroll" element={<AuthRoute allowedRoles={['ADMIN']}><PayrollDashboard selectedTown={selectedTown} /></AuthRoute>} />
                    <Route path="/recruitment" element={<RecruitmentDashboard selectedTown={selectedTown} />} />
                    <Route path="/performance" element={<PerformanceDashboard selectedTown={selectedTown} />} />
                    <Route path="/add-employee" element={<AddEmployeePage />} />
                    <Route path="*" element={<NotFound />} />
                    <Route path="salaryadmin" element={<SalaryAdvanceAdmin />} />
                    <Route path="/fogs" element={<EmployeeDataTable selectedTown={selectedTown}/>} />
                    <Route path="/adminconfirm" element={<StaffSignupRequests selectedTown={selectedTown}/>} />
                    <Route path="/view-employee/:id" element={<ViewEmployeePage />} />
                    <Route path="/employee-added" element={<SuccessPage />} />
                    <Route path="/employee-added" element={<ApplicationsTable />} />
                    <Route path="/edit-employee/:id" element={<EditEmployeePage />} />
                    <Route path="/ai-assistant" element={<AIAssistantPage />} />
                    <Route path="/leaves" element={<LeaveManagementSystem selectedTown={selectedTown} />} />
                    <Route path="/training" element={ <AdminVideoUpload/>} />
                    <Route path="/reports" element={
                      <div className="p-6 w-full">
                        <h1 className="text-3xl font-bold text-white mb-4">Reports & Analytics</h1>
                        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-8 text-center w-full">
                          <p className="text-gray-400">Reports module coming soon...</p>
                        </div>
                      </div>
                    } />
                    <Route path="/settings" element={<AuthRoute allowedRoles={['ADMIN']}><UserRolesSettings /></AuthRoute>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </motion.div>
              </AnimatePresence>
            </main>
            <Footer />
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (!authChecked) {
      return <Loader />;
    }

    return (
      <Routes>
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/update-password" element={<UpdatePasswordPage/>} />
        <Route path="/staff" element={<StaffPortalLanding />} />
        <Route path="/*" element={renderMainLayout()} />
      </Routes>
    );
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {renderContent()}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

export default App;