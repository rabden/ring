import React from 'react'
import { Button } from "@/components/ui/button"
import { useNavigate, useLocation } from 'react-router-dom'
import GeneratingImagesDropdown from './GeneratingImagesDropdown'
import { cn } from "@/lib/utils"

const ActionButtons = ({ generatingImages }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isInspiration = location.pathname === '/inspiration';
  const isMyImages = location.pathname === '/' && (!location.hash || location.hash === '#myimages');

  return (
    <div className="hidden md:flex items-center gap-2">
      <Button
        variant={isMyImages ? 'default' : 'ghost'}
        onClick={() => navigate('/#myimages')}
        className={cn(
          "h-8 text-xs px-4 rounded-xl bg-background/50 hover:bg-background/70",
          isMyImages && "bg-primary hover:bg-primary/80 text-primary-foreground",
          "transition-all duration-200"
        )}
        aria-pressed={isMyImages}
      >
        My Images
      </Button>
      <Button
        variant={isInspiration ? 'default' : 'ghost'}
        onClick={() => navigate('/inspiration')}
        className={cn(
          "h-8 text-xs px-4 rounded-xl bg-background/50 hover:bg-background/70",
          isInspiration && "bg-primary hover:bg-primary/80 text-primary-foreground",
          "transition-all duration-200"
        )}
        aria-pressed={isInspiration}
      >
        Inspiration
      </Button>
      <GeneratingImagesDropdown generatingImages={generatingImages} />
    </div>
  )
}

export default ActionButtons