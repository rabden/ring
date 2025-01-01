import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ArrowLeft,
  Wand2,
  Image as ImageIcon,
  Settings,
  Sparkles,
  Share2,
  Lock,
  Palette,
  ChevronRight,
  Play,
  Lightbulb,
  Zap,
  Code,
  Key,
  Menu,
  X,
  BookOpen,
  Copy,
  Workflow
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useModelConfigs } from '@/hooks/useModelConfigs';
import { cn } from '@/lib/utils';

const sections = [
  { id: 'getting-started', title: 'Getting Started', icon: Play },
  { id: 'features', title: 'Features', icon: Sparkles },
  { id: 'advanced-techniques', title: 'Advanced Techniques', icon: Code },
  { id: 'tips', title: 'Tips & Tricks', icon: Lightbulb },
  { id: 'resources', title: 'Resources', icon: ImageIcon }
];

const glowStyles = {
  heroGlow: "after:absolute after:inset-0 after:bg-[radial-gradient(ellipse_at_center,rgba(var(--primary-rgb),0.15),transparent_50%)] after:animate-mesh after:-z-10",
  cardGlow: "after:absolute after:inset-0 after:bg-[radial-gradient(ellipse_at_center,rgba(var(--primary-rgb),0.1),transparent_50%)] after:animate-mesh after:-z-10",
  textGlow: "text-shadow-glow",
  cardHover: "hover:shadow-lg hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300",
  gradientBg: "bg-gradient-to-br from-background/95 via-background/98 to-primary/5",
  gradientText: "bg-gradient-to-r from-primary via-primary/80 to-foreground bg-clip-text text-transparent",
  buttonGradient: "bg-gradient-to-r from-primary/90 to-primary/80 hover:from-primary/80 hover:to-primary/70",
};

const FeatureCard = ({ icon: Icon, title, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.3 }}
    whileHover={{ y: -4 }}
    className="group"
  >
    <Card className={cn(
      "p-6 h-full relative overflow-hidden rounded-2xl border-border/80",
      glowStyles.cardHover,
      glowStyles.gradientBg
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="flex items-start gap-4 relative">
        <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className={cn("text-xl font-medium mb-2", glowStyles.gradientText)}>{title}</h3>
          <p className="text-muted-foreground/70 group-hover:text-foreground/80 transition-colors duration-300">{description}</p>
        </div>
      </div>
    </Card>
  </motion.div>
);

const VideoPlaceholder = ({ title }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    whileHover={{ scale: 1.02 }}
    className={cn(
      "relative aspect-video rounded-2xl overflow-hidden group cursor-pointer",
      glowStyles.gradientBg
    )}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px]">
      <motion.div 
        whileHover={{ scale: 1.1 }}
        className="p-4 rounded-full bg-primary/20 group-hover:bg-primary/30 transition-all duration-300 border border-primary/20"
      >
        <Play className="h-8 w-8 text-primary" />
      </motion.div>
    </div>
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/95 to-transparent backdrop-blur-[1px]">
      <p className="text-sm font-medium group-hover:text-primary transition-colors duration-300">{title}</p>
    </div>
  </motion.div>
);

