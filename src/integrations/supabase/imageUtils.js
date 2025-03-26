
import { supabase } from './supabase';

export const deleteImageFromStorage = async (storagePath) => {
  if (!storagePath) {
    throw new Error('Storage path is required for deletion');
  }

  const { error } = await supabase.storage
    .from('user-images')
    .remove([storagePath]);

  if (error) {
    throw new Error(`Failed to delete image from storage: ${error.message}`);
  }
};

export const deleteImageRecord = async (imageId) => {
  if (!imageId) {
    throw new Error('Image ID is required for database record deletion');
  }

  const { error } = await supabase
    .from('user_images')
    .delete()
    .eq('id', imageId);

  if (error) {
    throw new Error(`Failed to delete image record from database: ${error.message}`);
  }
};

export const deleteImageCompletely = async (imageId) => {
  if (!imageId) {
    throw new Error('Image ID is required for deletion');
  }

  // First, fetch the image record to get the storage path
  const { data: imageRecord, error: fetchError } = await supabase
    .from('user_images')
    .select('storage_path')
    .eq('id', imageId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch image record: ${fetchError.message}`);
  }

  if (!imageRecord?.storage_path) {
    throw new Error('Image record or storage path not found');
  }

  // Delete the image from storage first
  await deleteImageFromStorage(imageRecord.storage_path);

  // Then delete the database record
  await deleteImageRecord(imageId);
};

export const adminDeleteImage = async (imageId, reason) => {
  if (!imageId) {
    throw new Error('Image ID is required for deletion');
  }

  // First, fetch the image record to get user info and storage path
  const { data: imageRecord, error: fetchError } = await supabase
    .from('user_images')
    .select('storage_path, user_id, prompt')
    .eq('id', imageId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch image record: ${fetchError.message}`);
  }

  if (!imageRecord?.storage_path) {
    throw new Error('Image record or storage path not found');
  }

  // Delete the image from storage first
  await deleteImageFromStorage(imageRecord.storage_path);

  // Then delete the database record
  await deleteImageRecord(imageId);

  // Send notification to the user
  if (imageRecord.user_id) {
    const reasonText = reason ? `: "${reason}"` : '';
    const title = 'Your Image Was Removed';
    const message = `An administrator has removed your image with prompt "${imageRecord.prompt.substring(0, 50)}..."${reasonText}`;
    
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: imageRecord.user_id,
        title: title,
        message: message,
        is_read: false
      });

    if (notificationError) {
      console.error('Failed to create notification:', notificationError);
      // Don't throw here, we already deleted the image
    }
  }
};
