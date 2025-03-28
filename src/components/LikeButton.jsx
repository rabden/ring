
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const LikeButton = ({ isLiked, onToggle, className, onLike, isLoading }) => {
  const [tempState, setTempState] = useState(null);

  const handleClick = (e) => {
    e.stopPropagation();
    
    if (isLoading) return; // Prevent multiple clicks during loading
    
    // Only trigger animation when liking, not unliking
    if (!isLiked) {
      onLike?.();
    }
    
    onToggle();
    setTempState(!isLiked);
    setTimeout(() => {
      setTempState(null);
    }, 500);
  };

  // Use temporary state if available, otherwise use database state
  const showAsLiked = tempState ?? isLiked;

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-6 w-6 p-0", className)}
      onClick={handleClick}
      disabled={isLoading}
    >
      <Heart 
        className={cn(
          "h-4 w-4",
          showAsLiked ? "fill-red-500 text-red-500" : "text-foreground",
          isLoading && "opacity-50"
        )} 
      />
      {isLoading && (
        <span className="sr-only">Loading</span>
      )}
    </Button>
  );
};

export default LikeButton;