const InteractivePromptBuilder = () => {
  const [prompt, setPrompt] = useState('A mountain landscape');
  const [showEnhanced, setShowEnhanced] = useState(false);

  const enhancePrompt = () => {
    setShowEnhanced(true);
    setPrompt('A majestic mountain landscape at sunset, dramatic lighting, snow-capped peaks, volumetric clouds, ultra detailed, 8k resolution');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <div className={cn(
        "bg-muted/30 p-4 rounded-lg relative overflow-hidden",
        glowStyles.cardHover
      )}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="flex justify-between items-center mb-2 relative">
          <p className="text-sm font-medium">Your Prompt</p>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowEnhanced(false)}
            className="text-xs hover:text-primary transition-colors"
          >
            Reset
          </Button>
        </div>
        <motion.p 
          key={prompt}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-muted-foreground"
        >
          {prompt}
        </motion.p>
      </div>
      {!showEnhanced && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button 
            variant="outline" 
            size="sm" 
            onClick={enhancePrompt}
            className={cn(
              "w-full group relative overflow-hidden",
              glowStyles.cardHover
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Wand2 className="w-4 h-4 mr-2 text-primary" />
            <span className="relative">Enhance Prompt</span>
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

const heroImages = [
  "/hero-1.jpg", // Replace with actual image paths
  "/hero-2.jpg",
  "/hero-3.jpg",
  "/hero-4.jpg"
];

const ModelShowcase = () => {
  const { data: modelConfigs } = useModelConfigs();
  const [currentModelIndex, setCurrentModelIndex] = useState(0);
  const models = Object.entries(modelConfigs || {})
    .filter(([_, config]) => config.category !== "NSFW")
    .map(([key, config]) => ({
      id: key,
      ...config,
      description: getModelDescription(key)
    }));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentModelIndex((prev) => (prev + 1) % models.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [models.length]);

  const currentModel = models[currentModelIndex];

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(var(--primary-rgb),0.15),transparent_50%)] animate-mesh" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(var(--primary-rgb),0.15),transparent_50%)] animate-mesh" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative">
        <motion.div
          key={currentModel?.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="space-y-6 relative"
        >
          <div className={glowStyles.cardGlow}>
            <Badge 
              variant="outline" 
              className="mb-2 bg-gradient-to-r from-primary/30 via-primary/20 to-transparent border-primary/30 backdrop-blur-sm"
            >
              Model
            </Badge>
            <h3 className={cn(
              "text-2xl font-bold mb-2",
              glowStyles.gradientText,
              glowStyles.textGlow
            )}>
              {currentModel?.name}
            </h3>
            <p className="text-muted-foreground backdrop-blur-sm">{currentModel?.description}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className="bg-gradient-to-r from-secondary/50 via-secondary/30 to-transparent backdrop-blur-sm"
            >
              {currentModel?.category}
            </Badge>
            {currentModel?.isPremium && (
              <Badge 
                variant="default" 
                className="bg-gradient-to-r from-orange-500 via-purple-500 to-pink-500 animate-gradient-x backdrop-blur-sm"
              >
                Premium
              </Badge>
            )}
          </div>
        </motion.div>

        <motion.div
          key={`image-${currentModel?.id}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="relative aspect-square rounded-lg overflow-hidden shadow-2xl shadow-primary/20"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
          <img
            src={`/model-examples/${currentModel?.id}.jpg`}
            alt={currentModel?.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.1),transparent_70%)] animate-mesh" />
        </motion.div>
      </div>
    </div>
  );
};

const FeatureShowcase = () => {
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const features = [
    {
      title: "Smart Prompt Enhancement",
      description: "No need to learn complex prompt engineering - our AI automatically enhances your natural language descriptions into optimal prompts. Just describe what you want in simple terms, and our system handles the technical details.",
      icon: Sparkles,
      image: "/features/smart-prompt.jpg"
    },
    {
      title: "Instant Style Application",
      description: "Browse our curated collection of artistic styles and apply them with a single click. Our platform handles all the technical aspects of style transfer, letting you focus on creativity.",
      icon: Palette,
      image: "/features/style-transfer.jpg"
    },
    {
      title: "Smart Variations",
      description: "Explore different interpretations of your vision with our intelligent variation system. Each variation maintains the core elements of your concept while offering unique artistic perspectives.",
      icon: Copy,
      image: "/features/variations.jpg"
    },
    {
      title: "Professional Workflow",
      description: "Focus on your creative process while our platform handles technical optimization. Features like automatic upscaling, enhancement, and style preservation ensure professional results every time.",
      icon: Workflow,
      image: "/features/workflow.jpg"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeatureIndex((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentFeature = features[currentFeatureIndex];

  return (
    <div className="relative">
      {/* Background gradient for the section */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(var(--primary-rgb),0.1),transparent_50%)] animate-mesh" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(var(--primary-rgb),0.1),transparent_50%)] animate-mesh" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative">
        {/* Feature Info */}
        <motion.div
          key={currentFeature.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="space-y-6 relative"
        >
          <div className={glowStyles.cardGlow}>
            <Badge 
              variant="outline" 
              className="mb-2 bg-gradient-to-r from-primary/30 via-primary/20 to-transparent border-primary/30 backdrop-blur-sm"
            >
              Feature
            </Badge>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/30 via-primary/20 to-transparent backdrop-blur-sm">
                <currentFeature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className={`text-2xl font-bold bg-gradient-to-r from-primary via-primary/80 to-transparent bg-clip-text text-transparent ${glowStyles.textGlow}`}>
                {currentFeature.title}
              </h3>
            </div>
            <p className="text-muted-foreground backdrop-blur-sm">{currentFeature.description}</p>
          </div>
        </motion.div>

        {/* Feature Image */}
        <motion.div
          key={`image-${currentFeature.title}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="relative aspect-square rounded-lg overflow-hidden shadow-2xl shadow-primary/20"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
          <img
            src={currentFeature.image}
            alt={currentFeature.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.1),transparent_70%)] animate-mesh" />
        </motion.div>
      </div>
    </div>
  );
};

// Helper function to get model descriptions
const getModelDescription = (modelId) => {
  const descriptions = {
    turbo: "Lightning-fast generation optimized for speed while maintaining quality. Perfect for rapid prototyping and quick iterations.",
    flux: "Our balanced model offering great quality and reasonable speed. The go-to choice for most creative projects.",
    fluxDev: "Premium high-fidelity model with enhanced detail and coherence. Ideal for professional-grade creations.",
    ultra: "The ultimate in image quality, pushing the boundaries of what's possible with AI generation."
  };
  return descriptions[modelId] || "";
};

const Documentation = () => {
  const [activeSection, setActiveSection] = useState('');
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [currentHeroImage, setCurrentHeroImage] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      let current = '';

      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - 100) {
          current = section.getAttribute('id');
        }
      });

      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setShowMobileNav(false);
    }
  };

  return (
    <div className="min-h-screen bg-background/95 backdrop-blur-sm">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background/98 to-background border-b border-border/80">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(var(--primary-rgb),0.15),transparent_50%)] animate-mesh pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(var(--primary-rgb),0.15),transparent_50%)] animate-mesh pointer-events-none" />
        
        <div className="container max-w-6xl mx-auto px-4 py-8 md:py-16 lg:py-24 relative">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors relative z-10 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:text-primary transition-colors duration-300" />
            <span className="group-hover:text-primary transition-colors duration-300">Back to App</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative z-10 space-y-6"
            >
              <Badge 
                className="mb-4 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/10 backdrop-blur-sm border-primary/20" 
                variant="secondary"
              >
                Documentation
              </Badge>
              <h1 className={cn(
                "text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight",
                glowStyles.gradientText,
                glowStyles.textGlow
              )}>
                Create Amazing AI Art
              </h1>
              <p className="text-lg md:text-xl text-foreground/70 backdrop-blur-sm">
                Learn how to use our powerful AI image generation platform to bring your creative vision to life.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Button 
                  size="lg" 
                  className={cn(
                    glowStyles.buttonGradient,
                    "rounded-xl"
                  )}
                  onClick={() => window.open('https://www.youtube.com/watch?v=your-tutorial-id', '_blank')}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Watch Tutorial
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="rounded-xl border-primary/20 hover:bg-primary/10"
                  onClick={() => {
                    const docsElement = document.getElementById('features');
                    if (docsElement) {
                      docsElement.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Read Docs
                </Button>
              </div>
            </motion.div>

            <motion.div
              key={currentHeroImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className={cn(
                "relative aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-primary/20",
                glowStyles.heroGlow,
                "hidden md:block"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/90" />
              <img
                src={heroImages[currentHeroImage]}
                alt="AI Art Example"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.1),transparent_70%)] animate-mesh" />
            </motion.div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-24 right-0 w-96 h-96 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.2),transparent_70%)] rounded-full blur-3xl animate-mesh pointer-events-none" />
        <div className="absolute -bottom-24 right-48 w-64 h-64 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.25),transparent_70%)] rounded-full blur-2xl animate-mesh pointer-events-none" />
      </div>

      {/* Main Content */}
      <div className="container max-w-6xl mx-auto px-4 py-8 md:py-16">
        {/* Model Showcase Section */}
        <section id="models" className="mb-24 scroll-mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <Badge variant="outline" className="mb-2 bg-gradient-to-r from-primary/20 to-primary/10 border-primary/20">
              Models
            </Badge>
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Powerful AI Models
            </h2>
            <p className="text-xl text-muted-foreground">
              Choose from our suite of specialized models, each optimized for different use cases.
            </p>
          </motion.div>

          <ModelShowcase />
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24" id="features">
          <div className="container max-w-6xl">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">Features</Badge>
              <h2 className="text-3xl font-bold mb-4">Advanced Features Made Simple</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our platform handles the complexity of AI image generation, so you can focus on your creative vision. 
                No technical expertise required - just pure creativity.
              </p>
            </div>
            {/* Rest of the features section */}
          </div>
        </section>

        {/* Getting Started Section */}
        <section id="getting-started" className="mb-24 scroll-mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <Badge variant="outline" className="mb-2">Getting Started</Badge>
            <h2 className="text-3xl font-bold mb-4">Start Creating in Minutes</h2>
            <p className="text-xl text-muted-foreground">Follow our simple guide to begin generating amazing AI art.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <VideoPlaceholder title="Quick Start Tutorial" />
            <div className="space-y-6">
              {[
                {
                  step: 1,
                  title: "Enter Your Prompt",
                  description: "Describe your desired image in detail. The more specific you are, the better the results will be."
                },
                {
                  step: 2,
                  title: "Choose Your Settings",
                  description: "Select your preferred model and adjust settings like size, quality, and style to match your vision."
                },
                {
                  step: 3,
                  title: "Generate & Share",
                  description: "Click generate and watch your idea come to life. Save your favorites and share them with the community."
                }
              ].map(({ step, title, description }) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: step * 0.2 }}
                  className="flex gap-4 items-start"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {step}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{title}</h3>
                    <p className="text-muted-foreground">{description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Advanced Techniques */}
        <section id="advanced-techniques" className="mb-24 scroll-mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <Badge variant="outline" className="mb-2">Advanced Techniques</Badge>
            <h2 className="text-3xl font-bold mb-4">Master AI Art Creation</h2>
            <p className="text-xl text-muted-foreground">Take your generations to the next level with advanced techniques.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Code className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Prompt Engineering</h3>
                  <p className="text-muted-foreground">
                    Learn the art of crafting effective prompts that consistently produce amazing results.
                  </p>
                </div>
              </div>
              <InteractivePromptBuilder />
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Key className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Style Keywords</h3>
                  <p className="text-muted-foreground">
                    Use these powerful keywords to influence the style of your generations.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  "cinematic", "photorealistic", "anime", "digital art",
                  "oil painting", "watercolor", "concept art", "illustration",
                  "3D render", "studio lighting"
                ].map((style, i) => (
                  <TooltipProvider key={i}>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge
                          variant="secondary"
                          className="text-sm cursor-help"
                        >
                          {style}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Click to copy this style keyword</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </Card>
          </div>
        </section>

        {/* Tips & Tricks */}
        <section id="tips" className="mb-24 scroll-mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <Badge variant="outline" className="mb-2">Tips & Tricks</Badge>
            <h2 className="text-3xl font-bold mb-4">Pro Tips for Better Results</h2>
            <p className="text-xl text-muted-foreground">Expert advice to help you create better images.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Lightbulb,
                title: "Be Specific",
                tips: [
                  "Use detailed descriptions",
                  "Specify lighting conditions",
                  "Include style references",
                  "Mention camera angles"
                ]
              },
              {
                icon: Settings,
                title: "Optimize Settings",
                tips: [
                  "Higher steps for detail",
                  "Use seed for consistency",
                  "Match aspect ratio to need",
                  "Balance quality vs speed"
                ]
              },
              {
                icon: Palette,
                title: "Style Mastery",
                tips: [
                  "Combine multiple styles",
                  "Use artistic references",
                  "Experiment with models",
                  "Save successful prompts"
                ]
              }
            ].map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <Card className="p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <section.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">{section.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {section.tips.map((tip, j) => (
                      <motion.li
                        key={j}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: (i * 0.2) + (j * 0.1) }}
                        className="flex items-center gap-2 text-muted-foreground"
                      >
                        <ChevronRight className="h-4 w-4 text-primary" />
                        {tip}
                      </motion.li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Resources Section */}
        <section id="resources" className="scroll-mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <Badge variant="outline" className="mb-2">Resources</Badge>
            <h2 className="text-3xl font-bold mb-4">Additional Resources</h2>
            <p className="text-xl text-muted-foreground">Helpful resources to expand your knowledge.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <VideoPlaceholder title="Advanced Prompt Engineering Tutorial" />
            <VideoPlaceholder title="Creating Consistent Character Designs" />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Documentation;