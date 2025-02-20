
import React, { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/integrations/supabase/components/AuthProvider';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { Toaster } from 'sonner';
import LoadingScreen from '@/components/LoadingScreen';
import AppRoutes from './AppRoutes';

// Create QueryClient instance with retry configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      suspense: false,
      useErrorBoundary: true
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <NotificationProvider>
              <Suspense fallback={<LoadingScreen />}>
                <AppRoutes />
                <Toaster />
              </Suspense>
            </NotificationProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
