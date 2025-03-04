
import React from 'react';
import { Loader, Check, Clock, X, AlertCircle, Image } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MeshGradient } from "@/components/ui/mesh-gradient";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const GenerationStatusItem = ({ 
  image, 
  onCancelClick, 
  modelConfigs 
}) => {
  // Format timestamp to be more user-friendly
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      className={cn(
        "flex flex-col items-start gap-2 p-3 rounded-lg",
        "transition-all duration-200",
        "hover:bg-accent/10 focus:bg-accent/10",
        "group relative overflow-hidden",
        "min-w-[300px]",
        image.status === 'processing' && "min-h-[90px]"
      )}
    >
      {image.status === 'processing' && (
        <MeshGradient 
          className="opacity-50" 
          intensity="strong" 
          speed="fast" 
          size={1000}
        />
      )}
      <div className="flex items-center gap-3 w-full relative">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-1 rounded-lg",
            image.status === 'processing' && "animate-pulse"
          )}>
            {image.status === 'processing' ? (
              <Loader className="w-3.5 h-3.5 animate-spin text-primary/90" />
            ) : image.status === 'pending' ? (
              <Clock className="w-3.5 h-3.5 text-muted-foreground/70" />
            ) : image.status === 'failed' ? (
              <AlertCircle className="w-3.5 h-3.5 text-destructive/90" />
            ) : image.status === 'completed' ? (
              <Check className="w-3.5 h-3.5 text-primary/90" />
            ) : (
              <Image className="w-3.5 h-3.5 text-muted-foreground/70" />
            )}
          </div>
          <span className="text-sm font-medium text-primary/90">
            {image.status === 'processing' ? 'Generating...' : 
             image.status === 'pending' ? 'Queued' : 
             image.status === 'failed' ? 'Failed' : 
             image.status === 'completed' ? 'Complete' :
             'Unknown status'}
          </span>
        </div>
        
        {(image.status === 'processing' || image.status === 'pending') && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => onCancelClick(e, image.id)}
                  className={cn(
                    "ml-auto p-1 rounded-md",
                    "text-destructive/70 hover:text-destructive hover:bg-destructive/10",
                    "transition-all duration-200"
                  )}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Cancel generation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      {image.prompt && (
        <span className="text-xs text-muted-foreground/60 truncate w-full group-hover:text-muted-foreground/70 transition-colors duration-200">
          {image.prompt.length > 50 ? `${image.prompt.substring(0, 50)}...` : image.prompt}
        </span>
      )}
      
      {image.error && (
        <span className="text-xs text-destructive truncate w-full">
          Error: {image.error}
        </span>
      )}
      
      <div className="flex items-center gap-2 w-full">
        <div className="flex gap-2 text-xs text-muted-foreground/50 group-hover:text-muted-foreground/60 transition-colors duration-200">
          <span>
            {modelConfigs?.[image.model]?.name || image.model}
          </span>
          {image.created_at && (
            <span className="opacity-75">
              {formatTime(image.created_at)}
            </span>
          )}
        </div>
        
        <div className="flex gap-1 ml-auto">
          {image.aspect_ratio && (
            <Badge 
              variant="secondary" 
              className={cn(
                "bg-muted/20 hover:bg-muted/30 text-foreground/70",
                "transition-colors duration-200"
              )}
            >
              {image.aspect_ratio}
            </Badge>
          )}
          
          {image.quality && (
            <Badge 
              variant="secondary" 
              className={cn(
                "bg-muted/20 hover:bg-muted/30 text-foreground/70",
                "transition-colors duration-200"
              )}
            >
              {image.quality}
            </Badge>
          )}
          
          {image.isPrivate && (
            <Badge 
              variant="outline" 
              className="text-xs text-muted-foreground/70"
            >
              Private
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerationStatusItem;
