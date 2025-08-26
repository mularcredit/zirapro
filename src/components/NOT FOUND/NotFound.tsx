import { useNavigate } from 'react-router-dom';
import GlowButton from '../UI/GlowButton';
import { HomeIcon, ShieldAlert, Mail } from 'lucide-react';

export default function Unauthorized() {
  const navigate = useNavigate();

  const handleContactAdmin = () => {
    // Implement your contact admin logic here
    // This could open a modal, compose an email, etc.
    console.log('Contact admin functionality');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center border border-gray-200 shadow-lg">
        {/* Icon */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-ping absolute h-24 w-24 rounded-full bg-red-100 opacity-40"></div>
          </div>
          <ShieldAlert className="h-24 w-24 text-gray-300 mx-auto relative" />
        </div>
        
        {/* Access Denied Text */}
        <div className="space-y-4">
          <h1 className="text-2xl font-light text-gray-800">Access Denied</h1>
          <p className="text-gray-600 text-sm font-light max-w-xs mx-auto">
            You don't have permission to view this page. Please contact your administrator for access.
          </p>
          
          {/* Action Buttons */}
          <div className="pt-6 flex flex-col gap-3">
            <GlowButton
              onClick={() => navigate('/')}
              icon={HomeIcon}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-300"
            >
              Return Home
            </GlowButton>
            
            <button
              onClick={handleContactAdmin}
              className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-md transition-colors duration-300 hover:bg-gray-100 border border-gray-300"
            >
              <Mail className="h-4 w-4" />
              Contact Administrator
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-12 text-xs text-gray-400">
        
      </div>
    </div>
  );
}