import { supabase } from '@/integrations/supabase/supabase';
import { toast } from 'sonner';

export const handleImageDiscard = async (image, queryClient) => {
  if (!image?.id) {
    toast.error('Invalid image data');
    return;
  }

  try {
    // 1. First fetch the storage_path
    const { data: imageData, error: fetchError } = await supabase
      .from('user_images')
      .select('storage_path')
      .eq('id', image.id)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching image:', fetchError);
      toast.error('Failed to verify image');
      return;
    }

    // If no image found, it might have been already deleted
    if (!imageData) {
      console.log('Image not found in database, might have been already deleted');
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ['galleryImages'] });
      }
      return;
    }

    if (!imageData.storage_path) {
      console.error('No storage path found for image');
      toast.error('Image file not found');
      return;
    }

    console.log('Full storage path:', imageData.storage_path);

    // Extract the relative path from the full URL
    // The storage_path might be in one of these formats:
    // 1. Full URL: https://axrooawblvsspndfmvan.supabase.co/storage/v1/object/public/user-images/uuid/filename.png
    // 2. Relative: user-images/uuid/filename.png
    // 3. Just the path: uuid/filename.png
    let relativePath = imageData.storage_path;
    
    if (relativePath.includes('user-images/')) {
      relativePath = relativePath.split('user-images/')[1];
    }

    console.log('Extracted relative path:', relativePath);
    
    if (!relativePath) {
      console.error('Invalid storage path format');
      toast.error('Invalid file path');
      return;
    }

    // 2. Delete from storage bucket
    const { error: storageError } = await supabase.storage
      .from('user-images')
      .remove([relativePath]);

    if (storageError) {
      console.error('Error deleting from storage:', storageError);
      toast.error('Failed to delete image file');
      return;
    }

    // 3. Delete from database
    const { error: dbError } = await supabase
      .from('user_images')
      .delete()
      .eq('id', image.id);

    if (dbError) {
      console.error('Error deleting from database:', dbError);
      // Try to restore the file in storage since DB deletion failed
      try {
        // We can't actually restore the file, but we should notify the user
        toast.error('Failed to delete image record. Please try again.');
      } catch (restoreError) {
        console.error('Error in cleanup after failed deletion:', restoreError);
      }
      return;
    }

    // 4. Invalidate queries to refresh the UI
    if (queryClient) {
      queryClient.invalidateQueries({ queryKey: ['galleryImages'] });
    }

    toast.success('Image deleted successfully');
  } catch (error) {
    console.error('Error in handleImageDiscard:', error);
    toast.error('Failed to delete image');
  }
};