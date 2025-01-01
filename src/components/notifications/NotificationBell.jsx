import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useNotifications } from '@/contexts/NotificationContext';
import NotificationList from './NotificationList';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const NotificationBell = () => {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = React.useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleClick = () => {
    setIsOpen(true);
  };

  return isMobile ? (
    <div 
      className={cn(
        "h-9 w-9 p-0 relative md:flex flex items-center justify-center rounded-xl transition-all duration-200 hover:bg-accent/10",
        unreadCount > 0 && "after:content-[''] after:absolute after:top-1.5 after:right-1.5 after:w-2 after:h-2 after:bg-destructive after:rounded-full"
      )}
      onClick={handleClick}
    >
      <Bell className="h-5 w-5 text-foreground/70" />
    </div>
  ) : (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <div 
          className={cn(
            "h-9 w-9 p-0 relative md:flex flex items-center justify-center rounded-xl transition-all duration-200 hover:bg-accent/10 cursor-pointer",
            unreadCount > 0 && "after:content-[''] after:absolute after:top-1.5 after:right-1.5 after:w-2 after:h-2 after:bg-destructive after:rounded-full"
          )}
        >
          <Bell className="h-5 w-5 text-foreground/70" />
        </div>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-full sm:w-[380px] p-0 m-4 rounded-xl border border-border/80 bg-card/95 max-h-[calc(100vh-2rem)] overflow-y-auto shadow-lg"
      >
        <SheetHeader className="p-4 border-b border-border/80">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-medium text-foreground/90">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-sm text-muted-foreground/70">
                  ({unreadCount} new)
                </span>
              )}
            </SheetTitle>
          </div>
        </SheetHeader>
        <NotificationList />
      </SheetContent>
    </Sheet>
  );
};

export default NotificationBell;