import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Select from 'react-select';

interface LoginProps {
  onLoginSuccess: (selectedTown: string, userRole: string) => void;
}

interface Branch {
  'Branch Office': string;
}

interface SuccessPopupProps {
  show: boolean;
  onClose: () => void;
  message: string;
}

function SuccessPopup({ show, onClose, message }: SuccessPopupProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-medium text-green-600">Success!</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="Close popup"
          >
            &times;
          </button>
        </div>
        <p className="text-gray-700">{message}</p>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isFetchingBranches, setIsFetchingBranches] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isBranchAutoPopulated, setIsBranchAutoPopulated] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Admin emails that should skip branch auto-detection
  const ADMIN_EMAILS = [
    'admin@mularcredit.co.ke',
    'hr@mularcredit.co.ke',
    'it@mularcredit.co.ke'
  ];

  const isAdminEmail = (email: string) => {
    return ADMIN_EMAILS.includes(email.toLowerCase());
  };

  // Check for email confirmation redirect
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (data.session && searchParams.get('type') === 'signup') {
        toast.success('Email verified successfully! Welcome to Zira HR.');
        navigate('/');
      }
    };

    checkSession();
  }, [navigate, searchParams]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const { data, error } = await supabase
          .from('kenya_branches')
          .select('"Branch Office"')
          .order('Branch Office', { ascending: true });

        if (error) throw error;
        setBranches(data || []);
      } catch (error) {
        console.error('Error fetching branches:', error);
        toast.error('Failed to load branch offices');
      } finally {
        setIsFetchingBranches(false);
      }
    };

    fetchBranches();
  }, []);

  // Function to check if email already exists
  const checkEmailExists = async (email: string) => {
    if (!email) return false;
    
    setIsCheckingEmail(true);
    try {
      // Check auth.users table
      const { data: authData, error: authError } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();

      if (authData) {
        setEmailExists(true);
        return true;
      }

      // Check pending signup requests
      const { data: signupData, error: signupError } = await supabase
        .from('staff_signup_requests')
        .select('email')
        .eq('email', email)
        .eq('status', 'pending')
        .single();

      if (signupData) {
        setEmailExists(true);
        return true;
      }

      setEmailExists(false);
      return false;
    } catch (error) {
      console.error('Error checking email:', error);
      setEmailExists(false);
      return false;
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Function to fetch branch from employee email
  const fetchBranchFromEmail = async (email: string) => {
    if (!email.endsWith('@mularcredit.co.ke') || isAdminEmail(email)) {
      setIsBranchAutoPopulated(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('employees')
        .select('Office')
        .eq('Work Email', email)
        .single();

      if (error) throw error;
      
      if (data && data.Office) {
        setSelectedBranch(data.Office);
        setIsBranchAutoPopulated(true);
      } else {
        setIsBranchAutoPopulated(false);
      }
    } catch (error) {
      console.error('Error fetching employee branch:', error);
      setIsBranchAutoPopulated(false);
    }
  };

  // Handle email change with debounce
  useEffect(() => {
    if (!email) {
      setIsBranchAutoPopulated(false);
      setEmailExists(false);
      return;
    }

    const timer = setTimeout(() => {
      fetchBranchFromEmail(email);
      if (isSignUp) {
        checkEmailExists(email);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [email, isSignUp]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const userRole = data.user?.user_metadata?.role || 'STAFF';

      if (userRole === 'ADMIN' || isAdminEmail(email)) {
        toast.success('Admin login successful!');
        onLoginSuccess('ADMIN_ALL', userRole);
        navigate('/dashboard');
        return;
      }

      if (!selectedBranch) {
        throw new Error('Please select your branch office');
      }

      toast.success('Login successful!');
      onLoginSuccess(selectedBranch, userRole);
      
      if (userRole === 'STAFF') {
        navigate('/staff');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      if (error.message === 'Please select your branch office') {
        await supabase.auth.signOut();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStaffSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!email.endsWith('@mularcredit.co.ke')) {
        throw new Error('Only company email addresses are allowed for sign up');
      }

      if (isAdminEmail(email)) {
        throw new Error('Admin accounts must be created by system administrators');
      }

      if (!selectedBranch && !isAdminEmail(email)) {
        throw new Error('Please select your branch office');
      }

      // Check if email exists one more time right before submission
      const emailAlreadyExists = await checkEmailExists(email);
      if (emailAlreadyExists) {
        throw new Error('This email is already registered or has a pending request');
      }

      // Submit signup request to admin (no password needed)
      const { data, error } = await supabase
        .from('staff_signup_requests')
        .insert([
          {
            email,
            branch: isAdminEmail(email) ? 'HEAD_OFFICE' : selectedBranch,
            status: 'pending'
          }
        ]);

      if (error) throw error;

      setShowSuccessPopup(true);
      setEmail('');
      setSelectedBranch('');
      setIsBranchAutoPopulated(false);
    } catch (error: any) {
      toast.error(error.message || 'Sign up request failed');
    } finally {
      setLoading(false);
    }
  };

  const branchOptions = branches.map(branch => ({
    value: branch['Branch Office'],
    label: branch['Branch Office']
  }));

  return (
    <div className="flex min-h-screen">
      {/* Left side - Modern Design */}
      <div className="hidden lg:flex w-1/2 bg-black bg-opacity-80 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/leaf.jpg" 
            alt="Decorative background" 
            className="h-full w-full object-cover opacity-30" 
          />
        </div>
        
        <div className="absolute top-8 left-8 z-10">
          <img src="/solo.png" alt="Company Logo" className="h-24" />
        </div>
        
        <div className="max-w-md text-white relative z-10">
          <div className="mb-8">
            <h1 className="text-4xl font-semibold mb-2">Zira<span className="font-light">HR</span></h1>
            <p className="text-lime-300 font-semibold">Smiles Start Here</p>
          </div>
          
          <div className="space-y-4">
            {['Streamline your HR processes', 'Manage employees efficiently', 'Automate payroll and benefits'].map((item) => (
              <div key={item} className="flex items-center">
                <svg className="w-6 h-6 mr-3 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <img src="/logo.png" alt="Company Logo" className="h-16 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-green-700 mb-2">ZiraHr</h1>
            <p className="text-gray-600 italic">smiles start here</p>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {isSignUp ? 'Request Staff Account' : 'Welcome back'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isSignUp ? 'Submit your details for account approval' : 'Sign in with your credentials'}
            </p>
          </div>

          <form className="space-y-6" onSubmit={isSignUp ? handleStaffSignUp : handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`mt-1 block w-full px-4 py-3 border ${emailExists && isSignUp ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@mularcredit.co.ke"
                />
                {isCheckingEmail && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
              {emailExists && isSignUp && (
                <p className="mt-1 text-sm text-red-600">This email is already registered or has a pending request</p>
              )}
            </div>

            {/* Only show password field for login, not signup */}
            {!isSignUp && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            )}

            {/* Show branch selection for both login and signup, except for admin emails */}
            {!isAdminEmail(email) && (
              <div className="relative z-20">
                <label htmlFor="branch" className="block text-sm font-medium text-gray-700">
                  Branch Office
                  {isBranchAutoPopulated && (
                    <span className="ml-2 text-xs text-green-600">(Auto-detected from your email)</span>
                  )}
                </label>
                {isFetchingBranches ? (
                  <div className="mt-1 block h-3 w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-gray-100 animate-pulse">
                    Loading branches...
                  </div>
                ) : isBranchAutoPopulated ? (
                  <input
                    type="text"
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                    value={selectedBranch}
                    readOnly
                  />
                ) : (
                  <Select
                    id="branch"
                    name="branch"
                    options={branchOptions}
                    className="mt-1 text-sm"
                    classNamePrefix="select"
                    placeholder="Select or type to search..."
                    isSearchable
                    isLoading={isFetchingBranches}
                    value={selectedBranch ? { value: selectedBranch, label: selectedBranch } : null}
                    onChange={(selectedOption) => {
                      setSelectedBranch(selectedOption?.value || '');
                    }}
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: '48px',
                        borderColor: '#d1d5db',
                        '&:hover': {
                          borderColor: '#9ca3af'
                        },
                        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 30,
                        maxHeight: '200px',
                        overflow: 'auto'
                      }),
                      menuPortal: base => ({ ...base, zIndex: 9999 }),
                      option: (base, { isFocused }) => ({
                        ...base,
                        backgroundColor: isFocused ? '#f0fdf4' : 'white',
                        color: '#1f2937',
                        '&:active': {
                          backgroundColor: '#dcfce7'
                        }
                      })
                    }}
                    menuPortalTarget={document.body}
                    menuPosition={'fixed'}
                    theme={(theme) => ({
                      ...theme,
                      colors: {
                        ...theme.colors,
                        primary: '#10b981',
                        primary25: '#dcfce7',
                        primary50: '#bbf7d0'
                      }
                    })}
                  />
                )}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading || isFetchingBranches || (isSignUp && emailExists)}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading || isFetchingBranches || (isSignUp && emailExists) 
                    ? 'bg-green-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isSignUp ? 'Submitting...' : 'Signing in...'}
                  </>
                ) : (
                  isSignUp ? 'Request Account' : 'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setEmail('');
                  setPassword('');
                  setSelectedBranch('');
                  setIsBranchAutoPopulated(false);
                  setEmailExists(false);
                }}
                className="font-medium text-green-600 hover:text-green-500 transition-colors duration-200"
              >
                {isSignUp ? 'Sign in' : 'Request account'}
              </button>
            </p>
          </div>
        </div>
      </div>

      <SuccessPopup
        show={showSuccessPopup}
        onClose={() => {
          setShowSuccessPopup(false);
          setIsSignUp(false);
        }}
        message="Your account request has been submitted. An admin will create your account and provide you with login credentials."
      />
    </div>
  );
}