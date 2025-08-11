import { useNavigate } from 'react-router-dom';
import GlowButton from '../UI/GlowButton';
import { HomeIcon } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg p-8 text-center border border-gray-100 shadow-sm">
        <div className="text-gray-300 mb-6">
          <span className="text-7xl font-light tracking-tighter">4</span>
          <span className="text-7xl font-light tracking-tighter inline-block mx-2">0</span>
          <span className="text-7xl font-light tracking-tighter">4</span>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-xl font-normal text-gray-500">Page not found</h1>
          <p className="text-gray-400 text-sm font-light max-w-xs mx-auto">
            The requested page doesn't exist or has been moved
          </p>
          
          <div className="pt-6">
            <GlowButton
              onClick={() => navigate('/')}
              icon={HomeIcon}
              className="px-5 py-2.5 bg-gray-500 border-black hover:bg-gray-300 text-white text-sm font-light rounded-md transition-colors duration-300"
            >
              Return home
            </GlowButton>
          </div>
        </div>
      </div>
      
      <div className="mt-12 text-xs text-gray-300">
        <p>HTTP 404 · Not Found</p>
      </div>
    </div>
  );
}