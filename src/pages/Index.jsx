
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import LoadingScreen from '@/components/LoadingScreen';
import { useSupabaseAuth } from '@/integrations/supabase/auth';

const Index = () => {
  const navigate = useNavigate();
  const { session, isLoading } = useSupabaseAuth();

  // Show loading screen while checking auth
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Redirect authenticated users to the inspiration page
  if (session) {
    navigate('/inspiration#latest');
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 container relative">
        <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)]" />
        <div className="h-full flex flex-col items-center justify-center text-center gap-8 max-w-3xl mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-foreground/80 to-foreground/60">
            Unleash Your Creative Vision
          </h1>
          <p className="text-xl text-muted-foreground max-w-[85%] sm:max-w-[75%] leading-normal">
            Turn your ideas into stunning images with our AI-powered image generation platform. Fast, easy, and endlessly creative.
          </p>
          <Button 
            onClick={() => navigate('/login')} 
            size="lg" 
            className="gap-2"
          >
            Get Started <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Index;
