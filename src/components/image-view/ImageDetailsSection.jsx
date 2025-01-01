import React from 'react';
import { cn } from "@/lib/utils";

const ImageDetailsSection = ({ detailItems }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {detailItems.map((item, index) => (
        <div 
          key={index} 
          className={cn(
            "space-y-1 rounded-md",
            "bg-muted/5 hover:bg-muted/10",
            "border border-border/5",
            "transition-colors duration-200",
            "group"
          )}
        >
          <p className="text-xs text-foreground/40 uppercase tracking-wider group-hover:text-muted-foreground/70 transition-colors duration-200">
            {item.label}
          </p>
          <p className="text-sm font-medium text-foreground/90">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ImageDetailsSection;