import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileAvatar from '../profile/ProfileAvatar';
import FollowButton from '../profile/FollowButton';
import ImagePrivacyToggle from './ImagePrivacyToggle';
import LikeButton from '../LikeButton';
import { useProUser } from '@/hooks/useProUser';

const ImageOwnerHeader = ({ owner, image, isOwner, userLikes, toggleLike, likeCount, onLike }) => {
  const navigate = useNavigate();
  const { data: isPro } = useProUser(image.user_id);

  const handleProfileClick = () => {
    navigate(`/profile/${image.user_id}`);
  };

  return (
    <div className="flex items-center justify-between p-1">
      <div 
        className="flex items-center gap-2.5 cursor-pointer rounded-xl px-2 py-1.5 transition-colors hover:bg-accent/10"
        onClick={handleProfileClick}
      >
        <ProfileAvatar 
          user={{ email: owner?.email }}
          avatarUrl={owner?.avatar_url}
          size="sm"
          isPro={isPro}
        />
        <span className="text-xs font-medium text-foreground/90">{owner?.display_name}</span>
      </div>
      <div className="flex items-center gap-2.5">
        {!isOwner && (
          <FollowButton userId={image.user_id} />
        )}
        <ImagePrivacyToggle image={image} isOwner={isOwner} />
        <div className="flex items-center gap-1.5 rounded-xl bg-muted/5 px-3 py-1.5">
          <LikeButton 
            isLiked={userLikes?.includes(image.id)} 
            onToggle={() => toggleLike(image.id)}
            onLike={onLike}
          />
          <span className="text-xs text-muted-foreground/70">{likeCount}</span>
        </div>
      </div>
    </div>
  );
};

export default ImageOwnerHeader;