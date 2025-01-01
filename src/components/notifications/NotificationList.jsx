import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from '@/contexts/NotificationContext';
import NotificationItem from './NotificationItem';
import { Bell } from 'lucide-react';
import { cn } from "@/lib/utils";

const NotificationList = () => {
  const { notifications } = useNotifications();

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-center p-6 space-y-3">
        <div className="rounded-full bg-muted/5 p-4 transition-all duration-200 hover:bg-muted/10">
          <Bell className="h-10 w-10 text-muted-foreground/30" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground/70">No notifications</p>
          <p className="text-xs text-muted-foreground/50">You're all caught up!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border/5">
          {notifications.map((notification, index) => (
            <div 
              key={notification.id} 
              className={cn(
                "transition-all duration-200",
                index === 0 && "rounded-t-lg overflow-hidden",
                index === notifications.length - 1 && "rounded-b-lg overflow-hidden"
              )}
            >
              <NotificationItem notification={notification} />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default NotificationList;