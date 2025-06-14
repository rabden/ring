

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './integrations/supabase/components/AuthProvider';
import AppRoutes from './AppRoutes';
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "@/components/ui/toaster"
import { UserPreferencesProvider } from './contexts/UserPreferencesContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { GeneratingImagesProvider } from './contexts/GeneratingImagesContext';
import { RealtimeManagerProvider } from '@/contexts/RealtimeManagerContext';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
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
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
