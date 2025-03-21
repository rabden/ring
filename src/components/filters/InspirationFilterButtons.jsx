
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useTopImagesRoute } from '@/hooks/useTopImagesRoute';
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
  const [topPeriod, setTopPeriod] = useState('week');
  const { hasTopThisWeek, hasTopThisMonth, hasTopAllTime } = useTopImagesRoute();

  useEffect(() => {
    if (!currentHash && location.pathname === '/inspiration') {
      navigate('/inspiration#latest', { replace: true });
    }

    if (currentHash === 'top') {
      setTopPeriod('week');
    } else if (currentHash.startsWith('top-')) {
      const period = currentHash.split('-')[1];
      setTopPeriod(period);
    }
  }, [currentHash, location.pathname]);

  const navigateWithSearchPreserved = (hash) => {
    // Preserve search parameters when changing tabs
    navigate({
      pathname: '/inspiration',
      search: location.search,
      hash
    });
  };

  const handleFollowingClick = () => {
    navigateWithSearchPreserved('#following');
  };

  const handleTopClick = () => {
    // Default to the first available period
    if (hasTopThisWeek) {
      navigateWithSearchPreserved('#top-week');
    } else if (hasTopThisMonth) {
      navigateWithSearchPreserved('#top-month');
    } else if (hasTopAllTime) {
      navigateWithSearchPreserved('#top-all');
    }
  };

  const handleLatestClick = () => {
    navigateWithSearchPreserved('#latest');
  };

  const isTopActive = currentHash === 'top' || currentHash.startsWith('top-');

  return (
    <div className={cn("flex gap-1.5", className)}>
      <Button
        variant={currentHash === 'following' ? "default" : "ghost"}
        size="sm"
        onClick={handleFollowingClick}
        className={cn(
          "h-7 text-xs px-3 rounded-full",
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
            "h-7 text-xs px-3 rounded-full",
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
                  "bg-primary/90 rounded-full hover:bg-primary/80 text-primary-foreground shadow-sm",
                  "transition-all duration-200",
                  "rounded-l-none"
                )}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className={cn(
                "w-32 p-2 m-2",
                "border-border/80 bg-card",
                "animate-in fade-in-0 zoom-in-95 duration-200"
              )}
            >
              <DropdownMenuItem
                className={cn(
                  "flex items-center py-2 px-3 rounded-lg",
                  "cursor-pointer transition-colors duration-200",
                  "hover:bg-accent/30 focus:bg-background/50",
                  "group text-xs",
                  topPeriod === 'week' && "bg-accent/50",
                  !hasTopThisWeek && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => {
                  if (hasTopThisWeek) {
                    setTopPeriod('week');
                    navigateWithSearchPreserved('#top-week');
                  }
                }}
              >
                This Week
              </DropdownMenuItem>
              <DropdownMenuItem
                className={cn(
                  "flex items-center py-2 px-3 rounded-lg",
                  "cursor-pointer transition-colors duration-200",
                  "hover:bg-accent/30 focus:bg-background/50",
                  "group text-xs",
                  topPeriod === 'month' && "bg-accent/50",
                  !hasTopThisMonth && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => {
                  if (hasTopThisMonth) {
                    setTopPeriod('month');
                    navigateWithSearchPreserved('#top-month');
                  }
                }}
              >
                This Month
              </DropdownMenuItem>
              <DropdownMenuItem
                className={cn(
                  "flex items-center py-2 px-3 rounded-lg",
                  "cursor-pointer transition-colors duration-200",
                  "hover:bg-accent/30 focus:bg-background/50",
                  "group text-xs",
                  topPeriod === 'all' && "bg-accent/50",
                  !hasTopAllTime && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => {
                  if (hasTopAllTime) {
                    setTopPeriod('all');
                    navigateWithSearchPreserved('#top-all');
                  }
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
          "h-7 text-xs px-3 rounded-full",
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
