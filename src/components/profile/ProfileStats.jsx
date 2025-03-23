
import React from 'react';
import { Heart, Users, UserPlus } from 'lucide-react';

const StatItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-1.5">
    <Icon className="w-4 h-4 text-muted-foreground" />
    <span className="text-sm">{value || 0}</span>
    <span className="text-sm text-muted-foreground">{label}</span>
  </div>
);

const ProfileStats = ({ followersCount, followingCount, totalLikes }) => {
  return (
    <div className="flex gap-4 justify-center">
      <StatItem icon={Users} label="followers" value={followersCount || 0} />
      <StatItem icon={UserPlus} label="following" value={followingCount || 0} />
      <StatItem icon={Heart} label="likes" value={totalLikes || 0} />
    </div>
  );
};

export default ProfileStats;
