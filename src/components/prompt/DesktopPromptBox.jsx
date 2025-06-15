import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eraser, ChevronRight, Sparkles, Loader, Settings } from 'lucide-react';
import CreditCounter from '@/components/ui/credit-counter';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { usePromptImprovement } from '@/hooks/usePromptImprovement';
import { MeshGradient } from '@/components/ui/mesh-gradient';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import MiniModelChooser from '@/components/settings/MiniModelChooser';
import MiniDimensionChooser from '@/components/settings/MiniDimensionChooser';
import ImageCountChooser from '@/components/settings/ImageCountChooser';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import SettingSection from '@/components/settings/SettingSection';

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
  onSettingsToggle,
  onModelChange,
  aspectRatio,
  onAspectRatioChange,
  proMode,
  imageCount,
  onImageCountChange,
  seed,
  setSeed,
  randomizeSeed,
  setRandomizeSeed
}) => {
  const [isFixed, setIsFixed] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [highlightedPrompt, setHighlightedPrompt] = useState('');
  const boxRef = useRef(null);
  const textareaRef = useRef(null);
  const videoRef = useRef(null);
  const totalCredits = (credits || 0) + (bonusCredits || 0);
  const hasEnoughCreditsForImprovement = totalCredits >= 1;
  const { isImproving, improveCurrentPrompt } = usePromptImprovement(userId);
  const { settingsActive = true, setSettingsActive } = useUserPreferences();
  const [isPlayingAnimation, setIsPlayingAnimation] = useState(false);
  const [internalSettingsActive, setInternalSettingsActive] = useState(!settingsActive);

  const containerMaxWidth = internalSettingsActive ? "max-w-[950px]" : "max-w-[800px]";
  const textareaHeight = internalSettingsActive ? "min-h-[350px]" : "min-h-[280px]";

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
    setInternalSettingsActive(!settingsActive);
  }, [settingsActive]);

  useEffect(() => {
    if (onSettingsToggle) {
      onSettingsToggle(settingsActive);
    }
  }, [settingsActive, onSettingsToggle]);

  useEffect(() => {
    setHighlightedPrompt('');
  }, [prompt]);

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
    
    if (!hasEnoughCredits) {
      toast.error('Not enough credits');
      return;
    }
    
    if (typeof onSubmit !== 'function') {
      console.error('onSubmit is not a function', onSubmit);
      toast.error('Generation functionality is not properly configured');
      return;
    }
    
    try {
      setIsPlayingAnimation(true);
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
          "hidden md:block w-full mx-auto px-2 pb-1 mt-20 transition-all duration-300 rounded-2xl",
          containerMaxWidth,
          className
        )}
      >
        <div className="relative bg-card border border-border/80 rounded-2xl transition-all duration-300">
          <div className="flex flex-row">
            <div className={cn(
              "flex-1 relative transition-all duration-300",
              internalSettingsActive ? "w-[65%]" : "w-full"
            )}>
              <div className="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-card to-transparent pointer-events-none z-20 rounded-t-2xl" />
              <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-card to-transparent pointer-events-none z-20" />
              
              {prompt?.length > 0 && (
                <div className="absolute top-1 right-1 z-30">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-full hover:bg-background/80"
                          onClick={onClear}
                          disabled={isImproving}
                        >
                          <Eraser className="h-4 w-4 text-foreground/70" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Clear prompt</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
              
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
                  onChange={onChange}
                  placeholder={PROMPT_TIPS[currentTipIndex]}
                  className={cn(
                    "w-full resize-none bg-transparent text-base focus:outline-none",
                    "placeholder:text-muted-foreground/40 overflow-y-auto scrollbar-none",
                    "pt-6 pb-12 pl-3 pr-5",
                    "transition-all duration-300",
                    textareaHeight,
                    isImproving && "opacity-80"
                  )}
                  style={{ 
                    caretColor: 'currentColor',
                  }}
                  disabled={isImproving}
                />
              </div>
            </div>

            {internalSettingsActive && (
              <div className="w-[35%] p-3 flex flex-col space-y-4 mt-3 rounded-2xl">
                {modelConfigs && activeModel && onModelChange && (
                  <MiniModelChooser 
                    currentModel={activeModel} 
                    onModelChange={onModelChange} 
                    modelConfigs={modelConfigs}
                    proMode={proMode}
                  />
                )}
                
                {aspectRatio && onAspectRatioChange && (
                  <MiniDimensionChooser
                    currentRatio={aspectRatio}
                    onRatioChange={onAspectRatioChange}
                    proMode={proMode}
                  />
                )}
                
                {imageCount !== undefined && onImageCountChange && (
                  <ImageCountChooser
                    count={imageCount}
                    setCount={onImageCountChange}
                  />
                )}

                {seed !== undefined && setSeed && randomizeSeed !== undefined && setRandomizeSeed && (
                  <SettingSection label="Seed" compact={true}>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={seed}
                        onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
                        disabled={randomizeSeed}
                      />
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="randomizeSeedMini"
                          checked={randomizeSeed}
                          onCheckedChange={setRandomizeSeed}
                        />
                        <Label htmlFor="randomizeSeedMini" className="text-xs font-normal">Random</Label>
                      </div>
                    </div>
                  </SettingSection>
                )}
              </div>
            )}
          </div>

          <div className="px-2 pb-1 pt-0">
            <div className="flex justify-between items-center rounded-2xl">
              <div className="w-[300px]">
                <CreditCounter credits={credits} bonusCredits={bonusCredits} />
              </div>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-full bg-card hover:bg-background/80 transition-all duration-200"
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
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Improve prompt with AI (costs 1 credit)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant={settingsActive ? "default" : "ghost"}
                        className={cn(
                          "h-8 w-8 p-0 rounded-full transition-all duration-200",
                          settingsActive 
                            ? "bg-background hover:bg-background/80" 
                            : "hover:bg-background/80"
                        )}
                        aria-label="Settings"
                        onClick={toggleSettings}
                      >
                        <Settings 
                          className={cn(
                            "h-4 w-4", 
                            settingsActive 
                              ? "text-foreground" 
                              : "text-foreground/70"
                          )} 
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Toggle settings panel</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DesktopPromptBox;
