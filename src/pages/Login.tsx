import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isFetchingBranches, setIsFetchingBranches] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const navigate = useNavigate();

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

      if (userRole === 'ADMIN') {
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

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      if (!selectedBranch) {
        throw new Error('Please select your branch office');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'STAFF',
            branch: selectedBranch,
          },
          emailRedirectTo: `${window.location.origin}/staff`,
        },
      });

      if (error) throw error;

      setShowSuccessPopup(true);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setSelectedBranch('');
    } catch (error: any) {
      toast.error(error.message || 'Sign up failed');
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
      {/* Left side - Image/Graphics */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-r from-emerald-500 to-lime-600 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/leaf.png" 
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
            <p className="text-green-100">Smiles Start Here</p>
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
            <img src="/logo.png" alt="Company Logo" className="h-10 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-green-700 mb-2">Zira HR</h1>
            <p className="text-gray-600">smiles start here</p>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {isSignUp ? 'Create Staff Account' : 'Welcome back'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isSignUp ? 'Register with your company email' : 'Sign in to access your dashboard'}
            </p>
          </div>

          <form className="space-y-6" onSubmit={isSignUp ? handleStaffSignUp : handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@mularcredit.co.ke"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignUp ? "At least 8 characters" : "••••••••"}
              />
            </div>

            {isSignUp && (
              <>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label htmlFor="branch" className="block text-sm font-medium text-gray-700">
                    Branch Office
                  </label>
                  {isFetchingBranches ? (
                    <div className="mt-1 block h-3 w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-gray-100 animate-pulse">
                      Loading branches...
                    </div>
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
                          maxHeight: '200px',
                          overflow: 'auto'
                        }),
                        option: (base, { isFocused }) => ({
                          ...base,
                          backgroundColor: isFocused ? '#f0fdf4' : 'white',
                          color: '#1f2937',
                          '&:active': {
                            backgroundColor: '#dcfce7'
                          }
                        })
                      }}
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
              </>
            )}

            {!isSignUp && (
              <div>
                <label htmlFor="branch" className="block text-sm font-medium text-gray-700">
                  Branch Office
                </label>
                {isFetchingBranches ? (
                  <div className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-gray-100 animate-pulse">
                    Loading branches...
                  </div>
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
                        maxHeight: '200px',
                        overflow: 'auto'
                      }),
                      option: (base, { isFocused }) => ({
                        ...base,
                        backgroundColor: isFocused ? '#f0fdf4' : 'white',
                        color: '#1f2937',
                        '&:active': {
                          backgroundColor: '#dcfce7'
                        }
                      })
                    }}
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
                disabled={loading || isFetchingBranches}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 ${
                  loading || isFetchingBranches ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isSignUp ? 'Creating account...' : 'Signing in...'}
                  </>
                ) : (
                  isSignUp ? 'Create Staff Account' : 'Sign in'
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
                  setConfirmPassword('');
                  setSelectedBranch('');
                }}
                className="font-medium text-green-600 hover:text-green-500 transition-colors duration-200"
              >
                {isSignUp ? 'Sign in' : 'Create staff account'}
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
        message="Account created successfully! Please check your email to verify your account."
      />
    </div>
  );
}