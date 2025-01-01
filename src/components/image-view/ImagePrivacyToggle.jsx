import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useImagePrivacy } from '@/hooks/useImagePrivacy';

const ImagePrivacyToggle = ({ image, isOwner }) => {
  const { isPrivate, togglePrivacy } = useImagePrivacy(image?.id);
  const [tempState, setTempState] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  if (!isOwner) return null;

  const handleClick = () => {
    togglePrivacy();
    setTempState(!isPrivate);
    setIsAnimating(true);
    setTimeout(() => {
      setTempState(null);
    }, 5000);
  };

  // Use temporary state if available, otherwise use database state
  const showAsPrivate = tempState ?? isPrivate;

  return (
    <div className="relative h-7 w-7">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        className={cn(
          "h-7 w-7 p-0 rounded-lg",
          showAsPrivate 
            ? "bg-primary/10 hover:bg-primary/20 text-primary" 
            : "bg-muted/5 hover:bg-muted/10 text-muted-foreground/70",
          "transition-all duration-200"
        )}
        title={showAsPrivate ? "Make public" : "Make private"}
      >
        {showAsPrivate ? 
          <Lock className="h-4 w-4" /> : 
          <Unlock className="h-4 w-4" />
        }
      </Button>
      
      {isAnimating && (
        <div className="absolute -top-1.5 -left-1.5 flex items-center justify-center bg-card rounded-lg">
          <video
            src={showAsPrivate ? 'https://res.cloudinary.com/drhx7imeb/video/upload/v1735205358/Animation_-_1735139717633_rxfctn.webm' : 'https://res.cloudinary.com/drhx7imeb/video/upload/v1735206538/Animation_-_1735206487478_il1vfw.webm'}
            autoPlay
            muted
            className="h-10 w-10"
            onEnded={(e) => {
              e.target.currentTime = 0;
              e.target.pause();
              setIsAnimating(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ImagePrivacyToggle;