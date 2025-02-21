import React from 'react';
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const CancelGenerationDialog = ({ isOpen, onClose, onConfirm }) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className={cn(
        "sm:max-w-[400px]",
        "border-border/80 bg-card/95",
        "backdrop-blur-[2px]",
        "shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
      )}>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-sm font-medium text-foreground">
            Cancel Image Generation
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            Are you sure you want to cancel this image generation? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            className={cn(
              "h-8 rounded-lg text-sm",
              "bg-muted/5 hover:bg-muted/10",
              "transition-all duration-200"
            )}
          >
            No, keep generating
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className={cn(
              "h-8 rounded-lg text-sm",
              "bg-destructive/90 hover:bg-destructive/80",
              "transition-all duration-200"
            )}
          >
            Yes, cancel generation
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CancelGenerationDialog; 