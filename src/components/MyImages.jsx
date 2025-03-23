
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/supabase'
import Masonry from 'react-masonry-css'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreVertical, Download, Trash2, Wand2, Info, Shield } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { useAuth } from '@/integrations/supabase/hooks/useAuth'
import AdminDiscardDialog from './admin/AdminDiscardDialog'
import { useState } from 'react'

const breakpointColumnsObj = {
  default: 4,
  1100: 3,
  700: 2,
  500: 2
}

const MyImages = ({ userId, onImageClick, onDownload, onDiscard, onRemix, onViewDetails }) => {
  const { user } = useAuth();
  const [selectedImageForDelete, setSelectedImageForDelete] = useState(null);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  
  // Fetch user profile to check if admin
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id
  });
  
  const isAdmin = userProfile?.is_admin || false;

  const { data: userImages, isLoading } = useQuery({
    queryKey: ['userImages', userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('user_images')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!userId,
  })

  // Fetch image owner name for admin dialog
  const { data: imageOwner } = useQuery({
    queryKey: ['imageOwner', selectedImageForDelete?.user_id],
    queryFn: async () => {
      if (!selectedImageForDelete?.user_id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', selectedImageForDelete.user_id)
        .single();
      return data;
    },
    enabled: !!selectedImageForDelete?.user_id && isAdmin
  });

  const handleAdminDelete = (image) => {
    setSelectedImageForDelete(image);
    setIsAdminDialogOpen(true);
  };

  const confirmAdminDelete = (reason) => {
    onDiscard(selectedImageForDelete.id, reason, true);
    setIsAdminDialogOpen(false);
    setSelectedImageForDelete(null);
  };

  if (isLoading) {
    return <div>Loading...</div>
  }

  // Show admin delete option only if user is admin and not the image owner
  const showAdminDelete = (image) => isAdmin && image.user_id !== user?.id;

  return (
    <>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex w-auto"
        columnClassName="bg-clip-padding px-2"
      >
        {userImages?.map((image, index) => (
          <div key={image.id} className="mb-4">
            <Card className="overflow-hidden">
              <CardContent className="p-0 relative" style={{ paddingTop: `${(image.height / image.width) * 100}%` }}>
                <img 
                  src={supabase.storage.from('user-images').getPublicUrl(image.storage_path).data.publicUrl}
                  alt={image.prompt} 
                  className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                  onClick={() => onImageClick(index)}
                />
              </CardContent>
            </Card>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-sm truncate w-[70%] mr-2">{image.prompt}</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onDownload(supabase.storage.from('user-images').getPublicUrl(image.storage_path).data.publicUrl, image.prompt)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  
                  {image.user_id === user?.id && (
                    <DropdownMenuItem onClick={() => onDiscard(image.id)} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Discard
                    </DropdownMenuItem>
                  )}
                  
                  {showAdminDelete(image) && (
                    <DropdownMenuItem onClick={() => handleAdminDelete(image)} className="text-destructive">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Delete
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem onClick={() => onRemix(image)}>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Remix
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onViewDetails(image)}>
                    <Info className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </Masonry>
      
      {/* Admin discard confirmation dialog */}
      <AdminDiscardDialog
        open={isAdminDialogOpen}
        onOpenChange={setIsAdminDialogOpen}
        onConfirm={confirmAdminDelete}
        imageOwnerName={imageOwner?.display_name}
      />
    </>
  )
}

export default MyImages
