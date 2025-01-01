import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from 'lucide-react';

const SettingSection = ({ label, tooltip, children }) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium">{label}</span>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-2.5 h-2.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px]">
                <p className="text-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {children}
    </div>
  );
};

export default SettingSection;