
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader, Check, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const GenerationStatusButton = ({ 
  processingCount, 
  pendingCount, 
  failedCount, 
  completedCount,
  isAllCompleted 
}) => {
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className={cn(
        "h-8 rounded-xl bg-background/50 hover:bg-accent",
        "transition-all duration-200",
        isAllCompleted && "text-primary"
      )}
    >
      {isAllCompleted ? (
        <div className={cn(
          "p-1 rounded-lg mr-2",
          "animate-in zoom-in duration-300"
        )}>
          <Check className="w-4 h-4 text-primary/90" />
        </div>
      ) : processingCount > 0 ? (
        <div className="p-1 rounded-lg mr-2">
          <Loader className="w-4 h-4 animate-spin text-primary/90" />
        </div>
      ) : pendingCount > 0 ? (
        <div className="p-1 rounded-lg mr-2">
          <Clock className="w-4 h-4 text-muted-foreground/70" />
        </div>
      ) : failedCount > 0 ? (
        <div className="p-1 rounded-lg mr-2">
          <AlertCircle className="w-4 h-4 text-destructive/90" />
        </div>
      ) : (
        <div className="p-1 rounded-lg mr-2">
          <Check className="w-4 h-4 text-primary/90" />
        </div>
      )}
      <span className="text-sm">
        {processingCount > 0 ? 'Generating' : 
         pendingCount > 0 ? `Queued-${pendingCount}` : 
         failedCount > 0 ? `Failed-${failedCount}` :
         completedCount > 0 ? `Generated-${completedCount}` : 'Complete'}
      </span>
    </Button>
  );
};

export default GenerationStatusButton;
