
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase';
import Masonry from 'react-masonry-css';
import { Card, CardContent } from "@/components/ui/card";
import { useSupabaseAuth } from '@/integrations/supabase/auth';
import ImageCard from './ImageCard';

const breakpointColumnsObj = {
  default: 4,
  1100: 3,
  700: 2,
  500: 2
};

const MyImages = ({ userId, onImageClick, onDownload, onDiscard, onRemix, onViewDetails }) => {
  const { session } = useSupabaseAuth();
  
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();
      return data;
    },
    enabled: !!session?.user?.id
  });

  const { data: userImages, isLoading } = useQuery({
    queryKey: ['userImages', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('user_images')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const isAdmin = userProfile?.is_admin || false;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="flex w-auto"
      columnClassName="bg-clip-padding px-2"
    >
      {userImages?.map((image) => (
        <div key={image.id} className="mb-4">
          <ImageCard
            image={image}
            onImageClick={() => onImageClick(image)}
            onDownload={() => onDownload(image)}
            onDiscard={onDiscard}
            onRemix={() => onRemix(image)}
            onViewDetails={() => onViewDetails(image)}
            userId={session?.user?.id}
            isAdmin={isAdmin}
          />
        </div>
      ))}
    </Masonry>
  );
};

export default MyImages;
