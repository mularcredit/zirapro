import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import AddEmployeePage from '../src/components/Add Form/AddEmployeePage';
import ViewEmployeePage from '../src/components/view_form/EmployeeDetails';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import AddEmployeePages from './components/Payroll/fog';
import SuccessPage from './components/Add Form/SuccessPage';
import Dashboard from './components/Dashboard/Dashboard';
import EmployeeList from './components/Employees/EmployeeList';
import PayrollDashboard from './components/Payroll/PayrollDashboard';
import RecruitmentDashboard from './components/Recruitment/RecruitmentDashboard';
import LeaveManagementSystem from './components/Leave/LeaveManagement';
import EditEmployeePage from './components/Add Form/EditEmployee';
import { AIAssistantPage } from './components/AI/AIAssistantPage';
import toast, { Toaster } from 'react-hot-toast';
import PerformanceDashboard from './components/Perfomance/PerfomanceDashboard';
import { supabase } from './lib/supabase';
import Login from '../src/pages/Login';

function App() {
  
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const [session, setSession] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningShownRef = useRef(false);
  const lastActivityRef = useRef(Date.now());

  const handleLogout = useCallback(async () => {
    console.log('Logging out due to inactivity...');
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    warningShownRef.current = false;

    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Logged out due to inactivity');
      setUser(null);
      setSession(null);
      // Only navigate if not already on root path
      if (location.pathname !== '/') {
        navigate('/');
      }
    }
    toast.dismiss();
  }, [navigate, location.pathname]);

  const clearTimers = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    warningShownRef.current = false;
    toast.dismiss('inactivity-warning');
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (!session) return;

    console.log('Resetting inactivity timer...');
    lastActivityRef.current = Date.now();
    clearTimers();

    // Show warning after 29 minutes (1740000ms = 29 minutes)
    warningTimerRef.current = setTimeout(() => {
      if (!warningShownRef.current && session) {
        toast('You will be logged out due to inactivity in 1 minute', {
          icon: '⚠️',
          id: 'inactivity-warning',
          duration: 60000, // Show warning for 1 minute
        });
        warningShownRef.current = true;
      }
    }, 1740000); // 29 minutes

    // Log out after 30 minutes (1800000ms = 30 minutes)
    inactivityTimerRef.current = setTimeout(() => {
      if (session) {
        handleLogout();
      }
    }, 1800000); // 30 minutes
  }, [session, handleLogout, clearTimers]);

  const lastResetRef = useRef(0);

  const handleActivity = useCallback(() => {
    const now = Date.now();
    // Throttle activity handling more aggressively to prevent excessive resets
    if (now - lastResetRef.current > 5000) { // Changed from 1000ms to 5000ms
      lastResetRef.current = now;
      resetInactivityTimer();
    }
  }, [resetInactivityTimer]);

  const handleLoginSuccess = useCallback(() => {
    // Navigate to home page after successful login
    navigate('/dashboard');
    window.location.reload();
  }, [navigate]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthChecked(true);

      if (session?.user?.email) {
        setUser({ email: session.user.email, role: 'administrator' });
        // Only navigate to dashboard on initial load if not already on a valid route
        if (location.pathname === '/' || location.pathname === '/login') {
          navigate('/dashboard');
        }
        setTimeout(() => resetInactivityTimer(), 100);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setAuthChecked(true);

      if (session?.user?.email) {
        setUser({ email: session.user.email, role: 'administrator' });
        // Only navigate to dashboard on sign in, not on token refresh
        if (event === 'SIGNED_IN' && (location.pathname === '/' || location.pathname === '/login')) {
          navigate('/dashboard');
        }
        setTimeout(() => resetInactivityTimer(), 100);
      } else {
        setUser(null);
        clearTimers();
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimers();
    };
  }, [navigate, location.pathname, clearTimers]);

  useEffect(() => {
    if (!session) return;

    const events = ['mousedown', 'keypress', 'click']; // Removed mousemove and scroll to reduce frequency
    const handleActivityThrottled = (e) => {
      // Avoid handling activity during text selection or input focus
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }
      handleActivity();
    };

    events.forEach(event => document.addEventListener(event, handleActivityThrottled, { passive: true }));

    return () => {
      events.forEach(event => document.removeEventListener(event, handleActivityThrottled));
    };
  }, [session, handleActivity]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const renderContent = () => {
    if (!authChecked) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      );
    }

    if (!session) {
      return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    return (
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<EmployeeList />} />
        <Route path="/payroll" element={<PayrollDashboard />} />
        <Route path="/recruitment" element={<RecruitmentDashboard />} />
        <Route path="/performance" element={<PerformanceDashboard />} />
        <Route path="/fog" element={<AddEmployeePages />} />
        <Route path="/add-employee" element={<AddEmployeePage />} />
        <Route path="/view-employee/:id" element={<ViewEmployeePage />} />
        <Route path="/employee-added" element={<SuccessPage />} />
        <Route path="/edit-employee/:id" element={<EditEmployeePage />} />
        <Route path="/ai-assistant" element={<AIAssistantPage />} />
        <Route path="/leaves" element={<LeaveManagementSystem/> } />
        <Route path="/training" element={
          <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-4">Training & Development</h1>
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-8 text-center">
              <p className="text-gray-400">Training management module coming soon...</p>
            </div>
          </div>
        } />
        <Route path="/reports" element={
          <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-4">Reports & Analytics</h1>
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-8 text-center">
              <p className="text-gray-400">Reports module coming soon...</p>
            </div>
          </div>
        } />
        <Route path="/settings" element={
          <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-4">System Settings</h1>
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-8 text-center">
              <p className="text-gray-400">Settings module coming soon...</p>
            </div>
          </div>
        } />
      </Routes>
    );
  };

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {session ? (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-100/30 via-transparent to-transparent"></div>

          <div className="relative flex">
            <Sidebar/>

            <div className="flex-1">
              <Header user={user} onLogout={handleLogout} />

              <main className="overflow-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderContent()}
                  </motion.div>
                </AnimatePresence>
              </main>
            </div>
          </div>
        </>
      ) : (
        <Routes>
          <Route path="*" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        </Routes>
      )}

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