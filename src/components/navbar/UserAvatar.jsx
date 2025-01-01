import React, { memo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const UserAvatar = ({ session, isPro }) => (
  <div className={cn(
    "rounded-full transition-all duration-200",
    isPro && "p-[2px] bg-gradient-to-r from-yellow-300/80 via-yellow-500/80 to-amber-500/80 hover:from-yellow-300 hover:via-yellow-500 hover:to-amber-500"
  )}>
    <Avatar className={cn(
      "h-8 w-8 ring-offset-background transition-all duration-200 hover:scale-105",
      isPro && "border-2 border-background rounded-full"
    )}>
      <AvatarImage 
        src={session?.user?.user_metadata?.avatar_url} 
        alt={session?.user?.email}
        className="object-cover"
      />
      <AvatarFallback className="bg-muted/30 text-foreground/70">
        {session?.user?.email?.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  </div>
);

UserAvatar.displayName = 'UserAvatar';

export default memo(UserAvatar);