import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { X, ArrowRight, ChevronRight, Sparkles, Loader } from "lucide-react";
import { toast } from "sonner";
import { usePromptImprovement } from '@/hooks/usePromptImprovement';
import { cn } from "@/lib/utils";
import { MeshGradient } from '@/components/ui/mesh-gradient';

const PROMPT_TIPS = [
  "Tips: Try Remix an Image you like",
  "Tips: Use FLux.1 Dev model for precise results",
  "Tips: Use different models for different results",
  "Tips: Try click the HD badge to improve quality to HD+",
  "Tips: Use the 'Improve' button to enhance your prompt",
  "Tips: Play with the slider to change the aspect ratio",
  "Tips: Explore Inspiration page for more ideas",
  "Tips: Use Stable Diffusion 3.5 large for more vibrant results",
];

const PromptInput = ({ 
  prompt = '',
  onChange,
  onSubmit,
  hasEnoughCredits = true,
  onClear,
  credits,
  bonusCredits,
  userId,
  activeModel,
  modelConfigs
}) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const totalCredits = (credits || 0) + (bonusCredits || 0);
  const hasEnoughCreditsForImprovement = totalCredits >= 1;
  const { isImproving, improveCurrentPrompt } = usePromptImprovement(userId);
  const [isPlayingAnimation, setIsPlayingAnimation] = useState(false);
  const videoRef = useRef(null);

  // Preload the video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % PROMPT_TIPS.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleImprovePrompt = async () => {
    if (!userId) {
      toast.error('Please sign in to improve prompts');
      return;
    }

    if (!hasEnoughCreditsForImprovement) {
      toast.error('Not enough credits for prompt improvement');
      return;
    }

    try {
      let accumulatedPrompt = "";
      let isFirstChunk = true;
      await improveCurrentPrompt(
        prompt,
        activeModel,
        modelConfigs,
        (chunk, isStreaming) => {
          if (isStreaming) {
            if (isFirstChunk) {
              onChange({ target: { value: "" } });
              isFirstChunk = false;
            }
            accumulatedPrompt += chunk;
            onChange({ target: { value: accumulatedPrompt } });
          } else {
            onChange({ target: { value: chunk } });
          }
        }
      );
    } catch (error) {
      console.error('Error improving prompt:', error);
      toast.error('Failed to improve prompt');
    }
  };

  const handleSubmit = async () => {
    if (!prompt?.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    if (!userId) {
      toast.error('Please sign in to generate images');
      return;
    }

    if (!hasEnoughCredits) {
      toast.error('Not enough credits');
      return;
    }

    try {
      setIsPlayingAnimation(true);
      await onSubmit();
    } catch (error) {
      console.error('Error generating:', error);
      toast.error('Failed to generate image');
      setIsPlayingAnimation(false);
    }
  };

  return (
    <div className="relative mb-8">
      {/* Preloaded video */}
      <video 
        ref={videoRef}
        className="hidden"
        src="https://res.cloudinary.com/drhx7imeb/video/upload/v1740045809/Animation_-_1740045046812_wtedox.webm"
        preload="auto"
      />

      <div className="relative bg-background transition-all duration-300">
        <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-background/95 to-transparent pointer-events-none z-20 rounded-t-2xl" />
        <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-background/95 to-transparent pointer-events-none z-20 rounded-b-2xl" />
        
        <div className="relative">
          {isImproving && (
            <MeshGradient 
              className="absolute inset-0 animate-faster z-0 rounded-2xl" 
              intensity="strong"
              speed="fast"
              size={500}
            />
          )}
          <textarea
            value={prompt}
            onChange={onChange}
            placeholder={PROMPT_TIPS[currentTipIndex]}
            className={cn(
              "relative z-10 rounded-2xl",
              "w-full min-h-[450px] md:min-h-[350px] resize-none bg-transparent text-base focus:outline-none",
              "placeholder:text-muted-foreground/40 overflow-y-auto scrollbar-none",
              "border-y border-border/5 py-6 px-3",
              "transition-colors duration-200",
              isImproving && "opacity-80"
            )}
            style={{ 
              caretColor: 'currentColor',
            }}
            disabled={isImproving}
          />
        </div>
      </div>
      
      <div className="flex justify-end items-center mt-4 gap-2">
        {prompt?.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 rounded-xl hover:bg-accent/10"
            onClick={onClear}
            disabled={isImproving}
          >
            <X className="h-4 w-4 text-foreground/70" />
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          className="h-8 rounded-xl bg-background/50 hover:bg-accent/10 transition-all duration-200"
          onClick={handleImprovePrompt}
          disabled={!prompt?.length || isImproving || !hasEnoughCreditsForImprovement}
        >
          <div className="flex items-center">
            {isImproving ? (
              <Loader className="h-4 w-4 mr-2 animate-spin text-foreground/70" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2 text-foreground/70" />
            )}
            <span className="text-sm">Improve</span>
          </div>
        </Button>
        <Button
          size="sm"
          className="h-8 rounded-xl bg-primary/90 hover:bg-primary/80 transition-all duration-200"
          onClick={handleSubmit}
          disabled={!prompt?.length || !hasEnoughCredits || !userId || isImproving}
        >
          <div className="flex items-center">
            <span className="text-sm">Create</span>
            {isPlayingAnimation ? (
              <video 
                className="h-5 w-5 ml-2 rotate-[270deg] scale-150" 
                src={videoRef.current?.src}
                autoPlay
                muted
                playsInline
                onEnded={() => setIsPlayingAnimation(false)}
              />
            ) : (
              <ChevronRight className="ml-2 h-5 w-5" />
            )}
          </div>
        </Button>
      </div>
    </div>
  );
};

export default PromptInput;