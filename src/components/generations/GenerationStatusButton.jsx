
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader, Check, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const GenerationStatusButton = ({ 
  processingCount, 
  pendingCount, 
  failedCount, 
  completedCount,
  isAllCompleted 
}) => {
  // Calculate total images being tracked
  const totalCount = processingCount + pendingCount + failedCount + completedCount;
  
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className={cn(
        "h-8 rounded-xl bg-background/50 hover:bg-accent",
        "transition-all duration-200",
        "relative overflow-hidden",
        isAllCompleted && "text-primary"
      )}
    >
      <div className="flex items-center gap-2">
        {isAllCompleted ? (
          <div className={cn(
            "p-1 rounded-lg",
            "animate-in zoom-in duration-300"
          )}>
            <Check className="w-4 h-4 text-primary/90" />
          </div>
        ) : processingCount > 0 ? (
          <div className="p-1 rounded-lg">
            <Loader className="w-4 h-4 animate-spin text-primary/90" />
          </div>
        ) : pendingCount > 0 ? (
          <div className="p-1 rounded-lg">
            <Clock className="w-4 h-4 text-muted-foreground/70" />
          </div>
        ) : failedCount > 0 ? (
          <div className="p-1 rounded-lg">
            <AlertCircle className="w-4 h-4 text-destructive/90" />
          </div>
        ) : (
          <div className="p-1 rounded-lg">
            <Check className="w-4 h-4 text-primary/90" />
          </div>
        )}
        <span className="text-sm font-medium">
          {processingCount > 0 ? 'Generating' : 
           pendingCount > 0 ? `Queued` : 
           failedCount > 0 ? `Failed` :
           completedCount > 0 ? `Generated` : 'Complete'}
        </span>
        
        {totalCount > 0 && (
          <Badge 
            variant="secondary"
            className="ml-1 h-5 min-w-5 px-1 text-xs font-normal bg-muted/50"
          >
            {totalCount}
          </Badge>
        )}
      </div>
    </Button>
  );
};

export default GenerationStatusButton;
