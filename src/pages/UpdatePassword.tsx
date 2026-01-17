import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Check, X, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';

const UpdatePasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false
  });

  const navigate = useNavigate();
  const location = useLocation();

  const validatePasswordStrength = (pwd: string) => {
    setPasswordStrength({
      minLength: pwd.length >= 8,
      hasUppercase: /[A-Z]/.test(pwd),
      hasLowercase: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePasswordStrength(newPassword);
  };

  useEffect(() => {
    const checkRecoverySession = async () => {
      try {
        setIsValidating(true);
        console.log('🔄 Validating update password session...');

        // 1. Force a session refresh to be absolutely sure we have the latest auth state
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('❌ Session error:', sessionError.message);
        }

        // 2. Double check URL for PKCE 'code' just in case AuthCallback was skipped
        const urlParams = new URLSearchParams(window.location.search || window.location.hash.replace('#', '?'));
        const code = urlParams.get('code');
        const type = urlParams.get('type') || urlParams.get('error') ? 'error' : null;

        if (code && !session) {
          console.log('🔑 Found un-exchanged code, attempting recovery exchange...');
          const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (!exchangeError && exchangeData.session) {
            console.log('✅ Recovery exchange successful');
            setIsValidSession(true);
            setIsValidating(false);
            return;
          }
        }

        // 3. Status Check
        const isRecoveryFlag = sessionStorage.getItem('isPasswordRecovery') === 'true';
        console.log('👤 Current session:', !!session, 'Recovery flag:', isRecoveryFlag);

        if (session || isRecoveryFlag) {
          setIsValidSession(true);
        } else {
          console.warn('⚠️ No valid recovery session found');
        }

      } catch (err) {
        console.error('💥 Unexpected validation error:', err);
      } finally {
        setIsValidating(false);
      }
    };

    checkRecoverySession();
  }, [location, navigate]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const allRequirementsMet = Object.values(passwordStrength).every(req => req === true);
    if (!allRequirementsMet) {
      toast.error('Please meet all password requirements');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        toast.error(error.message);
      } else {
        sessionStorage.removeItem('isPasswordRecovery');
        toast.success('Password successfully updated! Please login.');

        await supabase.auth.signOut();
        navigate('/login', { replace: true });
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center p-12 bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center">
          <Loader2 className="animate-spin h-12 w-12 text-green-500 mb-6" />
          <h2 className="text-xl font-bold text-gray-900">Validating Request</h2>
          <p className="mt-2 text-sm text-gray-500 max-w-[250px]">Setting up a secure channel for your password update...</p>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full text-center p-10 bg-white rounded-3xl shadow-2xl border border-red-50 border-t-4 border-t-red-500">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Expired</h2>
          <p className="text-gray-600 mb-8 text-sm leading-relaxed">
            Your security link has already been used or has expired. For your protection, password reset links are only valid for a single use.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all active:scale-[0.98] shadow-lg shadow-gray-200"
          >
            <ArrowLeft size={20} />
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-3xl shadow-2xl border border-gray-100">
        <div className="text-center">
          <div className="inline-block p-4 bg-green-50 rounded-2xl mb-4">
            <ShieldCheck className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Security Update
          </h2>
          <p className="mt-2 text-sm text-gray-500 font-medium font-serif italic">
            "Your security is our priority"
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handlePasswordUpdate}>
          <div className="space-y-6">
            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                New Secure Password
              </label>
              <input
                type="password"
                required
                autoFocus
                className="block w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all outline-none font-medium text-gray-900 placeholder-gray-300 shadow-sm"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
              />

              <div className="mt-5 p-5 bg-gray-50 rounded-2xl border border-gray-100/50 space-y-3">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.1em] mb-1">Protection Requirements</p>
                <div className="grid grid-cols-1 gap-2">
                  <CheckItem label="Minimum 8 characters long" met={passwordStrength.minLength} />
                  <CheckItem label="Includes uppercase (A-Z)" met={passwordStrength.hasUppercase} />
                  <CheckItem label="Includes lowercase (a-z)" met={passwordStrength.hasLowercase} />
                  <CheckItem label="Includes a number (0-9)" met={passwordStrength.hasNumber} />
                  <CheckItem label="Includes special character (@#$)" met={passwordStrength.hasSpecial} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                Confirm Password
              </label>
              <input
                type="password"
                required
                className="block w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all outline-none font-medium text-gray-900 placeholder-gray-300 shadow-sm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-green-200/50 hover:translate-y-[-2px] active:translate-y-[0px]"
          >
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5 text-white" />
            ) : (
              'Save & Secure Account'
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={() => navigate('/login')}
            className="text-xs font-bold text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1.5 mx-auto transition-colors"
          >
            <ArrowLeft size={14} />
            Discard and return to login
          </button>
        </div>
      </div>
    </div>
  );
};

const CheckItem = ({ label, met }: { label: string, met: boolean }) => (
  <div className={`flex items-center text-[11px] font-bold transition-all duration-300 ${met ? 'text-green-600 translate-x-1' : 'text-gray-400'}`}>
    {met ? (
      <div className="bg-green-100 p-0.5 rounded-full mr-2.5">
        <Check size={11} strokeWidth={4} />
      </div>
    ) : (
      <div className="w-3.5 h-3.5 border-2 border-gray-200 rounded-full mr-2.5" />
    )}
    {label}
  </div>
);

export default UpdatePasswordPage;