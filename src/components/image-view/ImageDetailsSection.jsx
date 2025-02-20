import React from 'react';
import { cn } from "@/lib/utils";

const ImageDetailsSection = ({ detailItems }) => {
  return (
    <div className="grid grid-cols-2 gap-6 pt-5">
      {detailItems.map((item, index) => (
        <div 
          key={index} 
          className={cn(
            "space-y-1 rounded-none",
            "transition-all duration-200",
            "group"
          )}
        >
          <p className="text-sm font-medium text-foreground/60 uppercase tracking-wide group-hover:text-foreground/80 transition-colors duration-200">
            {item.label}
          </p>
          <p className="text-[15px] font-semibold text-foreground/90 group-hover:text-foreground transition-colors duration-200">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ImageDetailsSection;