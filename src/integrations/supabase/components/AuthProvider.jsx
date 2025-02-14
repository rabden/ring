import React, { createContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  const clearAuthData = (shouldClearStorage = false) => {
    setSession(null);
    queryClient.invalidateQueries('user');
    
    // Only clear localStorage when explicitly requested (like during logout)
    if (shouldClearStorage) {
      try {
        // Remove session from Supabase storage
        supabase.auth.storage.removeItem('sb-auth-token');
        
        // Clear any other auth-related items
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('supabase.auth.')) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.error('Error clearing auth data:', error);
      }
    }
  };

  const handleAuthSession = async () => {
    try {
      // First try to get session from storage
      const storedSession = supabase.auth.storage.getItem('sb-auth-token');
      
      if (storedSession) {
        console.log('Found stored session, validating...');
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (!userError && user) {
          console.log('Stored session is valid');
          setSession(storedSession);
          return;
        } else {
          console.log('Stored session is invalid, fetching new session');
        }
      }

      // If no stored session or it's invalid, get a fresh session
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth session error:', error);
        clearAuthData(false);
        return;
      }

      if (!currentSession) {
        clearAuthData(false);
        return;
      }

      // Verify the session is still valid
      const { data: user, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('User verification error:', userError);
        // If we get a 403 or session_not_found error, clear the session
        if (userError.status === 403 || userError.message?.includes('session_not_found')) {
          await supabase.auth.signOut();
          clearAuthData(true);
        }
        return;
      }

      setSession(currentSession);
      
      // Store the valid session
      supabase.auth.storage.setItem('sb-auth-token', currentSession);
      
    } catch (error) {
      console.error('Auth error:', error);
      clearAuthData(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    let authSubscription = null;

    // Initialize auth state
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mounted) {
            clearAuthData(false);
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          if (initialSession) {
            console.log('Initial session found:', initialSession);
            setSession(initialSession);
            queryClient.invalidateQueries('user');
          } else {
            console.log('No initial session found');
            clearAuthData(false);
          }
          
          // Set up auth listener after initial check
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            console.log('Auth state change:', event, currentSession);
            
            if (!mounted) return;

            switch (event) {
              case 'SIGNED_IN':
                console.log('User signed in:', currentSession);
                setSession(currentSession);
                queryClient.invalidateQueries('user');
                break;
              case 'SIGNED_OUT':
                console.log('User signed out');
                clearAuthData(false);
                break;
              case 'TOKEN_REFRESHED':
                console.log('Token refreshed:', currentSession);
                setSession(currentSession);
                queryClient.invalidateQueries('user');
                break;
              case 'USER_UPDATED':
                console.log('User updated:', currentSession);
                setSession(currentSession);
                queryClient.invalidateQueries('user');
                break;
              case 'USER_DELETED':
                console.log('User deleted');
                clearAuthData(true);
                break;
            }
          });
          
          authSubscription = subscription;
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          clearAuthData(false);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [queryClient]);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      clearAuthData(true); // Clear storage during explicit logout
    } catch (error) {
      console.error('Error signing out:', error);
    }
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ session, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};