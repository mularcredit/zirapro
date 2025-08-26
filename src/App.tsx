import { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
import { CSSProperties } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import AdminVideoUpload from './components/training/Training';
import Footer from './components/Layout/Footer';
import Login from './pages/Login';
import Dashboard from './components/Dashboard/Dashboard';
import ExpenseModule from './components/Epense/Expense';
import EmployeeList from './components/Employees/EmployeeList';
import LoanRequestsAdmin from './components/Settings/StaffLoan';
import PayrollDashboard from './components/Payroll/PayrollDashboard';
import StaffSignupRequests from './pages/admin';
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
import NotFound from './components/NOT FOUND/NotFound';
import UpdatePasswordPage from './pages/UpdatePassword';
import SalaryAdvanceAdmin from './components/Settings/SalaryAdmin';
import VideoConferenceComponent from '../src/components/staff portal/VideoConf'
import { ApplicationsTable } from './components/Recruitment/components/ApplicationsTable';
import {MeetingJoin} from './components/zoom/MeetingJoin';
import WarningModule from './components/Warning/StaffCheck'
import {MeetingRoom} from './components/zoom/MeetingRoom';
import { useZoomSDK } from '../src/hooks/useZoom';
import { createMeetingConfig } from '../backend/zoomAuth';
import React from 'react';
import { UserProvider } from '../src/components/ProtectedRoutes/UserContext';


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

class ErrorBoundaryClass extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">Please refresh the page to continue</p>
            <button 
              onClick={() => {
                this.setState({ hasError: false, error: null });
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

    return this.props.children;
  }
}

const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return <ErrorBoundaryClass>{children}</ErrorBoundaryClass>;
};

