
import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { supabase } from '../supabase';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  const clearAuthData = useCallback((shouldClearStorage = false) => {
    setSession(null);
    queryClient.invalidateQueries('user');
    
    if (shouldClearStorage) {
      try {
        supabase.auth.storage.removeItem('sb-auth-token');
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('supabase.auth.')) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.error('Error clearing auth data:', error);
      }
    }
  }, [queryClient]);

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

    const initializeAuth = async () => {
      try {
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
          
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
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
  }, [queryClient, clearAuthData]);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      clearAuthData(true);
    } catch (error) {
      console.error('Error signing out:', error);
    }
    setLoading(false);
  }, [clearAuthData]);

  const value = {
    session,
    loading,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
