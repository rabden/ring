import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, ChevronRight, Sparkles, Loader, Settings } from 'lucide-react';
import CreditCounter from '@/components/ui/credit-counter';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { usePromptImprovement } from '@/hooks/usePromptImprovement';
import { MeshGradient } from '@/components/ui/mesh-gradient';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

const PROMPT_TIPS = [
  "Tips: Try Remix an Image you like",
  "Tips: Use FLux.1 Dev model for precise results",
  "Tips: Use different models for different results",
  "Tips: Try click the HD badge to improve quality to HD+",
  "Tips: Use the 'Improve' button to enhance your prompt",
  "Tips: Play with the slider to change the aspect ratio",
  "Tips: Explore Inspiration page for more ideas",
  "Tips: Use Stable Diffusion 3.5 large for more vibrant results",
  "Always improve prompt for better results",
];

const DesktopPromptBox = ({ 
  prompt,
  onChange,
  onSubmit,
  hasEnoughCredits,
  onClear,
  credits,
  bonusCredits,
  className,
  userId,
  onVisibilityChange,
  activeModel,
  modelConfigs,
  onSettingsToggle
}) => {
  const [isFixed, setIsFixed] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const boxRef = useRef(null);
  const textareaRef = useRef(null);
  const videoRef = useRef(null);
  const totalCredits = (credits || 0) + (bonusCredits || 0);
  const hasEnoughCreditsForImprovement = totalCredits >= 1;
  const { isImproving, improveCurrentPrompt } = usePromptImprovement(userId);
  const [isPlayingAnimation, setIsPlayingAnimation] = useState(false);
  const { settingsActive, setSettingsActive } = useUserPreferences();

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % PROMPT_TIPS.length);
    }, 10000); // Change every 10 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!boxRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFixed(!entry.isIntersecting);
        onVisibilityChange?.(entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: '-64px 0px 0px 0px'
      }
    );

    observer.observe(boxRef.current);
    return () => observer.disconnect();
  }, [onVisibilityChange]);

  useEffect(() => {
    if (onSettingsToggle) {
      onSettingsToggle(settingsActive);
    }
  }, [settingsActive, onSettingsToggle]);

  const handlePromptChange = (e) => {
    if (typeof onChange === 'function') {
      onChange({ target: { value: e.target.value } });
    }
  };

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

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    
    if (!prompt?.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    
    if (typeof onSubmit !== 'function') {
      console.error('onSubmit is not a function', onSubmit);
      toast.error('Generation functionality is not properly configured');
      return;
    }
    
    setIsPlayingAnimation(true);
    try {
      await onSubmit();
    } catch (error) {
      console.error('Error during image generation:', error);
      toast.error('Failed to generate image');
      setIsPlayingAnimation(false);
    }
  };

  const toggleSettings = () => {
    setSettingsActive(prev => !prev);
  };

  return (
    <>
      <video 
        ref={videoRef}
        className="hidden"
        src="https://res.cloudinary.com/drhx7imeb/video/upload/v1740045809/Animation_-_1740045046812_wtedox.webm"
        preload="auto"
      />

      <div 
        ref={boxRef}
        className={cn(
          "hidden md:block w-full max-w-[850px] mx-auto px-2 mt-20 transition-all duration-300",
          className
        )}
      >
        <div className="relative bg-card border border-border/80 rounded-2xl transition-all duration-300">
          <div className="relative transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-card to-transparent pointer-events-none z-20 rounded-t-2xl" />
            <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-card to-transparent pointer-events-none z-20 rounded-b-2xl" />
            
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
                ref={textareaRef}
                value={prompt}
                onChange={handlePromptChange}
                placeholder={PROMPT_TIPS[currentTipIndex]}
                className={cn(
                  "w-full min-h-[300px] resize-none bg-transparent text-base focus:outline-none",
                  "placeholder:text-muted-foreground/40 overflow-y-auto scrollbar-none",
                  "pt-6 pb-40 px-3",
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

          <div className="p-2 pt-0">
            <div className="flex justify-between items-center">
              <div className="w-[300px]">
                <CreditCounter credits={credits} bonusCredits={bonusCredits} />
              </div>
              <div className="flex items-center gap-2">
                {prompt?.length > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 rounded-full hover:bg-background/50"
                    onClick={onClear}
                    disabled={isImproving}
                  >
                    <X className="h-4 w-4 text-foreground/70" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-full bg-card hover:bg-background/50 transition-all duration-200"
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
                  className="h-8 rounded-full bg-primary/90 hover:bg-primary/80 transition-all duration-200"
                  onClick={handleSubmit}
                  disabled={!prompt?.length || !hasEnoughCredits || isImproving}
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
                <Button
                  size="sm"
                  variant={settingsActive ? "default" : "ghost"}
                  className={cn(
                    "h-8 w-8 p-0 rounded-full transition-all duration-200",
                    settingsActive ? "bg-background" : "hover:bg-background/50"
                  )}
                  aria-label="Settings"
                  onClick={toggleSettings}
                >
                  <Settings 
                    className={cn(
                      "h-4 w-4", 
                      settingsActive ? "text-foreground" : "text-foreground/70"
                    )} 
                  />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div 
        className={cn(
          "hidden md:block fixed top-11 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
          isFixed ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        )}
      >
        <div className="max-w-[850px] mx-auto px-10 py-2">
          <div className="relative bg-card backdrop-blur-[2px] border border-border/80 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300">
            <div className="flex items-center gap-4 p-1.5">
              <div 
                className="flex-1 px-4 text-muted-foreground/90 truncate cursor-pointer transition-colors duration-200 hover:text-muted-foreground/80"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setTimeout(() => {
                    textareaRef.current?.focus();
                    const length = textareaRef.current?.value.length || 0;
                    textareaRef.current?.setSelectionRange(length, length);
                  }, 500);
                }}
              >
                {prompt || PROMPT_TIPS[currentTipIndex]}
              </div>
              <Button
                size="sm"
                className="h-8 rounded-full bg-primary/90 hover:bg-primary/80 transition-all duration-200"
                onClick={handleSubmit}
                disabled={!prompt?.length || !hasEnoughCredits}
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
              <Button
                size="sm"
                variant={settingsActive ? "default" : "ghost"}
                className={cn(
                  "h-8 w-8 p-0 rounded-full transition-all duration-200",
                  settingsActive ? "bg-background" : "hover:bg-background/50"
                )}
                aria-label="Settings"
                onClick={toggleSettings}
              >
                <Settings 
                  className={cn(
                    "h-4 w-4", 
                    settingsActive ? "text-foreground" : "text-foreground/70"
                  )} 
                />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DesktopPromptBox;
