import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSupabaseAuth } from '@/integrations/supabase/auth';
import LoadingScreen from '@/components/LoadingScreen';

const AuthRoute = ({ children }) => {
  const { session, loading } = useSupabaseAuth();
  const location = useLocation();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  useEffect(() => {
    if (!loading) {
      setIsInitialLoad(false);
    }
  }, [loading]);

  if (loading || isInitialLoad) {
    return <LoadingScreen />;
  }
  
  if (session && !isInitialLoad) {
    const to = location.state?.from?.pathname || '/inspiration#top';
    return <Navigate to={to} replace />;
  }
  
  return children;
};

export default AuthRoute;