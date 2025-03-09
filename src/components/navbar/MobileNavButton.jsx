import React, { memo, useState, useRef, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const MobileNavButton = ({ 
  icon: Icon, 
  isActive, 
  onClick, 
  children, 
  badge, 
  onLongPress, 
  asChild,
  showCheckmark 
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const pressTimer = useRef(null);
  const touchStartTime = useRef(0);
  const isMoved = useRef(false);

  const handleTouchStart = (e) => {
    isMoved.current = false;
    touchStartTime.current = Date.now();
    if (onLongPress) {
      pressTimer.current = setTimeout(() => {
        if (!isMoved.current) {
          setIsPressed(true);
          onLongPress();
        }
      }, 500);
    }
  };

  const handleTouchMove = () => {
    isMoved.current = true;
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      setIsPressed(false);
    }
  };

  const handleTouchEnd = (e) => {
    const touchDuration = Date.now() - touchStartTime.current;
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
    setIsPressed(false);

    // Only trigger click if it wasn't a long press and the touch didn't move
    if (touchDuration < 500 && !isMoved.current) {
      onClick?.(e);
    }
  };

  useEffect(() => {
    return () => {
      if (pressTimer.current) {
        clearTimeout(pressTimer.current);
      }
    };
  }, []);

  const ButtonComponent = asChild ? 'div' : 'button';

  return (
    <ButtonComponent
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={(e) => {
        // Only handle click for non-touch devices
        if (e.pointerType !== 'touch') {
          onClick?.(e);
        }
      }}
      className={cn(
        "flex items-center justify-center w-14 h-12 transition-all duration-200 relative rounded-xl",
        isActive ? "text-primary" : "text-muted-foreground/70",
        "relative group hover:bg-accent/10"
      )}
    >
      <div className={cn(
        "absolute inset-x-3 h-0.5 -top-1 rounded-full transition-all duration-200",
        isActive ? "bg-primary/50" : "bg-transparent"
      )} />
      {children || (
        <>
          <Icon size={20} className={cn(
            "transition-all duration-200",
            isActive ? "scale-100" : "scale-90 opacity-70 group-hover:scale-100 group-hover:opacity-100"
          )} />
          {(badge > 0 || showCheckmark) && (
            <span className={cn(
              "absolute top-1.5 right-2.5 h-4 w-4 rounded-full bg-primary/30 text-[10px] font-medium text-primary-foreground flex items-center justify-center backdrop-blur-[1px]",
              showCheckmark && "animate-in zoom-in duration-300"
            )}>
              {showCheckmark ? (
                <Check className="h-3 w-3" />
              ) : (
                badge > 9 ? '9+' : badge
              )}
            </span>
          )}
        </>
      )}
    </ButtonComponent>
  );
};

export default memo(MobileNavButton);