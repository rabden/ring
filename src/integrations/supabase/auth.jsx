import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from './supabase.js';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthUI } from './components/AuthUI';
import { AuthProvider } from './components/AuthProvider';

export { AuthProvider as SupabaseAuthProvider };
export { useAuth as useSupabaseAuth } from './hooks/useAuth';
export { AuthUI as SupabaseAuthUI };