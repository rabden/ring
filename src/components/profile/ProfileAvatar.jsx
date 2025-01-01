import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Repeat } from 'lucide-react';

const ProfileAvatar = ({ 
  user, 
  avatarUrl,
  isPro, 
  size = 'md', 
  onEditClick,
  showEditOnHover = true 
}) => {
  const sizeClasses = {
    xs: 'h-5 w-5',
    sm: 'h-7 w-7',
    md: 'h-12 w-12',
    lg: 'h-24 w-24'
  };

  const iconSizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  // Use avatarUrl from profile if available, otherwise fall back to user metadata
  const finalAvatarUrl = avatarUrl || user?.user_metadata?.avatar_url;

  return (
    <div className="relative group">
      <div className={`rounded-full ${isPro ? 'p-[2px] bg-gradient-to-tr from-yellow-300/80 via-amber-400/80 to-yellow-500/80' : ''}`}>
        <Avatar className={`${sizeClasses[size]} ${isPro ? 'border border-background rounded-full' : ''}`}>
          <AvatarImage src={finalAvatarUrl} alt={user?.email} />
          <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>
      {showEditOnHover && onEditClick && (
        <button 
          onClick={onEditClick}
          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Repeat className={`${iconSizeClasses[size]} text-white`} />
        </button>
      )}
    </div>
  );
};

export default ProfileAvatar;