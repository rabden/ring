
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/integrations/supabase/auth';
import { supabase } from '@/integrations/supabase/supabase';
import LoadingScreen from '@/components/LoadingScreen';
import ImageGenerator from '@/pages/ImageGenerator';
import SingleImageView from '@/components/SingleImageView';
import PublicProfile from '@/pages/PublicProfile';
import UserProfile from '@/pages/UserProfile';
import Login from '@/pages/Login';
import Inspiration from '@/pages/Inspiration';
import Documentation from '@/pages/Documentation';
import Index from '@/pages/Index';
import { Button } from '@/components/ui/button';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
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
  
  if (!session && !isInitialLoad) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

// Auth Route Component
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
    // Changed default redirect to inspiration#latest
    return <Navigate to="/inspiration#latest" replace />;
  }
  
  return children;
};

// Auth Callback Component
const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        if (error) throw error;
        // Changed default redirect to inspiration#latest
        navigate('/inspiration#latest', { replace: true });
      } catch (error) {
        console.error('Error handling auth callback:', error);
        setError(error.message);
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-500">Authentication Error</h1>
          <p className="text-gray-600">{error}</p>
          <Button onClick={() => navigate('/login', { replace: true })}>
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingScreen />
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/image/:imageId" element={<SingleImageView />} />
      <Route path="/docs" element={<Documentation />} />
      
      {/* Auth Routes */}
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route 
        path="/login" 
        element={
          <AuthRoute>
            <Login />
          </AuthRoute>
        } 
      />

      {/* Protected Routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <ImageGenerator />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile/:userId" 
        element={
          <ProtectedRoute>
            <PublicProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/userprofile" 
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/inspiration" 
        element={
          <ProtectedRoute>
            <Inspiration />
          </ProtectedRoute>
        } 
      />

      {/* Fallback Route - Changed to redirect to inspiration#latest */}
      <Route path="*" element={<Navigate to="/inspiration#latest" replace />} />
    </Routes>
  );
};

export default AppRoutes;
