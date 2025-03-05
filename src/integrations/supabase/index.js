
import { supabase } from './supabase';
import { SupabaseAuthProvider, useSupabaseAuth, SupabaseAuthUI } from './auth';
import { useT, useTs, useAddT, useUpdateT, useDeleteT } from './hooks/useT';
import { callEdgeFunction, checkEdgeFunction } from './edgeFunctions';

export {
  supabase,
  SupabaseAuthProvider,
  useSupabaseAuth,
  SupabaseAuthUI,
  useT,
  useTs,
  useAddT,
  useUpdateT,
  useDeleteT,
  callEdgeFunction,
  checkEdgeFunction
};
