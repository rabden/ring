import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './integrations/supabase/auth';
import AppRoutes from './AppRoutes';
import { ThemeProvider } from "@/components/ui/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { UserPreferencesProvider } from './contexts/UserPreferencesContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { GeneratingImagesProvider } from './contexts/GeneratingImagesContext';
import { RealtimeManagerProvider } from '@/contexts/RealtimeManagerContext';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserPreferencesProvider>
          <NotificationProvider>
            <GeneratingImagesProvider>
              <RealtimeManagerProvider>
                <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                  <div className="min-h-screen bg-background font-sans antialiased">
                    <Toaster />
                    <AppRoutes />
                  </div>
                </ThemeProvider>
              </RealtimeManagerProvider>
            </GeneratingImagesProvider>
          </NotificationProvider>
        </UserPreferencesProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
