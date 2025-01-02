import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/integrations/supabase/components/AuthProvider';
import { NotificationProvider } from '@/contexts/NotificationContext';
import ImageGenerator from '@/pages/ImageGenerator';
import SingleImageView from '@/components/SingleImageView';
import PublicProfile from '@/pages/PublicProfile';
import UserProfile from '@/pages/UserProfile';
import Login from '@/pages/Login';
import Inspiration from '@/pages/Inspiration';
import Documentation from '@/pages/Documentation';
import ProtectedRoute from '@/components/routes/ProtectedRoute';
import AuthRoute from '@/components/routes/AuthRoute';
import AuthCallback from '@/components/routes/AuthCallback';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <NotificationProvider>
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
                  path="/inspiration" 
                  element={
                    <ProtectedRoute>
                      <Inspiration />
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
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <ImageGenerator />
                    </ProtectedRoute>
                  } 
                />

                {/* Fallback Route - Redirect to inspiration#top */}
                <Route path="*" element={<Navigate to="/inspiration#top" replace />} />
              </Routes>
              <Toaster />
            </NotificationProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;