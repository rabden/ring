import React from 'react';
import { Upload } from 'lucide-react';
import ProfileAvatar from './ProfileAvatar';
import DisplayNameEditor from './DisplayNameEditor';

const ProfileHeader = ({ 
  user, 
  isPro, 
  displayName, 
  isEditing, 
  setIsEditing, 
  setDisplayName, 
  onUpdate, 
  onAvatarEdit,
  onAvatarUpload,
  profile
}) => {
  return (
    <div className="flex flex-col items-center space-y-2 sm:space-y-3">
      <div className="relative cursor-pointer" onClick={onAvatarEdit}>
        <ProfileAvatar 
          user={user} 
          avatarUrl={profile?.avatar_url}
          isPro={isPro} 
          size="lg" 
          onEditClick={null}
          showEditOnHover={false}
        />
        {/* Floating Upload Icon */}
        <label className="absolute -bottom-2 -right-2 cursor-pointer z-10 group" onClick={e => e.stopPropagation()}>
          <input type="file" accept="image/*" onChange={onAvatarUpload} className="hidden" />
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all transform hover:scale-105 border border-white/10">
            <Upload className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
          </div>
        </label>
      </div>
      <div className="text-center space-y-1 w-full px-2 sm:px-4">
        <DisplayNameEditor
          isEditing={isEditing}
          displayName={displayName}
          setDisplayName={setDisplayName}
          onEdit={() => setIsEditing(true)}
          onUpdate={onUpdate}
          size="lg"
        />
        <p className="text-sm text-muted-foreground">{user.email}</p>
        {isPro && <p className="text-sm text-primary">Pro User</p>}
      </div>
    </div>
  );
};

export default ProfileHeader;