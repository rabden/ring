import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Link, useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/integrations/supabase/auth';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

const ProfileMenu = ({ user, credits, bonusCredits, isMobile = false, nsfwEnabled, setNsfwEnabled, profile }) => {
  const { signOut } = useSupabaseAuth();
  const { theme, setTheme } = useTheme();
  const { setNsfwEnabled: setPreferenceNsfwEnabled } = useUserPreferences();
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleNSFWToggle = (checked) => {
    setNsfwEnabled(checked);
    setPreferenceNsfwEnabled(checked);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {isMobile ? (
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || user?.user_metadata?.avatar_url} alt={user?.user_metadata?.name} />
            <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        ) : (
          <button className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
            <Avatar className="h-7 w-7">
              <AvatarImage src={profile?.avatar_url || user?.user_metadata?.avatar_url} alt={user?.user_metadata?.name} />
              <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            {user?.user_metadata?.name || user?.email}
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link to="/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/queue">Queue Monitor</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center justify-between">
          Theme
          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="grid gap-1.5">
            {theme === 'light' ? (
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            )}
          </button>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center justify-between">
          NSFW Content
          <Switch id="nsfw" checked={nsfwEnabled} onCheckedChange={handleNSFWToggle} />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileMenu;
