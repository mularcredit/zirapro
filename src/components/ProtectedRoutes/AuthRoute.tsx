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
        switch (userRole) {
          case 'ADMIN':
            navigate('/dashboard');
            break;
          case 'MANAGER':
            navigate('/manager-dashboard');
            break;
            case 'REGIONAL':
            navigate('/regional-dashboard');
            break;
             case 'OPERATIONS':
            navigate('/operations-dashboard');
            break;
            case 'CHECKER':
            navigate('/checker-dashboard');
            break;
          case 'HR':
            navigate('/hr-dashboard');
            break;
          default:
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