import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const SkeletonImage = ({ width, height, className }) => {
  return (
    <Skeleton 
      className={cn(
        "w-full h-full rounded-lg",
        "bg-muted/5",
        "animate-pulse",
        "transition-all duration-300",
        className
      )} 
      style={{ paddingTop: `${(height / width) * 100}%` }} 
    />
  );
};

export default SkeletonImage;