function App() {
  // All hooks at the top level
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedTown, setSelectedTown] = useState<string>('');
  const [branches, setBranches] = useState<string[]>([]);
  const [isFetchingBranches, setIsFetchingBranches] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Zoom meeting state
  const {
    isInMeeting,
    participants,
    chatMessages,
    isAudioMuted,
    isVideoMuted,
    isScreenSharing,
    connectionStatus,
    joinMeeting,
    leaveMeeting,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    sendChatMessage
  } = useZoomSDK();

  // Refs to track login state and prevent duplicate toasts
  const hasShownWelcomeToast = useRef(false);
  const lastAuthEvent = useRef<string>('');
  const navigationHandled = useRef(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleJoinMeeting = async (config: {
    topic: string;
    userName: string;
    userEmail: string;
  }) => {
    const meetingConfig = createMeetingConfig(config.topic, config.userName, config.userEmail);
    await joinMeeting(meetingConfig);
  };

  // Fetch branches from Supabase
  useEffect(() => {
    const fetchBranches = async () => {
      if (isFetchingBranches) return;
      
      setIsFetchingBranches(true);
      try {
        const { data, error } = await supabase
          .from('kenya_branches')
          .select('"Branch Office"')
          .order('"Branch Office"', { ascending: true });

        if (error) throw error;
        
        const branchNames = data?.map((item: Branch) => item['Branch Office']).filter(Boolean) || [];
        setBranches(branchNames);
      } catch (error) {
        console.error('Error fetching branches:', error);
        setBranches(['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika']);
      } finally {
        setIsFetchingBranches(false);
      }
    };

    fetchBranches();
  }, []);

  const handleTownChange = useCallback((town: string) => {
    if (town === selectedTown) return;
    
    setSelectedTown(town);
    localStorage.setItem('selectedTown', town);
    
    if (session?.user) {
      supabase.auth.updateUser({
        data: { town }
      }).then(({ error }) => {
        if (error) {
          console.error('Error updating user metadata:', error);
          toast.error('Failed to update town preference');
        } else {
          toast.success(`Town updated to ${town}`);
        }
      });
    }
  }, [session, selectedTown]);

  const handleLogout = useCallback(async () => {
    try {
      // Reset refs on logout
      hasShownWelcomeToast.current = false;
      lastAuthEvent.current = '';
      navigationHandled.current = false;
      
      const loadingToast = toast.loading('Signing out...');
      const { error } = await supabase.auth.signOut();
      toast.dismiss(loadingToast);
      
      if (error) {
        console.error('Logout error:', error);
        toast.error('Error signing out: ' + error.message);
      } else {
        toast.success('Signed out successfully');
      }
      
      setUser(null);
      setSession(null);
      setSelectedTown('');
      localStorage.removeItem('selectedTown');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Unexpected logout error:', error);
      setUser(null);
      setSession(null);
      setSelectedTown('');
      localStorage.removeItem('selectedTown');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const handleLoginSuccess = useCallback((town: string, userRole: string) => {
    if (town) {
      handleTownChange(town);
    }
    
    // Set flag to show welcome toast only once
    hasShownWelcomeToast.current = true;
    
    setTimeout(() => {
      const targetPath = userRole === 'STAFF' ? '/staff' : '/dashboard';
      navigate(targetPath, { replace: true });
    }, 100);
  }, [navigate, handleTownChange]);

  // Handle email confirmation redirect
  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const type = searchParams.get('type');
      const accessToken = searchParams.get('access_token');
      
      if ((type === 'signup' || type === 'recovery') && accessToken) {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            navigate('/login', { replace: true });
            return;
          }

          if (session?.user) {
            const userRole = session.user.user_metadata?.role || 'STAFF';
            const userTown = session.user.user_metadata?.town || '';
            
            // Show email verification toast only once
            if (!hasShownWelcomeToast.current) {
              toast.success('Email verified successfully! Welcome to Zira HR.');
              hasShownWelcomeToast.current = true;
            }
            
            setSession(session);
            setUser({
              email: session.user.email || '',
              role: userRole,
              town: userTown
            });

            if (userTown) {
              setSelectedTown(userTown);
              localStorage.setItem('selectedTown', userTown);
            }

            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);

            const targetPath = userRole === 'STAFF' ? '/staff' : '/dashboard';
            navigate(targetPath, { replace: true });
          } else {
            navigate('/login', { replace: true });
          }
        } catch (error) {
          navigate('/login', { replace: true });
        }
      }
    };

    handleEmailConfirmation();
  }, [navigate, searchParams]);

  // Main auth state management
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          setAuthChecked(true);
          setIsInitializing(false);
          return;
        }

        setSession(session);

        if (session?.user?.email) {
          const userData = {
            email: session.user.email,
            role: session.user.user_metadata?.role || 'STAFF',
            town: session.user.user_metadata?.town || ''
          };
          
          setUser(userData);
          
          const savedTown = localStorage.getItem('selectedTown') || 
                            session.user.user_metadata?.town || '';
          if (savedTown && branches.length > 0 && branches.includes(savedTown)) {
            setSelectedTown(savedTown);
          }

          const currentPath = location.pathname;
          const isEmailConfirmation = searchParams.has('type') && searchParams.has('access_token');
          
          // Only navigate on initial load, not on subsequent auth checks
          if ((currentPath === '/' || currentPath === '/login') && !isEmailConfirmation && !navigationHandled.current) {
            const targetPath = userData.role === 'STAFF' ? '/staff' : '/dashboard';
            navigate(targetPath, { replace: true });
            navigationHandled.current = true;
          }
        } else {
          setUser(null);
          setSelectedTown('');
          localStorage.removeItem('selectedTown');
          
          const publicPaths = ['/login', '/update-password'];
          const currentPath = location.pathname;
          
          if (!publicPaths.includes(currentPath)) {
            navigate('/login', { replace: true });
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        toast.error('Authentication error. Please refresh the page.');
      } finally {
        setAuthChecked(true);
        setIsInitializing(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Prevent duplicate handling of the same event
      if (lastAuthEvent.current === event && event !== 'TOKEN_REFRESHED') {
        return;
      }
      lastAuthEvent.current = event;

      setSession(session);
      setAuthChecked(true);

      if (session?.user?.email) {
        const userData = {
          email: session.user.email,
          role: session.user.user_metadata?.role || 'STAFF',
          town: session.user.user_metadata?.town || ''
        };
        
        setUser(userData);
        
        if (userData.town && branches.length > 0 && branches.includes(userData.town)) {
          setSelectedTown(userData.town);
          localStorage.setItem('selectedTown', userData.town);
        }
        
        // Only show welcome toast and navigate for actual sign-in events, not token refreshes
        if (event === 'SIGNED_IN' && !hasShownWelcomeToast.current) {
          hasShownWelcomeToast.current = true;
          toast.success(`Welcome back, ${userData.email}!`);
          
          const currentPath = location.pathname;
          const publicPaths = ['/login', '/update-password'];
          
          if (publicPaths.includes(currentPath)) {
            const targetPath = userData.role === 'STAFF' ? '/staff' : '/dashboard';
            navigate(targetPath, { replace: true });
          }
        }
      } else {
        setUser(null);
        setSelectedTown('');
        localStorage.removeItem('selectedTown');
        
        if (event === 'SIGNED_OUT') {
          hasShownWelcomeToast.current = false;
          lastAuthEvent.current = '';
          navigationHandled.current = false;
          navigate('/login', { replace: true });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname, searchParams, branches]);

  // Reset navigation flag when location changes
  useEffect(() => {
    navigationHandled.current = false;
  }, [location.pathname]);

  // Early return if in meeting
  if (isInMeeting) {
    return (
      <ErrorBoundary>
        <MeetingRoom
          participants={participants}
          chatMessages={chatMessages}
          isAudioMuted={isAudioMuted}
          isVideoMuted={isVideoMuted}
          isScreenSharing={isScreenSharing}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onToggleScreenShare={toggleScreenShare}
          onLeaveMeeting={leaveMeeting}
          onSendMessage={sendChatMessage}
        />
        <Toaster position="top-right" toastOptions={{ style: { background: '#1f2937', color: '#fff' } }} />
      </ErrorBoundary>
    );
  }

  if (!authChecked || isInitializing) {
    return <Loader />;
  }

  // Main render
  return (
    <UserProvider>
    <ErrorBoundary>
      <div className="min-h-screen bg-white overflow-x-hidden">
        <Routes>
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/update-password" element={<UpdatePasswordPage/>} />
          
          <Route 
            path="/staff" 
            element={session ? <StaffPortalLanding /> : <Login onLoginSuccess={handleLoginSuccess} />} 
          />
          
          <Route 
            path="/*" 
            element={
              !session || !user ? (
                <Login onLoginSuccess={handleLoginSuccess} />
              ) : (
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
                              <Route 
                                path="/" 
                                element={
                                  user?.role === 'STAFF' ? 
                                    <StaffPortalLanding /> : 
                                    <AuthRoute allowedRoles={['ADMIN','MANAGER','HR']}>
                                      <Dashboard selectedTown={selectedTown} />
                                    </AuthRoute>
                                } 
                              />
                              <Route 
                                path="/dashboard" 
                                element={
                                  <AuthRoute allowedRoles={['ADMIN','MANAGER','HR']}>
                                    <Dashboard selectedTown={selectedTown} />
                                  </AuthRoute>
                                } 
                              />
                              <Route path="/employees" element={<EmployeeList selectedTown={selectedTown} />} />
                              <Route path="/add-employee" element={<AddEmployeePage />} />
                              <Route path="/view-employee/:id" element={<ViewEmployeePage />} />
                              <Route path="/edit-employee/:id" element={<EditEmployeePage />} />
                              <Route path="/employee-added" element={<SuccessPage />} />
                              <Route path="/loanadmin" element={<LoanRequestsAdmin/>} />
                              
                               <Route path="/expenses" element={<ExpenseModule/>} />
                              <Route path="/staffcheck" element={<WarningModule/>} />
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
                              <Route 
                                path="/salaryadmin" 
                                element={
                                  <AuthRoute allowedRoles={['ADMIN']}>
                                    <SalaryAdvanceAdmin />
                                  </AuthRoute>
                                } 
                              />
                              <Route 
                                path="/adminconfirm" 
                                element={
                                  <AuthRoute allowedRoles={['ADMIN']}>
                                    <StaffSignupRequests selectedTown={selectedTown}/>
                                  </AuthRoute>
                                } 
                              />
                              <Route path="/recruitment" 
                              element={
                              <AuthRoute allowedRoles={['ADMIN','HR']}>
                                <RecruitmentDashboard selectedTown={selectedTown} /> 
                                   </AuthRoute>  } />
                              <Route path="/applications" element={<ApplicationsTable />} />
                              <Route path="/performance" element={<AuthRoute allowedRoles={['ADMIN']}>
                                <PerformanceDashboard selectedTown={selectedTown} />
                                </AuthRoute>} />
                              <Route path="/leaves" element={<LeaveManagementSystem selectedTown={selectedTown} />} />
                              <Route path="/training" element={<AdminVideoUpload/>} />
                              <Route path="/ai-assistant" element={<AIAssistantPage />} /> 
                              
                              <Route 
                                path="/videocall" 
                                element={
                                  <VideoConferenceComponent 
                                    onJoinMeeting={handleJoinMeeting} 
                                    isConnecting={connectionStatus === 'connecting'} 
                                  />
                                } 
                              />
                              <Route path="/fogs" element={<EmployeeDataTable selectedTown={selectedTown}/>} />
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </motion.div>
                        </AnimatePresence>
                      </main>
                      <Footer />
                    </div>
                  </div>
                </div>
              )
            } 
          />
        </Routes>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#fff',
              border: '1px solid #374151',
              borderRadius: '8px',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
              duration: 3000,
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
              duration: 5000,
            },
            loading: {
              iconTheme: {
                primary: '#3b82f6',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </ErrorBoundary>
    </UserProvider>
  );
}

export default App;