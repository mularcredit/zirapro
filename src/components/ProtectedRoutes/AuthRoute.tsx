// src/components/AuthRoute.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface AuthRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function AuthRoute({ children, allowedRoles }: AuthRouteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        navigate('/login');
        return;
      }

      const userRole = user.user_metadata?.role || 'STAFF';
      
      if (allowedRoles && !allowedRoles.includes(userRole)) {
        // Redirect based on role
        if (userRole === 'ADMIN') {
          navigate('/dashboard');
        } else if (userRole === 'MANAGER') {
          navigate('/manager-dashboard');
        } else {
          navigate('/staff');
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, allowedRoles]);

  return <>{children}</>;
}