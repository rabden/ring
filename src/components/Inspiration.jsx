import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import ImageGallery from './ImageGallery'

const Inspiration = ({ userId, onImageClick, onDownload, onRemix, onViewDetails }) => {
  if (!userId) return null;

  return (
    <ImageGallery
      userId={userId}
      onImageClick={onImageClick}
      onDownload={onDownload}
      onRemix={onRemix}
      onViewDetails={onViewDetails}
      activeView="inspiration"
    />
  );
};

export default Inspiration;