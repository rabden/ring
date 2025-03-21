
import React from 'react';
import { cn } from '@/lib/utils';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SettingSection = ({ 
  label, 
  tooltip, 
  className, 
  children,
  compact = false 
}) => {
  return (
    <div className={cn("space-y-1", compact ? "mb-2" : "mb-4", className)}>
      <div className="flex items-center gap-1">
        <div className={cn(
          "text-foreground/90",
          compact ? "text-xs font-medium" : "text-sm font-medium"
        )}>
          {label}
        </div>
        
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoCircledIcon className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-72">
                <p className="text-sm">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <div>{children}</div>
    </div>
  );
};

export default SettingSection;
