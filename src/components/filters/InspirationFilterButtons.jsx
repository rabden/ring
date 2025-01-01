import React from 'react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

const InspirationFilterButtons = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentHash = location.hash.replace('#', '');

  const handleFollowingClick = () => {
    navigate('/inspiration#following');
  };

  const handleTopClick = () => {
    navigate('/inspiration#top');
  };

  const handleLatestClick = () => {
    navigate('/inspiration#latest');
  };

  return (
    <div className={cn("flex gap-1.5", className)}>
      <Button
        variant={currentHash === 'following' ? "default" : "ghost"}
        size="sm"
        onClick={handleFollowingClick}
        className={cn(
          "h-7 text-xs px-3 rounded-lg",
          currentHash === 'following'
            ? "bg-primary/90 hover:bg-primary/80 text-primary-foreground shadow-sm" 
            : "bg-muted/5 hover:bg-muted/10",
          "transition-all duration-200"
        )}
      >
        Following
      </Button>
      <Button
        variant={currentHash === 'top' ? "default" : "ghost"}
        size="sm"
        onClick={handleTopClick}
        className={cn(
          "h-7 text-xs px-3 rounded-lg",
          currentHash === 'top'
            ? "bg-primary/90 hover:bg-primary/80 text-primary-foreground shadow-sm" 
            : "bg-muted/5 hover:bg-muted/10",
          "transition-all duration-200"
        )}
      >
        Top
      </Button>
      <Button
        variant={currentHash === 'latest' ? "default" : "ghost"}
        size="sm"
        onClick={handleLatestClick}
        className={cn(
          "h-7 text-xs px-3 rounded-lg",
          currentHash === 'latest'
            ? "bg-primary/90 hover:bg-primary/80 text-primary-foreground shadow-sm" 
            : "bg-muted/5 hover:bg-muted/10",
          "transition-all duration-200"
        )}
      >
        Latest
      </Button>
    </div>
  );
};

export default InspirationFilterButtons; 