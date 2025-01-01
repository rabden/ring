import React, { useState, useEffect } from 'react';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        const newProgress = oldProgress + 2;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 30);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className={cn(
      "fixed inset-0 z-50",
      "bg-background/95 backdrop-blur-[2px]",
      "flex flex-col items-center justify-center gap-8",
      "transition-all duration-500"
    )}>
      <div className="flex flex-col items-center gap-6">
        <div className={cn(
          "w-20 h-20 rounded-xl overflow-hidden",
          "border border-border/80",
          "shadow-[0_8px_30px_rgb(0,0,0,0.06)]",
          "transition-all duration-300"
        )}>
          <img 
            src="/logo2.png" 
            alt="Ring IG Logo" 
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-2xl font-medium text-foreground/90">Ring IG</h1>
        <Progress 
          value={progress} 
          className={cn(
            "w-64 h-1 rounded-full overflow-hidden",
            "bg-muted/5",
            "transition-all duration-300"
          )}
        />
      </div>
    </div>
  );
};

export default LoadingScreen;