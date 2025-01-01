import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from '@/integrations/supabase/supabase';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const EditProfileForm = ({ user, onClose }) => {
  const [displayName, setDisplayName] = useState(user.user_metadata?.display_name || '');
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const handleDisplayNameUpdate = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName }
      });

      if (error) throw error;

      await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', user.id);

      queryClient.invalidateQueries(['user']);
      toast.success('Display name updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating display name:', error);
      toast.error('Failed to update display name');
    }
  };

  const handleAvatarUpload = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      queryClient.invalidateQueries(['user']);
      toast.success('Profile picture updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating profile picture:', error);
      toast.error('Failed to update profile picture');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Label 
          htmlFor="displayName"
          className="text-sm font-medium text-foreground/90"
        >
          Display Name
        </Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter your display name"
          className={cn(
            "h-9 bg-muted/5 hover:bg-muted/10 focus:bg-muted/10",
            "border-border/5 focus-visible:border-border/80",
            "rounded-xl transition-all duration-200",
            "placeholder:text-muted-foreground/40"
          )}
        />
        <Button 
          onClick={handleDisplayNameUpdate}
          className="w-full h-9 rounded-xl bg-primary/90 hover:bg-primary/80 transition-all duration-200"
          disabled={!displayName.trim()}
        >
          Update Display Name
        </Button>
      </div>

      <div className="space-y-3">
        <Label 
          htmlFor="avatar"
          className="text-sm font-medium text-foreground/90"
        >
          Profile Picture
        </Label>
        <div className="relative">
          <Input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            disabled={uploading}
            className={cn(
              "h-9 bg-muted/5 hover:bg-muted/10 focus:bg-muted/10",
              "border-border/5 focus-visible:border-border/80",
              "rounded-xl transition-all duration-200",
              "file:h-9 file:bg-transparent file:border-0 file:text-sm file:font-medium",
              "file:text-foreground/70 hover:file:text-foreground/90",
              "cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px] rounded-xl">
              <Loader2 className="h-5 w-5 animate-spin text-foreground/70" />
            </div>
          )}
        </div>
        {uploading && (
          <p className="text-xs text-muted-foreground/60 animate-pulse">
            Uploading your profile picture...
          </p>
        )}
      </div>
    </div>
  );
};

export default EditProfileForm;
