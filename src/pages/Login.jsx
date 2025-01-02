import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSupabaseAuth } from '@/integrations/supabase/auth';
import { AuthUI } from '@/integrations/supabase/components/AuthUI';
import LoadingScreen from '@/components/LoadingScreen';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { MeshGradient } from '@/components/ui/mesh-gradient';
import logoImage from '/logo2.png';

const texts = [
  "Create stunning AI art with a single prompt",
  "Transform your imagination into reality",
  "Generate multiple styles with one click",
  "Share and remix creations with the community",
  "Fine-tune your art with advanced controls",
  "Explore endless creative possibilities",
  "Join a community of AI artists"
];

const images = [
  "https://i.ibb.co.com/TgcCsdf/HDRDC2.webp",
  "https://i.ibb.co.com/hc3dWxr/images-example-zgfn69jth.jpg",
  "https://i.ibb.co.com/rs5g7Xz/3.png",
  "https://i.ibb.co.com/8PnDLkf/1.png",
  "https://i.ibb.co.com/88P57s7/ID2.png",
  "https://i.ibb.co.com/gjrM8R5/out-0-1.webp",
  "https://i.ibb.co.com/DkdtLrG/Comfy-UI-00047.png",
  "https://i.ibb.co.com/NNWjs4d/A3.png",
  "https://i.ibb.co.com/nkxPsYG/images-2.jpg"
];

const DISPLAY_DURATION = 8000;

const AnimatedText = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-[2rem] flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ 
            y: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className="text-base md:text-lg text-foreground/70 font-normal absolute"
        >
          {texts[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

const Login = () => {
  const { session, loading } = useSupabaseAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentImageIndex, setCurrentImageIndex] = useState(() => Math.floor(Math.random() * images.length));
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    // Check if page is in an iframe or being rendered by puppeteer
    try {
      const isIframe = window.self !== window.top;
      const isPuppeteer = navigator.userAgent.includes('puppeteer');
      setIsInIframe(isIframe || isPuppeteer);
    } catch (e) {
      setIsInIframe(true);
    }
  }, []);

  useEffect(() => {
    if (session) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [session, loading, navigate, location]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
      setIsImageLoading(true);
    }, DISPLAY_DURATION);

    return () => clearInterval(interval);
  }, []);

  // Preload logo
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = logoImage;
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background backdrop-blur-sm relative overflow-hidden">
      <MeshGradient 
        intensity="medium" 
        speed="fast" 
        size={800}
        className="z-0"
        className2="bg-background/5 backdrop-blur-[1px]"
      />
      {/* Left side with background image */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full h-[50vh] md:h-auto md:w-3/5 relative overflow-hidden z-10"
      >
        <div className="relative w-full h-full">
          <div className="absolute inset-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <img
                  src={images[currentImageIndex]}
                  alt="Feature showcase"
                  onLoad={() => setIsImageLoading(false)}
                  className={cn(
                    "w-full h-full object-cover transition-all duration-500",
                    isImageLoading ? "opacity-0" : "opacity-100"
                  )}
                  style={{ 
                    imageRendering: "high-quality",
                    WebkitImageSmoothing: "high"
                  }}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Right side - Auth UI */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
        className="w-full md:h-auto md:w-3/5 flex items-center justify-center p-2 mt-10 md:mt-0 relative z-10"
      >
        <div className="w-full space-y-4 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="space-y-2 text-center"
          >
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-3xl md:text-3xl font-medium tracking-tight">
                Welcome to
              </h1>
              <div className="flex items-center">
                <img 
                  src={logoImage}
                  alt="Ring Logo" 
                  className="w-8 h-8 object-contain"
                  loading="eager"
                  fetchPriority="high"
                />
                <span className="text-3xl md:text-3xl font-medium tracking-tight">
                  ing
                </span>
              </div>
            </div>
            <AnimatedText />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="space-y-4"
          >
            <AuthUI buttonText="Continue with Google" />
            <p className="text-center text-sm text-muted-foreground/60">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </motion.div>
        </div>
      </motion.div>

      {isInIframe && (
        <div className="fixed top-4 right-4 bg-red-500/20 border border-red-500/60 backdrop-blur-sm rounded-xl p-3 z-50">
          <p className="text-red-500 text-sm font-medium">
            Please Open Preview in new Tab To Be able to Continue
          </p>
        </div>
      )}
    </div>
  );
};

export default Login;