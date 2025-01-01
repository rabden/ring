import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { useFollows } from '@/hooks/useFollows';
import { cn } from "@/lib/utils";

const FollowButton = ({ userId, className }) => {
  const { isFollowing, toggleFollow } = useFollows(userId);
  const [tempState, setTempState] = useState(null);

  const handleClick = () => {
    toggleFollow();
    setTempState(!isFollowing);
    setTimeout(() => {
      setTempState(null);
    }, 5000);
  };

  // Use temporary state if available, otherwise use database state
  const showAsFollowing = tempState ?? isFollowing;

  return (
    <Badge
      variant={showAsFollowing ? "outline" : "default"}
      className={cn(
        "cursor-pointer transition-all duration-200",
        showAsFollowing && "bg-destructive/10 hover:bg-destructive/20 text-destructive",
        className
      )}
      onClick={handleClick}
    >
      {showAsFollowing ? 'Unfollow' : 'Follow'}
    </Badge>
  );
};

export default FollowButton;