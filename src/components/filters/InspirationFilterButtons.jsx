import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const InspirationFilterButtons = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentHash = location.hash.replace('#', '');
  const [topPeriod, setTopPeriod] = useState('week'); // Default to 'week' instead of 'month'

  // Set default to latest if no hash
  useEffect(() => {
    if (!currentHash && location.pathname === '/inspiration') {
      navigate('/inspiration#latest', { replace: true });
    }

    // Parse period from hash if it exists
    if (currentHash === 'top') {
      setTopPeriod('week'); // Default to week when just #top
    } else if (currentHash.startsWith('top-')) {
      const period = currentHash.split('-')[1];
      setTopPeriod(period);
    }
  }, [currentHash, location.pathname]);

  const handleFollowingClick = () => {
    navigate('/inspiration#following');
  };

  const handleTopClick = () => {
    navigate(`/inspiration#top-${topPeriod}`);
  };

  const handleLatestClick = () => {
    navigate('/inspiration#latest');
  };

  const isTopActive = currentHash === 'top' || currentHash.startsWith('top-');

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
      <div className="flex items-center gap-0.5">
        <Button
          variant={isTopActive ? "default" : "ghost"}
          size="sm"
          onClick={handleTopClick}
          className={cn(
            "h-7 text-xs px-3 rounded-lg",
            isTopActive
              ? "bg-primary/90 hover:bg-primary/80 text-primary-foreground shadow-sm" 
              : "bg-muted/5 hover:bg-muted/10",
            "transition-all duration-200",
            isTopActive && "rounded-r-none"
          )}
        >
          Top
        </Button>
        {isTopActive && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className={cn(
                  "h-7 px-1.5",
                  "bg-primary/90 hover:bg-primary/80 text-primary-foreground shadow-sm",
                  "transition-all duration-200",
                  "rounded-l-none border-l border-l-primary/20"
                )}
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem
                className={cn("text-xs", topPeriod === 'week' && "bg-muted/50")}
                onClick={() => {
                  setTopPeriod('week');
                  navigate('/inspiration#top-week');
                }}
              >
                This Week
              </DropdownMenuItem>
              <DropdownMenuItem
                className={cn("text-xs", topPeriod === 'month' && "bg-muted/50")}
                onClick={() => {
                  setTopPeriod('month');
                  navigate('/inspiration#top-month');
                }}
              >
                This Month
              </DropdownMenuItem>
              <DropdownMenuItem
                className={cn("text-xs", topPeriod === 'all' && "bg-muted/50")}
                onClick={() => {
                  setTopPeriod('all');
                  navigate('/inspiration#top-all');
                }}
              >
                All Time
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <Button
        variant={(currentHash === 'latest' || !currentHash) ? "default" : "ghost"}
        size="sm"
        onClick={handleLatestClick}
        className={cn(
          "h-7 text-xs px-3 rounded-lg",
          (currentHash === 'latest' || !currentHash)
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