import React from 'react';
import { Button } from "@/components/ui/button";
import { Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";

const PrivateFilterButton = ({ showPrivate, onToggle }) => {
  return (
    <Button
      variant={showPrivate ? "default" : "ghost"}
      size="sm"
      onClick={() => {
        onToggle(!showPrivate);
      }}
      className={cn(
        "h-7 px-3 flex items-center gap-1.5 rounded-lg",
        showPrivate 
          ? "bg-primary/90 hover:bg-primary/80 text-primary-foreground shadow-sm" 
          : "bg-muted/5 hover:bg-muted/10",
        "transition-all duration-200"
      )}
      title={showPrivate ? "Show public images" : "Show private images"}
    >
      {showPrivate ? 
        <Lock className="h-3.5 w-3.5" /> : 
        <Unlock className="h-3.5 w-3.5 text-foreground/80" />
      }
      <span className="hidden md:inline text-xs">Private</span>
    </Button>
  );
};

export default PrivateFilterButton;