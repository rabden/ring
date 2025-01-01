import React, { useState, useEffect } from 'react'
import { Loader, Check, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useModelConfigs } from '@/hooks/useModelConfigs'
import { MeshGradient } from "@/components/ui/mesh-gradient"
import { cn } from "@/lib/utils"

const GeneratingImagesDropdown = ({ generatingImages = [] }) => {
  const { data: modelConfigs } = useModelConfigs();
  const [showDropdown, setShowDropdown] = useState(false);

  // Show dropdown whenever there are any images (generating or completed)
  useEffect(() => {
    if (generatingImages.length > 0) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [generatingImages.length]);

  if (!showDropdown) return null;

  const processingCount = generatingImages.filter(img => img.status === 'processing').length;
  const pendingCount = generatingImages.filter(img => img.status === 'pending').length;
  const completedCount = generatingImages.filter(img => img.status === 'completed').length;
  const isAllCompleted = generatingImages.length > 0 && generatingImages.every(img => img.status === 'completed');

  const sortedImages = [...generatingImages].sort((a, b) => {
    const order = { processing: 0, pending: 1, completed: 2 };
    return order[a.status] - order[b.status];
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "h-8 rounded-xl bg-background/50 hover:bg-accent",
            "transition-all duration-200",
            isAllCompleted && "text-primary"
          )}
        >
          {isAllCompleted ? (
            <div className={cn(
              "p-1 rounded-lg mr-2",
              "animate-in zoom-in duration-300"
            )}>
              <Check className="w-4 h-4 text-primary/90" />
            </div>
          ) : (
            <div className="p-1 rounded-lg mr-2">
              <Loader className="w-4 h-4 animate-spin text-primary/90" />
            </div>
          )}
          <span className="text-sm">
            {processingCount > 0 ? 'Generating' : 
             pendingCount > 0 ? `Queued-${pendingCount}` : 
             completedCount > 0 ? `Generated-${completedCount}` : 'Complete'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="p-2 border-border/80 bg-card m-4"
      >
        <ScrollArea className="max-h-[600px] scrollbar-none">
          {sortedImages.map((img) => (
            <DropdownMenuItem 
              key={img.id} 
              className={cn(
                "flex flex-col items-start gap-2 p-3 rounded-lg",
                "transition-all duration-200",
                "hover:bg-accent/10 focus:bg-accent/10",
                "group relative overflow-hidden",
                img.status === 'processing' && "min-h-[90px]"
              )}
            >
              {img.status === 'processing' && (
                <MeshGradient 
                  className="opacity-50" 
                  intensity="strong" 
                  speed="fast" 
                  size={1000}
                />
              )}
              <div className="flex items-center gap-3 w-full relative">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg ">
                    {img.status === 'processing' ? (
                      <Loader className="w-3.5 h-3.5 animate-spin text-primary/90" />
                    ) : img.status === 'pending' ? (
                      <Clock className="w-3.5 h-3.5 text-muted-foreground/70" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-primary/90" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-primary/90">
                    {img.status === 'processing' ? 'Generating...' : 
                     img.status === 'pending' ? 'Queued' : 'Complete'}
                  </span>
                </div>
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "ml-auto bg-muted/20 hover:bg-muted/30 text-foreground/70",
                    "transition-colors duration-200"
                  )}
                >
                  {img.width}x{img.height}
                </Badge>
              </div>
              {img.prompt && (
                <span className="text-xs text-muted-foreground/60 truncate w-full group-hover:text-muted-foreground/70 transition-colors duration-200">
                  {img.prompt.length > 50 ? `${img.prompt.substring(0, 50)}...` : img.prompt}
                </span>
              )}
              <div className="flex gap-2 text-xs text-muted-foreground/50 group-hover:text-muted-foreground/60 transition-colors duration-200">
                <span>{modelConfigs?.[img.model]?.name || img.model}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default GeneratingImagesDropdown;