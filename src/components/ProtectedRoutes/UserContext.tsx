// context/UserContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userRole = session.user.user_metadata?.role;
        
        // Validate that the role is one of your expected roles
        const validRoles = ['ADMIN', 'MANAGER', 'STAFF','HR'];
        const role = validRoles.includes(userRole) ? userRole : 'STAFF';
        
        setUser({
          email: session.user.email,
          role: role,
          id: session.user.id,
          town: session.user.user_metadata?.town || '' // Add town if needed
        });
      }
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const userRole = session.user.user_metadata?.role;
          const validRoles = ['ADMIN', 'MANAGER', 'STAFF','HR'];
          const role = validRoles.includes(userRole) ? userRole : 'STAFF';
          
          setUser({
            email: session.user.email,
            role: role,
            id: session.user.id,
            town: session.user.user_metadata?.town || ''
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};