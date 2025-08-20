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

// Error Boundary Component
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error: any) => {
      console.error('App Error:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-4">Please refresh the page to continue</p>
          <button 
            onClick={() => {
              setHasError(false);
              window.location.reload();
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedTown, setSelectedTown] = useState<string>('');
  const [branches, setBranches] = useState<string[]>([]);
  const [isFetchingBranches, setIsFetchingBranches] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Fetch branches from Supabase with better error handling
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
        console.log('Branches loaded successfully:', branchNames.length);
      } catch (error) {
        console.error('Error fetching branches:', error);
        // Fallback branches if database fails
        setBranches(['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru']);
        console.log('Using fallback branches');
      } finally {
        setIsFetchingBranches(false);
      }
    };

    fetchBranches();
  }, []);

  const handleTownChange = useCallback((town: string) => {
    console.log('Town changed to:', town);
    setSelectedTown(town);
    localStorage.setItem('selectedTown', town);
    
    if (session?.user) {
      supabase.auth.updateUser({
        data: { town }
      }).then(({ error }) => {
        if (error) console.error('Error updating user metadata:', error);
      });
    }
  }, [session]);

  const handleLogout = useCallback(async () => {
    console.log('Logging out...');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Logged out successfully');
        setUser(null);
        setSession(null);
        setSelectedTown('');
        localStorage.removeItem('selectedTown');
        navigate('/login', { replace: true });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if Supabase fails
      setUser(null);
      setSession(null);
      setSelectedTown('');
      localStorage.removeItem('selectedTown');
      navigate('/login', { replace: true });
    }
    toast.dismiss();
  }, [navigate]);

  const handleLoginSuccess = useCallback((town: string, userRole: string) => {
    console.log('Login success:', { town, userRole });
    handleTownChange(town);
    
    // Navigate based on role
    const targetPath = userRole === 'STAFF' ? '/staff' : '/dashboard';
    navigate(targetPath, { replace: true });
  }, [navigate, handleTownChange]);

  // Handle email confirmation redirect
  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const type = searchParams.get('type');
      console.log('URL params type:', type);
      
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

            const targetPath = userRole === 'STAFF' ? '/staff' : '/dashboard';
            navigate(targetPath, { replace: true });
          }
        } catch (error) {
          console.error('Error handling email confirmation:', error);
          toast.error('Failed to verify email. Please try logging in.');
          navigate('/login', { replace: true });
        }
      }
    };

    handleEmailConfirmation();
  }, [navigate, searchParams]);

  // Main auth state management - FIXED VERSION
  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setAuthChecked(true);
          setIsInitializing(false);
          return;
        }

        console.log('Initial session:', !!session);
        setSession(session);

        if (session?.user?.email) {
          const userData = {
            email: session.user.email,
            role: session.user.user_metadata?.role || 'STAFF',
            town: session.user.user_metadata?.town || ''
          };
          
          setUser(userData);
          console.log('User data set:', userData);
          
          // Set selected town from localStorage or user metadata
          const savedTown = localStorage.getItem('selectedTown') || 
                            session.user.user_metadata?.town || '';
          if (savedTown) {
            setSelectedTown(savedTown);
          }

          // Only redirect if we're on root path
          const currentPath = location.pathname;
          if (currentPath === '/') {
            const targetPath = userData.role === 'STAFF' ? '/staff' : '/dashboard';
            console.log('Redirecting to:', targetPath);
            navigate(targetPath, { replace: true });
          }

        } else {
          // No session - clear user data
          setUser(null);
          setSelectedTown('');
          
          // Only redirect to login if we're on a protected route
          const publicPaths = ['/login', '/update-password'];
          if (!publicPaths.includes(location.pathname)) {
            console.log('No session, redirecting to login');
            navigate('/login', { replace: true });
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setAuthChecked(true);
        setIsInitializing(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, !!session);
      
      setSession(session);
      setAuthChecked(true);

      if (session?.user?.email) {
        const userData = {
          email: session.user.email,
          role: session.user.user_metadata?.role || 'STAFF',
          town: session.user.user_metadata?.town || ''
        };
        
        setUser(userData);
        
        if (event === 'SIGNED_IN') {
          const targetPath = userData.role === 'STAFF' ? '/staff' : '/dashboard';
          navigate(targetPath, { replace: true });
        }
      } else {
        setUser(null);
        setSelectedTown('');
        
        if (event === 'SIGNED_OUT') {
          navigate('/login', { replace: true });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  const renderMainLayout = () => {
    // Don't render main layout if still initializing
    if (isInitializing) {
      return <Loader />;
    }

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
                    {/* Root redirect based on role */}
                    <Route 
                      path="/" 
                      element={
                        user?.role === 'STAFF' ? 
                          <StaffPortalLanding /> : 
                          <AuthRoute allowedRoles={['ADMIN','MANAGER']}>
                            <Dashboard selectedTown={selectedTown} />
                          </AuthRoute>
                      } 
                    />
                    
                    {/* Main dashboard routes */}
                    <Route 
                      path="/dashboard" 
                      element={
                        <AuthRoute allowedRoles={['ADMIN','MANAGER']}>
                          <Dashboard selectedTown={selectedTown} />
                        </AuthRoute>
                      } 
                    />
                    
                    {/* Employee routes */}
                    <Route path="/employees" element={<EmployeeList selectedTown={selectedTown} />} />
                    <Route path="/add-employee" element={<AddEmployeePage />} />
                    <Route path="/view-employee/:id" element={<ViewEmployeePage />} />
                    <Route path="/edit-employee/:id" element={<EditEmployeePage />} />
                    <Route path="/employee-added" element={<SuccessPage />} />
                    
                    {/* Admin routes */}
                    <Route 
                      path="/payroll" 
                      element={
                        <AuthRoute allowedRoles={['ADMIN']}>
                          <PayrollDashboard selectedTown={selectedTown} />
                        </AuthRoute>
                      } 
                    />
                    <Route 
                      path="/settings" 
                      element={
                        <AuthRoute allowedRoles={['ADMIN']}>
                          <UserRolesSettings />
                        </AuthRoute>
                      } 
                    />
                    <Route path="/salaryadmin" element={<SalaryAdvanceAdmin />} />
                    <Route path="/adminconfirm" element={<StaffSignupRequests selectedTown={selectedTown}/>} />
                    
                    {/* Other routes */}
                    <Route path="/recruitment" element={<RecruitmentDashboard selectedTown={selectedTown} />} />
                    <Route path="/applications" element={<ApplicationsTable />} />
                    <Route path="/performance" element={<PerformanceDashboard selectedTown={selectedTown} />} />
                    <Route path="/leaves" element={<LeaveManagementSystem selectedTown={selectedTown} />} />
                    <Route path="/training" element={<AdminVideoUpload/>} />
                    <Route path="/ai-assistant" element={<AIAssistantPage />} />
                    <Route path="/fogs" element={<EmployeeDataTable selectedTown={selectedTown}/>} />
                    
                    {/* Reports route */}
                    <Route path="/reports" element={
                      <div className="p-6 w-full">
                        <h1 className="text-3xl font-bold text-gray-800 mb-4">Reports & Analytics</h1>
                        <div className="bg-white shadow-lg rounded-lg p-8 text-center w-full">
                          <p className="text-gray-600">Reports module coming soon...</p>
                        </div>
                      </div>
                    } />
                    
                    {/* Catch all unmatched routes */}
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
    // Show loader during initial auth check
    if (!authChecked || isInitializing) {
      return <Loader />;
    }

    return (
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/update-password" element={<UpdatePasswordPage/>} />
        
        {/* Staff portal - accessible without main layout */}
        <Route path="/staff" element={<StaffPortalLanding />} />
        
        {/* Protected main application routes */}
        <Route 
          path="/*" 
          element={
            session ? (
              renderMainLayout()
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          } 
        />
      </Routes>
    );
  };

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;
