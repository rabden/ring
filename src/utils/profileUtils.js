import { supabase } from '@/integrations/supabase/supabase';
import { toast } from 'sonner';

export const handleAvatarUpload = async (file, userId) => {
  try {
    if (!file) return null;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return null;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return null;
    }

    // First, list all existing profile pictures for the user
    const { data: existingFiles } = await supabase.storage
      .from('profile-pictures')
      .list(userId);

    // Delete all existing profile pictures for the user
    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(file => `${userId}/${file.name}`);
      await supabase.storage
        .from('profile-pictures')
        .remove(filesToDelete);
    }

    // Upload new profile picture
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(filePath);

    // Update user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl }
    });

    if (updateError) throw updateError;

    // Update profiles table
    await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);

    toast.success('Profile picture updated successfully');
    return publicUrl;
  } catch (error) {
    toast.error('Failed to update profile picture');
    console.error('Error updating profile picture:', error);
    return null;
  }
};