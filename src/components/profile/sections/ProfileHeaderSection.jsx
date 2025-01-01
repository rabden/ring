import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import ProfileHeader from '../ProfileHeader';

const ProfileHeaderSection = ({ 
  user, 
  isPro, 
  displayName, 
  isEditing, 
  setIsEditing, 
  setDisplayName, 
  onUpdate, 
  onAvatarEdit,
  onAvatarUpload
}) => {
  return (
    <Card className="w-full bg-gradient-to-br from-background/95 to-background/98 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardContent className="p-3 sm:p-6">
        <ProfileHeader
          user={user}
          isPro={isPro}
          displayName={displayName}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          setDisplayName={setDisplayName}
          onUpdate={onUpdate}
          onAvatarEdit={onAvatarEdit}
          onAvatarUpload={onAvatarUpload}
        />
      </CardContent>
    </Card>
  );
};

export default ProfileHeaderSection;