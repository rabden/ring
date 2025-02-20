import React from 'react';
import { cn } from "@/lib/utils";

const SettingSection = ({ label, children, className }) => {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-foreground/90">
          {label}
        </h3>
      </div>
      {children}
    </div>
  );
};

export default SettingSection;