import React from 'react';
import { cn } from "@/lib/utils";
import { AlertCircle } from 'lucide-react';

const NSFWAlert = ({ isVisible, onClose, foundWords = [] }) => {
  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-50",
      "animate-in fade-in-0 slide-in-from-top duration-300"
    )}>
      <div className={cn(
        "flex items-start justify-between",
        "max-w-[95%] w-full mx-auto my-4 md:max-w-[600px]",
        "px-4 py-3 rounded-lg",
        "bg-destructive/10 border border-destructive/20",
        "shadow-lg backdrop-blur-sm"
      )}>
        <div className="flex gap-3 flex-1">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-sm font-medium text-destructive break-normal">
              Please click the Safe button to turn on Unsafe mode to use NSFW image generation
            </span>
            {foundWords.length > 0 && (
              <div className="text-xs text-destructive/80">
                <span>Found NSFW words: </span>
                <span className="font-medium">{foundWords.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
        <button 
          onClick={onClose}
          className={cn(
            "ml-4 p-1 rounded-md flex-shrink-0",
            "text-destructive/70 hover:text-destructive hover:bg-destructive/10",
            "transition-all duration-200"
          )}
        >
          <span className="text-lg leading-none">×</span>
        </button>
      </div>
    </div>
  );
};

export default NSFWAlert; 