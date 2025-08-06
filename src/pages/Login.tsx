import { useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success('Login successful!');
      // This will trigger a page reload after login
      window.location.reload();
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Image Section - Left Side */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-r from-emerald-500 to-lime-600 items-center justify-center p-12 relative overflow-hidden">
        {/* Background image with faint opacity */}
        <div className="absolute inset-0">
          <img 
            src="/leaf.png"  // Replace with your image path
            alt="Decorative background" 
            className="h-full w-full object-cover opacity-30" 
          />
        </div>
        
        {/* Logo at top left */}
        <div className="absolute top-8 left-8 z-10">
          <img 
            src="/logo1.png" 
            alt="Zira HR Logo" 
            className="h-24" 
          />
        </div>
        
        <div className="max-w-md text-white relative z-10">
          <div className="mb-8">
            <h1 className="text-4xl font-semibold mb-2">Zira<span className='font-light'>HR</span></h1>
            <p className="text-green-100">Smiles Start Here</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-3 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Streamline your HR processes</span>
            </div>
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-3 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Manage employees efficiently</span>
            </div>
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-3 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Automate payroll and benefits</span>
            </div>
          </div>
        </div>
      </div>

      {/* Login Form Section - Right Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo - Hidden on desktop */}
          <div className="text-center mb-8 lg:hidden">
            <img 
              src="/logo.png" 
              alt="Zira HR Logo" 
              className="h-10 mx-auto mb-4" 
            />
            <h1 className="text-3xl font-bold text-green-700 mb-2">Zira HR</h1>
            <p className="text-gray-600">smiles start here</p>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to access your dashboard
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
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
                className="mt-1 block w-full px-4 py-3 border border-gray-300  shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <a href="#" className="text-sm text-green-600 hover:text-green-500">
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors ${
                  loading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Don't have an account?{' '}
              <a href="#" className="font-medium text-green-600 hover:text-green-500">
                Contact admin
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}