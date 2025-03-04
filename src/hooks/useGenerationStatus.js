
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/supabase';
import { useQueryClient } from '@tanstack/react-query';

export const useGenerationStatus = (userId) => {
  const [generationStatuses, setGenerationStatuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Initial fetch of status records
  useEffect(() => {
    if (!userId) {
      setGenerationStatuses([]);
      setIsLoading(false);
      return;
    }

    const fetchGenerationStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('image_generation_status')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        setGenerationStatuses(data || []);
      } catch (error) {
        console.error('Error fetching generation status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGenerationStatus();
  }, [userId]);

  // Set up realtime subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('generation-status-changes')
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'image_generation_status',
          filter: `user_id=eq.${userId}`,
        }, 
        (payload) => {
          // Add new generation status to the list
          setGenerationStatuses(prev => [payload.new, ...prev]);
        }
      )
      .on('postgres_changes', 
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'image_generation_status',
          filter: `user_id=eq.${userId}`,
        }, 
        (payload) => {
          // Update existing generation status
          setGenerationStatuses(prev => 
            prev.map(status => 
              status.id === payload.new.id ? payload.new : status
            )
          );
          
          // If the status changed to completed, refresh user images
          if (payload.new.status === 'completed' && payload.new.image_id) {
            queryClient.invalidateQueries(['userImages']);
            queryClient.invalidateQueries(['inspireImages']);
          }
        }
      )
      .on('postgres_changes', 
        {
          event: 'DELETE',
          schema: 'public',
          table: 'image_generation_status',
          filter: `user_id=eq.${userId}`,
        }, 
        (payload) => {
          // Remove deleted generation status
          setGenerationStatuses(prev => 
            prev.filter(status => status.id !== payload.old.id)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  const cancelGeneration = async (generationId) => {
    try {
      await supabase
        .from('image_generation_status')
        .update({ status: 'cancelled' })
        .eq('id', generationId);
    } catch (error) {
      console.error('Error cancelling generation:', error);
    }
  };

  const createGenerationStatus = async (generationData) => {
    try {
      const { data, error } = await supabase
        .from('image_generation_status')
        .insert([generationData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating generation status:', error);
      throw error;
    }
  };

  const removeGenerationStatus = async (generationId) => {
    try {
      await supabase
        .from('image_generation_status')
        .delete()
        .eq('id', generationId);
    } catch (error) {
      console.error('Error removing generation status:', error);
    }
  };

  const getCompletedCount = () => {
    return generationStatuses.filter(status => status.status === 'completed').length;
  };

  const getPendingCount = () => {
    return generationStatuses.filter(status => status.status === 'pending').length;
  };

  const getProcessingCount = () => {
    return generationStatuses.filter(status => status.status === 'processing').length;
  };

  const getFailedCount = () => {
    return generationStatuses.filter(status => status.status === 'failed').length;
  };

  return {
    generationStatuses,
    isLoading,
    cancelGeneration,
    createGenerationStatus,
    removeGenerationStatus,
    getCompletedCount,
    getPendingCount,
    getProcessingCount,
    getFailedCount,
  };
};
