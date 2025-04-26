
import React from 'react';
import { improvePrompt } from '@/utils/promptImprovement';
import { toast } from 'sonner';
import { usePromptCredits } from './usePromptCredits';

export const usePromptImprovement = (userId) => {
  const [isImproving, setIsImproving] = React.useState(false);
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
      // Try to deduct credits first
      const deductResult = await deductCredits();
      if (deductResult === -1) {
        toast.error('Not enough credits for prompt improvement', { 
          id: toastId,
          position: 'top-center'
        });
        setIsImproving(false);
        return;
      }
      
      // Clear the current input to prepare for streaming updates
      let accumulatedPrompt = "";
      onSuccess("", true); // Clear the input initially
      
      // Now improve the prompt with streaming updates
      const result = await improvePrompt(
        prompt, 
        activeModel, 
        modelConfigs,
        (chunk, isStreaming) => {
          if (isStreaming) {
            // Accumulate the chunks
            accumulatedPrompt += chunk;
            // Update the textarea in real-time with accumulated text
            onSuccess(accumulatedPrompt, true);
          } else {
            // Final update with the complete improved prompt
            onSuccess(chunk, false);
          }
        }
      );

      if (!result || result === prompt) {
        toast.error('Failed to improve prompt', { 
          id: toastId,
          position: 'top-center'
        });
        // Restore original prompt on error
        onSuccess(prompt, false);
        return;
      }

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
      onSuccess(prompt, false);
    } finally {
      setIsImproving(false);
    }
  };

  return {
    isImproving: isImproving || isDeducting,
    improveCurrentPrompt
  };
};
