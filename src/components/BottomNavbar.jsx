import React, { memo, useState, useEffect } from 'react';
import { Image, Plus, Sparkles, User } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useProUser } from '@/hooks/useProUser';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase';
import GeneratingImagesDrawer from './GeneratingImagesDrawer';
import MobileNavButton from './navbar/MobileNavButton';
import NotificationBell from './notifications/NotificationBell';
import ProfileMenu from './ProfileMenu';
import { cn } from "@/lib/utils";

const BottomNavbar = ({ 
  activeTab, 
  setActiveTab, 
  session, 
  credits, 
  bonusCredits, 
  generatingImages = [],
  nsfwEnabled,
  setNsfwEnabled
}) => {
  const { unreadCount } = useNotifications();
  const { data: isPro } = useProUser(session?.user?.id);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [isAllCompleted, setIsAllCompleted] = useState(false);
  const [prevLength, setPrevLength] = useState(generatingImages.length);
  const navigate = useNavigate();
  const location = useLocation();

  const { data: profile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!session?.user?.id
  });

  // Handle showing checkmark and completion state
  useEffect(() => {
    const allCompleted = generatingImages.length > 0 && generatingImages.every(img => img.status === 'completed');
    setIsAllCompleted(allCompleted);

    if (generatingImages.length < prevLength && prevLength > 0) {
      setShowCheckmark(true);
      const timer = setTimeout(() => {
        setShowCheckmark(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
    setPrevLength(generatingImages.length);
  }, [generatingImages, prevLength]);

  const handleNavigation = (route, tab) => {
    setActiveTab(tab);
    // If navigating to inspiration without a hash, default to #top
    if (route === '/inspiration' && !location.hash) {
      navigate('/inspiration#top');
    } else {
      navigate(route);
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/80 md:hidden z-50 transition-all duration-300">
        <div className="flex items-center justify-around px-2 max-w-md mx-auto h-12">
          <MobileNavButton
            icon={Image}
            isActive={location.pathname === '/' && (!location.hash || location.hash === '#myimages')}
            onClick={() => handleNavigation('/#myimages', 'images')}
          />
          <MobileNavButton
            icon={Sparkles}
            isActive={location.pathname === '/inspiration'}
            onClick={() => handleNavigation('/inspiration#top', 'images')}
          />
          <div className={cn(
            "relative flex items-center justify-center",
          )}>
            <MobileNavButton
              icon={Plus}
              isActive={location.hash === '#imagegenerate'}
              onClick={() => handleNavigation('/#imagegenerate', 'input')}
              onLongPress={() => setDrawerOpen(true)}
              badge={!isAllCompleted ? generatingImages.length : undefined}
              showCheckmark={isAllCompleted}
            />
          </div>
          <MobileNavButton
            icon={NotificationBell}
            isActive={location.hash === '#notifications'}
            onClick={() => handleNavigation('/#notifications', 'notifications')}
          />
          <div className="flex items-center justify-center">
            {session ? (
              <div className="group">
                <ProfileMenu 
                  user={session.user} 
                  credits={credits} 
                  bonusCredits={bonusCredits} 
                  isMobile={true}
                  nsfwEnabled={nsfwEnabled}
                  setNsfwEnabled={setNsfwEnabled}
                  profile={profile}
                />
              </div>
            ) : (
              <MobileNavButton
                icon={User}
                isActive={activeTab === 'profile'}
                onClick={() => setActiveTab('profile')}
              />
            )}
          </div>
        </div>
        <div className="h-safe-area-bottom" />
      </div>

      <GeneratingImagesDrawer 
        open={drawerOpen} 
        onOpenChange={setDrawerOpen}
        generatingImages={generatingImages}
      />
    </>
  );
};

export default memo(BottomNavbar);