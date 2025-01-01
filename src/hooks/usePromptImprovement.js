import { useState } from 'react';
import { improvePrompt } from '@/utils/promptImprovement';
import { toast } from 'sonner';
import { usePromptCredits } from './usePromptCredits';

export const usePromptImprovement = (userId) => {
  const [isImproving, setIsImproving] = useState(false);
  const { deductCredits, isDeducting } = usePromptCredits(userId);

  const improveCurrentPrompt = async (prompt, activeModel, modelConfigs, onSuccess) => {
    if (!prompt?.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsImproving(true);
    const toastId = toast.loading('Improving prompt...', {
      position: 'top-center'
    });
    
    try {
      // Try to improve the prompt first with streaming updates
      const result = await improvePrompt(
        prompt, 
        activeModel, 
        modelConfigs,
        (chunk) => {
          // Call onSuccess with each chunk to update the textarea in real-time
          onSuccess(chunk, true); // Added isStreaming flag
        }
      );

      if (!result) {
        toast.error('Failed to improve prompt', { 
          id: toastId,
          position: 'top-center'
        });
        return;
      }

      // Only deduct credits if improvement was successful
      const deductResult = await deductCredits();
      if (deductResult === -1) {
        toast.error('Not enough credits for prompt improvement', { 
          id: toastId,
          position: 'top-center'
        });
        return;
      }

      // Final update with the complete improved prompt
      onSuccess(result);
      toast.success('Prompt improved!', { 
        id: toastId,
        position: 'top-center'
      });
      return result;
    } catch (error) {
      console.error('Error improving prompt:', error);
      toast.error('Failed to improve prompt', { 
        id: toastId,
        position: 'top-center'
      });
      // Restore original prompt on error
      onSuccess(prompt);
    } finally {
      setIsImproving(false);
    }
  };

  return {
    isImproving: isImproving || isDeducting,
    improveCurrentPrompt
  };
};