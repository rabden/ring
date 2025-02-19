
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, Sparkles, Loader } from 'lucide-react';
import CreditCounter from '@/components/ui/credit-counter';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { usePromptImprovement } from '@/hooks/usePromptImprovement';
import { MeshGradient } from '@/components/ui/mesh-gradient';
import { checkForNSFWContent } from '@/utils/nsfwDetection';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

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
  onKeyDown,
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
  nsfwEnabled
}) => {
  const [isFixed, setIsFixed] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [nsfwMatches, setNsfwMatches] = useState([]);
  const [dialogContent, setDialogContent] = useState({ isOpen: false, term: '' });
  const boxRef = useRef(null);
  const textareaRef = useRef(null);
  const totalCredits = (credits || 0) + (bonusCredits || 0);
  const hasEnoughCreditsForImprovement = totalCredits >= 1;
  const { isImproving, improveCurrentPrompt } = usePromptImprovement(userId);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % PROMPT_TIPS.length);
    }, 10000);

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

  const handlePromptChange = (e) => {
    const newValue = e.target.value;
    if (!nsfwEnabled) {
      const { matches } = checkForNSFWContent(newValue);
      setNsfwMatches(matches);
    } else {
      setNsfwMatches([]);
    }
    onChange(e);
  };

  useEffect(() => {
    if (nsfwEnabled) {
      setNsfwMatches([]);
      setDialogContent(prev => ({ ...prev, isOpen: false }));
    } else if (prompt) {
      const { matches } = checkForNSFWContent(prompt);
      setNsfwMatches(matches);
    }
  }, [nsfwEnabled, prompt]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      
      const newValue = value.substring(0, start) + '\n' + value.substring(end);
      onChange({ target: { value: newValue } });
      
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
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

  const handleSubmit = async () => {
    if (!prompt?.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    if (nsfwMatches.length > 0 && !nsfwEnabled) {
      toast.error('Please modify NSFW content or enable NSFW mode');
      return;
    }

    onClear();
    await onSubmit();
  };

  return (
    <>
      <div 
        ref={boxRef}
        className={cn(
          "hidden md:block w-full max-w-[850px] mx-auto px-2 mt-20 transition-all duration-300",
          className
        )}
      >
        <Dialog open={dialogContent.isOpen} onOpenChange={(open) => setDialogContent(prev => ({ ...prev, isOpen: open }))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Content Warning</DialogTitle>
              <DialogDescription>
                The term "{dialogContent.term}" is not allowed. Please modify your prompt or enable NSFW mode to proceed.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <div className="relative bg-card border border-border/80 rounded-2xl transition-all duration-300">
          {isImproving && (
            <MeshGradient 
              className="absolute inset-0 rounded-2xl animate-faster" 
              intensity="strong"
              speed="fast"
              size={1200}
            />
          )}
          <div className="p-2">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={handlePromptChange}
                onKeyDown={handleKeyDown}
                placeholder={PROMPT_TIPS[currentTipIndex]}
                className={cn(
                  "w-full min-h-[250px] resize-none bg-transparent text-base focus:outline-none",
                  "placeholder:text-muted-foreground/40 overflow-y-auto scrollbar-none",
                  "border-y border-border/5 py-6 px-3",
                  "transition-colors duration-200",
                  isImproving && "opacity-80",
                  nsfwMatches.length > 0 && !nsfwEnabled && "text-[#ea384c]"
                )}
                style={{ caretColor: 'currentColor' }}
                disabled={isImproving}
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="w-[300px]">
                <CreditCounter credits={credits} bonusCredits={bonusCredits} />
              </div>
              <div className="flex items-center gap-2">
                {prompt?.length > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 rounded-xl hover:bg-background/10"
                    onClick={onClear}
                    disabled={isImproving}
                  >
                    <X className="h-4 w-4 text-foreground/70" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-xl bg-card hover:bg-background/10 transition-all duration-200"
                  onClick={handleImprovePrompt}
                  disabled={!prompt?.length || isImproving || !hasEnoughCreditsForImprovement || (nsfwMatches.length > 0 && !nsfwEnabled)}
                >
                  {isImproving ? (
                    <Loader className="h-4 w-4 mr-2 animate-spin text-foreground/70" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2 text-foreground/70" />
                  )}
                  <span className="text-sm">Improve</span>
                </Button>
                <Button
                  size="sm"
                  className="h-8 rounded-xl bg-primary/90 hover:bg-primary/80 transition-all duration-200"
                  onClick={handleSubmit}
                  disabled={!prompt?.length || !hasEnoughCredits || (nsfwMatches.length > 0 && !nsfwEnabled)}
                >
                  <span className="text-sm">Create</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
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
                className={cn(
                  "flex-1 px-4 truncate cursor-pointer transition-colors duration-200",
                  nsfwMatches.length > 0 && !nsfwEnabled ? "text-[#ea384c]" : "text-muted-foreground/90 hover:text-muted-foreground/80"
                )}
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
                disabled={!prompt?.length || !hasEnoughCredits || (nsfwMatches.length > 0 && !nsfwEnabled)}
              >
                <span className="text-sm">Create</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DesktopPromptBox;
