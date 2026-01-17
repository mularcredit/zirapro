// REPLACE your entire UpdatePasswordPage.js file with this:

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Check, X } from 'lucide-react';

const UpdatePasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false
  });

  const navigate = useNavigate();

  // Validate password strength
  const validatePasswordStrength = (pwd: string) => {
    setPasswordStrength({
      minLength: pwd.length >= 8,
      hasUppercase: /[A-Z]/.test(pwd),
      hasLowercase: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    });
  };

  // Update password and validate strength
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePasswordStrength(newPassword);
  };

  useEffect(() => {
    // Check if we have a valid session and this is a password recovery
    const checkRecoverySession = async () => {
      // IMPORTANT: Supabase puts recovery tokens in the URL HASH, not query params
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get('type');
      const accessToken = hashParams.get('access_token');
      const isRecoveryFromURL = type === 'recovery' && accessToken;

      // Also check sessionStorage flag as backup
      const isPasswordRecovery = sessionStorage.getItem('isPasswordRecovery') === 'true';

      console.log('UpdatePasswordPage - Hash type:', type, 'Has token:', !!accessToken, 'SessionStorage:', isPasswordRecovery);

      // If this is a recovery link from URL, set the flag
      if (isRecoveryFromURL) {
        console.log('✅ Recovery detected from URL hash - setting flag');
        sessionStorage.setItem('isPasswordRecovery', 'true');
      }

      // Wait for session to be established (Supabase auto-login takes a moment)
      // Check for session more persistently (wait up to 10s)
      let session = null;
      let attempts = 0;
      const maxAttempts = 50; // Try for up to 10 seconds

      while (!session && attempts < maxAttempts) {
        const { data } = await supabase.auth.getSession();
        session = data.session;

        if (!session) {
          // Wait 200ms before trying again
          await new Promise(resolve => setTimeout(resolve, 200));
          attempts++;
        }
      }

      console.log('UpdatePasswordPage - Session:', !!session, 'Attempts:', attempts);

      if (!session) {
        toast.error('Invalid or expired reset link');
        navigate('/login', { replace: true });
        return;
      }

      // Allow access if EITHER URL shows recovery OR sessionStorage flag is set
      const isPasswordRecoveryFlag = sessionStorage.getItem('isPasswordRecovery') === 'true';

      console.log('UpdatePasswordPage - Final Check - Recovery from URL:', isRecoveryFromURL, 'Flag:', isPasswordRecoveryFlag);

      if (!isRecoveryFromURL && !isPasswordRecovery && !isPasswordRecoveryFlag) {
        // User navigated here directly without password recovery, redirect to dashboard
        toast.error('Access denied. Please use the password reset link from your email.');
        const userRole = session.user.user_metadata?.role || 'STAFF';
        const targetPath = userRole === 'STAFF' ? '/staff' : '/dashboard';
        navigate(targetPath, { replace: true });
        return;
      }

      setIsValidSession(true);
    };

    checkRecoverySession();
  }, [navigate]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Check all password strength requirements
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
        // Clear the recovery flag
        sessionStorage.removeItem('isPasswordRecovery');

        toast.success('Password updated successfully! Please sign in with your new password.');

        // Sign out the user after password update
        await supabase.auth.signOut();

        // Redirect to login
        navigate('/login', { replace: true });
      }
    } catch (error) {
      console.error('Password update error:', error);
      toast.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validating session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Update Your Password
          </h2>
          <p className="mt-2 text-center text-xs text-gray-600">
            Please enter your new password below
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handlePasswordUpdate}>
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-gray-700">
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter new password"
            />
            <div className="mt-3 space-y-1.5 bg-gray-50 p-3 rounded-md border border-gray-200">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-2">Security Requirements</p>

              <div className="space-y-1">
                <div className={`flex items-center text-[11px] ${passwordStrength.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordStrength.minLength ? <Check size={12} className="mr-1.5" /> : <X size={12} className="mr-1.5 text-gray-300" />}
                  <span>Minimum 8 characters</span>
                </div>

                <div className={`flex items-center text-[11px] ${passwordStrength.hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordStrength.hasUppercase ? <Check size={12} className="mr-1.5" /> : <X size={12} className="mr-1.5 text-gray-300" />}
                  <span>Uppercase letter (A-Z)</span>
                </div>

                <div className={`flex items-center text-[11px] ${passwordStrength.hasLowercase ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordStrength.hasLowercase ? <Check size={12} className="mr-1.5" /> : <X size={12} className="mr-1.5 text-gray-300" />}
                  <span>Lowercase letter (a-z)</span>
                </div>

                <div className={`flex items-center text-[11px] ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordStrength.hasNumber ? <Check size={12} className="mr-1.5" /> : <X size={12} className="mr-1.5 text-gray-300" />}
                  <span>At least one number (0-9)</span>
                </div>

                <div className={`flex items-center text-[11px] ${passwordStrength.hasSpecial ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordStrength.hasSpecial ? <Check size={12} className="mr-1.5" /> : <X size={12} className="mr-1.5 text-gray-300" />}
                  <span>Special character (!@#$%^&*)</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              minLength={6}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-xs text-green-600 hover:text-green-500"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdatePasswordPage;