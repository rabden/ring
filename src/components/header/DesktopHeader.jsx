
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import ProfileMenu from '../ProfileMenu';
import ActionButtons from '../ActionButtons';
import SearchBar from '../search/SearchBar';
import NotificationBell from '../notifications/NotificationBell';
import PrivateFilterButton from '../filters/PrivateFilterButton';
import InspirationFilterButtons from '../filters/InspirationFilterButtons';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

const DesktopHeader = ({ 
  user, 
  credits, 
  bonusCredits, 
  generatingImages,
  onSearch,
  showPrivate,
  onTogglePrivate,
  nsfwEnabled,
  setNsfwEnabled,
  showFollowing,
  showTop,
  onFollowingChange,
  onTopChange,
  rightContent
}) => {
  const location = useLocation();
  const isInspiration = location.pathname === '/inspiration';
  const isMyImages = location.pathname === '/' && (!location.hash || location.hash === '#myimages');
  const [showDonateDialog, setShowDonateDialog] = useState(false);

  return (
    <>
      <Dialog open={showDonateDialog} onOpenChange={setShowDonateDialog}>
        <DialogContent className="flex flex-col w-[95%] sm:w-[85%] sm:max-w-[525px] h-[90vh] sm:h-auto sm:max-h-[80vh] p-0 gap-0">
          <DialogHeader className="p-4 sm:p-6 pb-0">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-center px-0 sm:px-4">
              🆘 Urgent: Your Support Needed! 💝
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 px-4 sm:px-6">
            <DialogDescription className="space-y-4 sm:space-y-6 pt-4 sm:pt-6 text-base sm:text-lg">
              <p className="leading-relaxed">
                Dear Amazing User, 
              </p>
              <p className="leading-relaxed">
                I'm reaching out because I'm in a critical situation. My resources are rapidly depleting, and I'm struggling to keep this project alive. The server costs are mounting, and I'm finding it increasingly difficult to maintain and improve this platform that we all love. 
              </p>
              <p className="leading-relaxed">
                Without immediate support, I might have to scale back or even pause development. Your contribution, no matter how small, could be the lifeline this project needs right now. 🙏
              </p>
            </DialogDescription>
          </ScrollArea>
          <div className="border-t border-border/50 mt-4 p-4 sm:p-6 pt-4">
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-base sm:text-lg py-4 sm:py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => window.open('https://skrill.me/rq/Rabiul/5/USD?key=QvI6sdXr-vbmRBTunrjv4PJLv7_', '_blank')}
            >
              Support $5 💖
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className={cn(
        "hidden md:block fixed top-0 left-0 right-0 z-50 h-12",
        "bg-background/95 backdrop-blur-[2px]",
        "border-b border-border/90",
        "transition-all duration-200 ease-in-out"
      )}>
        <div className={cn(
          "flex justify-between items-center h-full px-10 max-w-full",
          "transition-all duration-200 ease-in-out"
        )}>
          {/* Left side - Profile, Notifications, Search */}
          <div className={cn(
            "flex items-center gap-4",
            "transition-all duration-200 ease-in-out"
          )}>
            <div className={cn(
              "h-8",
              "transition-transform duration-200 ease-in-out",
            )}>
              <ProfileMenu 
                user={user} 
                credits={credits} 
                bonusCredits={bonusCredits}
                nsfwEnabled={nsfwEnabled}
                setNsfwEnabled={setNsfwEnabled}
              />
            </div>
            <div className={cn(
              "h-8",
              "transition-transform duration-200 ease-in-out",
            )}>
              <NotificationBell />
            </div>
            <div className="transition-all duration-200 ease-in-out">
              <SearchBar onSearch={onSearch} />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-primary/5 hover:bg-primary/10 text-primary border-primary/30"
              onClick={() => setShowDonateDialog(true)}
            >
              Important! 🆘
            </Button>
          </div>

          {/* Right side - Navigation Buttons and Generating Status */}
          <div className={cn(
            "flex items-center gap-3",
            "transition-all duration-200 ease-in-out"
          )}>
            {isMyImages && (
              <div className="transition-transform duration-200 ease-in-out">
                <PrivateFilterButton
                  showPrivate={showPrivate}
                  onToggle={onTogglePrivate}
                />
              </div>
            )}
            {isInspiration && (
              <div className="transition-transform duration-200 ease-in-out">
                <InspirationFilterButtons
                  className="flex-1"
                />
              </div>
            )}
            <div className="transition-transform duration-200 ease-in-out">
              <ActionButtons 
                generatingImages={generatingImages}
                className={cn(
                  "gap-3",
                  "transition-all duration-200 ease-in-out"
                )}
                buttonClassName={cn(
                  "h-8 rounded-lg px-3",
                  "bg-transparent hover:bg-muted/50",
                  "text-foreground/70 hover:text-foreground",
                  "transition-all duration-200 ease-in-out"
                )}
              />
            </div>
            {rightContent && (
              <div className="transition-transform duration-200 ease-in-out">
                {rightContent}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DesktopHeader;
