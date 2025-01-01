import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const LikeButton = ({ isLiked, onToggle, className, onLike }) => {
  const [tempState, setTempState] = useState(null);

  const handleClick = (e) => {
    e.stopPropagation();
    
    // Only trigger animation when liking, not unliking
    if (!isLiked) {
      onLike?.();
    }
    
    onToggle();
    setTempState(!isLiked);
    setTimeout(() => {
      setTempState(null);
    }, 5000);
  };

  // Use temporary state if available, otherwise use database state
  const showAsLiked = tempState ?? isLiked;

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-6 w-6 p-0", className)}
      onClick={handleClick}
    >
      <Heart 
        className={cn(
          "h-4 w-4",
          showAsLiked ? "fill-red-500 text-red-500" : "text-foreground"
        )} 
      />
    </Button>
  );
};

export default LikeButton;