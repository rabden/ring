import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { Loader } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PasswordInput } from './PasswordInput';

export const EmailAuthForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async (type) => {
    setError('');
    setIsLoading(true);
    try {
      let result;
      if (type === 'signup') {
        result = await supabase.auth.signUp({
          email,
          password,
        });
      } else {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      }

      if (result.error) throw result.error;
      
      if (type === 'signup') {
        toast.success('Check your email to confirm your account');
      }
    } catch (error) {
      console.error('Auth error:', error.message);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center">
      <div className="w-full max-w-[300px]">
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <Input
                id="signin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signin-password">Password</Label>
              <PasswordInput
                id="signin-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <Button
              className="w-full"
              onClick={() => handleAuth('signin')}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Sign In
            </Button>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <PasswordInput
                id="signup-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <Button
              className="w-full"
              onClick={() => handleAuth('signup')}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Sign Up
            </Button>
          </TabsContent>
        </Tabs>

        {error && (
          <div className={cn(
            "p-3 rounded-lg",
            "bg-destructive/5 text-destructive/90",
            "text-xs md:text-sm text-center",
            "border border-destructive/10",
            "transition-all duration-200"
          )}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};