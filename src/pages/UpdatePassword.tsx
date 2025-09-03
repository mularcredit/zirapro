// REPLACE your entire UpdatePasswordPage.js file with this:

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const UpdatePasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a valid session and this is a password recovery
    const checkRecoverySession = async () => {
      const isPasswordRecovery = sessionStorage.getItem('isPasswordRecovery') === 'true';
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('UpdatePasswordPage - Recovery flag:', isPasswordRecovery, 'Session:', !!session);
      
      if (!session) {
        toast.error('Invalid or expired reset link');
        navigate('/login', { replace: true });
        return;
      }
      
      if (!isPasswordRecovery) {
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

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
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
        console.log('Password updated successfully, clearing recovery flag');
        
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
          <p className="mt-2 text-center text-sm text-gray-600">
            Please enter your new password below
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handlePasswordUpdate}>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              minLength={6}
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
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
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
            onClick={() => {
              sessionStorage.removeItem('isPasswordRecovery');
              navigate('/login');
            }}
            className="text-sm text-green-600 hover:text-green-500"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdatePasswordPage;