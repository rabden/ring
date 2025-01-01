import React, { useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNotifications } from '@/contexts/NotificationContext';
import { cn } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { format } from 'date-fns';
import { useInView } from '@/hooks/useInView';

const NotificationItem = ({ notification }) => {
  const { markAsRead, deleteNotification, hideGlobalNotification } = useNotifications();
  const { ref, isInView, hasBeenViewed } = useInView(0.9);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Notification effect:', {
      id: notification.id,
      isInView,
      hasBeenViewed,
      is_read: notification.is_read
    });

    if (isInView && !notification.is_read) {
      console.log('Marking notification as read:', notification.id);
      markAsRead(notification.id);
    }
  }, [isInView, notification.is_read, notification.id, markAsRead]);

  const handleHideOrDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!notification.user_id) {
      hideGlobalNotification(notification.id);
    } else {
      deleteNotification(notification.id);
    }
  };

  const handleClick = (e) => {
    if (notification.link) {
      e.preventDefault();
      navigate(notification.link);
    }
  };

  // Parse image URLs and ensure they are valid
  const images = notification.image_url 
    ? notification.image_url.split(',')
        .map(url => url.trim())
        .filter(url => url.length > 0)
    : [];

  const links = notification.link ? notification.link.split(',').map(link => link.trim()) : [];
  const linkNames = notification.link_names ? notification.link_names.split(',').map(name => name.trim()) : [];

  return (
    <div
      ref={ref}
      onClick={handleClick}
      className={cn(
        "group relative flex items-start gap-4 p-4 transition-all duration-200 hover:bg-accent/5",
        !notification.is_read && "bg-muted/10",
        notification.link && "cursor-pointer"
      )}
    >
      {images.length > 0 && (
        <div className="flex-shrink-0 block w-24">
          <AspectRatio ratio={1} className="w-full">
            <img
              src={images[0]}
              alt=""
              className="rounded-xl object-cover w-full h-full ring-1 ring-border/5"
              onError={(e) => {
                console.error('Failed to load notification image:', images[0]);
                e.target.style.display = 'none';
              }}
              loading="lazy"
              style={{ display: 'block' }}
            />
          </AspectRatio>
        </div>
      )}
      
      <div className={cn(
        "flex-1 min-w-0",
        images.length === 0 && "w-full"
      )}>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1.5">
            <p className={cn(
              "text-sm font-medium leading-none text-foreground/90",
              !notification.is_read && "text-primary"
            )}>
              {notification.title}
            </p>
            <p className="text-sm text-muted-foreground/70 line-clamp-2">
              {notification.message}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-lg hover:bg-accent/10 -mr-2"
            onClick={handleHideOrDelete}
          >
            <X className="h-3.5 w-3.5 text-foreground/70" />
          </Button>
        </div>

        {links.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-2">
            {links.map((link, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary/80 hover:text-primary transition-colors duration-200"
              >
                {linkNames[index] || `View details`}
                <ExternalLink className="h-3 w-3" />
              </div>
            ))}
          </div>
        )}

        <p className="mt-1.5 text-[11px] text-muted-foreground/60">
          {format(new Date(notification.created_at), 'MMM d, h:mm a')}
        </p>
      </div>

      {!notification.is_read && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-primary/50 rounded-r-full" />
      )}
    </div>
  );
};

export default NotificationItem;