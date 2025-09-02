import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface MFAData {
  userId: string;
  email: string;
  userRole: string;
  branch: string;
  session: any;
}

export default function MFAVerification() {
  const [codes, setCodes] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [userRole, setUserRole] = useState('');
  const [branch, setBranch] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState(0);
  const [countdown, setCountdown] = useState(0);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check if user is already locked out
    const lockUntil = localStorage.getItem('mfaLockUntil');
    if (lockUntil && parseInt(lockUntil) > Date.now()) {
      setIsLocked(true);
      setLockTime(parseInt(lockUntil));
      return;
    }

    // Retrieve MFA data from sessionStorage
    const mfaData = sessionStorage.getItem('mfaData');
    if (mfaData) {
      try {
        const parsedData: MFAData = JSON.parse(mfaData);
        setEmail(parsedData.email);
        setUserId(parsedData.userId);
        setUserRole(parsedData.userRole);
        setBranch(parsedData.branch);
        
        // Restore session if available
        if (parsedData.session) {
          supabase.auth.setSession(parsedData.session);
        }
      } catch (error) {
        console.error('Error parsing MFA data:', error);
        toast.error('Invalid session data');
        navigate('/login');
      }
    } else {
      // If no MFA data found, check URL parameters for redirect
      const redirectEmail = searchParams.get('email');
      const redirectUserId = searchParams.get('userId');
      
      if (redirectEmail && redirectUserId) {
        setEmail(redirectEmail);
        setUserId(redirectUserId);
        
        // Try to get additional data from localStorage as fallback
        const fallbackData = localStorage.getItem(`mfa_${redirectUserId}`);
        if (fallbackData) {
          try {
            const parsedData = JSON.parse(fallbackData);
            setUserRole(parsedData.userRole || 'CHECKER');
            setBranch(parsedData.branch || '');
          } catch (error) {
            console.error('Error parsing fallback data:', error);
          }
        }
      } else {
        // If no MFA data found, redirect back to login
        toast.error('Session expired. Please login again.');
        navigate('/login');
      }
    }

    // Set countdown for resend button (30 seconds)
    setCountdown(30);
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [navigate, searchParams]);

  // Handle lockout timer
  useEffect(() => {
    if (!isLocked) return;

    const interval = setInterval(() => {
      const remainingTime = lockTime - Date.now();
      if (remainingTime <= 0) {
        setIsLocked(false);
        localStorage.removeItem('mfaLockUntil');
        localStorage.removeItem('mfaAttemptCount');
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked, lockTime]);

  const handleCodeChange = (index: number, value: string) => {
    if (isLocked) return;
    
    // Only allow digits
    if (!/^\d*$/.test(value)) return;
    
    const newCodes = [...codes];
    newCodes[index] = value;
    setCodes(newCodes);
    
    // Auto-focus to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // If all digits are entered, submit the form
    if (newCodes.every(code => code !== '') && index === 5) {
      handleVerification(newCodes.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !codes[index] && index > 0) {
      // Move focus to previous input on backspace
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').split('').slice(0, 6);
    
    if (digits.length === 6) {
      const newCodes = [...codes];
      digits.forEach((digit, index) => {
        newCodes[index] = digit;
      });
      setCodes(newCodes);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerification = async (fullCode: string) => {
    if (isLocked) {
      toast.error(`Please wait ${Math.ceil((lockTime - Date.now()) / 1000)} seconds before trying again`);
      return;
    }

    if (!fullCode || fullCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-mfa-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          userId,
          code: fullCode
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Verification failed');
      }

      if (result.success) {
        // Reset attempt count on success
        localStorage.removeItem('mfaAttemptCount');
        localStorage.removeItem('mfaLockUntil');
        
        // Clear MFA data
        sessionStorage.removeItem('mfaData');
        localStorage.removeItem(`mfa_${userId}`);
        
        toast.success('Verification successful!');
        
        // Navigate based on role
        if (userRole === 'CHECKER') {
          navigate('/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        // Increment attempt count
        const newAttemptCount = attemptCount + 1;
        setAttemptCount(newAttemptCount);
        localStorage.setItem('mfaAttemptCount', newAttemptCount.toString());
        
        if (newAttemptCount >= 5) {
          // Lock user out for 5 minutes
          const lockUntil = Date.now() + 5 * 60 * 1000;
          setIsLocked(true);
          setLockTime(lockUntil);
          localStorage.setItem('mfaLockUntil', lockUntil.toString());
          toast.error('Too many failed attempts. Please try again in 5 minutes.');
        } else {
          throw new Error(`Invalid verification code. ${5 - newAttemptCount} attempts remaining`);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (isLocked || countdown > 0) {
      toast.error(`Please wait ${countdown} seconds before requesting a new code`);
      return;
    }

    setResendLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-mfa-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          userId,
          email
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to resend code');
      }

      // Reset countdown
      setCountdown(30);
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      toast.success('Verification code resent successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToLogin = () => {
    // Clear all MFA related data
    sessionStorage.removeItem('mfaData');
    localStorage.removeItem(`mfa_${userId}`);
    localStorage.removeItem('mfaAttemptCount');
    localStorage.removeItem('mfaLockUntil');
    
    // Sign out any existing session
    supabase.auth.signOut();
    
    navigate('/login');
  };

  const formatTimeRemaining = () => {
    const seconds = Math.ceil((lockTime - Date.now()) / 1000);
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex justify-center mb-6">
            <div className="bg-green-900 p-4 rounded-full">
              {/* Your Logo - Replace with your actual logo */}
              <img 
                src="/logo.png" 
                alt="Company Logo" 
                className="h-12 w-12 object-contain"
              />
            </div>
          </div>
          
          <h2 className="mt-4 text-center text-3xl font-bold text-gray-900">
            Verify Your Identity
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the 6-digit verification code sent to
          </p>
          <p className="text-center text-sm font-medium text-green-600">
            {email}
          </p>
          
          {isLocked && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-center">
              <p className="text-sm font-medium">Account temporarily locked</p>
              <p className="text-sm">Please try again in {formatTimeRemaining()}</p>
            </div>
          )}
          
          <form className="mt-8 space-y-6" onSubmit={(e) => {
            e.preventDefault();
            handleVerification(codes.join(''));
          }}>
            <div className="flex justify-center space-x-3">
              {codes.map((code, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={code}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={loading || isLocked}
                  className="w-12 h-12 text-center text-2xl font-semibold bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || isLocked || codes.some(code => code === '')}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  'Verify Code'
                )}
              </button>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={handleBackToLogin}
                className="text-sm text-green-600 hover:text-green-500 font-medium flex items-center transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Login
              </button>
              
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendLoading || isLocked || countdown > 0}
                className="text-sm text-green-600 hover:text-green-500 font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {resendLoading ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="text-center text-xs text-gray-500">
          <p>Having trouble receiving the code?</p>
          <p className="mt-1">Check your spam folder or contact support</p>
        </div>
      </div>
    </div>
  );
}