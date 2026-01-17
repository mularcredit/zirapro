import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        // Handle the auth callback
        const handleAuthCallback = async () => {
            try {
                // Get the hash from the URL
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const type = hashParams.get('type');

                console.log('AuthCallback - Type:', type);

                if (type === 'recovery') {
                    // For password recovery, just redirect to update-password
                    // Supabase will have already processed the token
                    console.log('✅ Recovery detected, redirecting to update-password');
                    navigate('/update-password', { replace: true });
                } else {
                    // For other auth types (signup confirmation, etc.)
                    navigate('/login', { replace: true });
                }
            } catch (error) {
                console.error('Auth callback error:', error);
                navigate('/login', { replace: true });
            }
        };

        handleAuthCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Processing authentication...</p>
            </div>
        </div>
    );
}
