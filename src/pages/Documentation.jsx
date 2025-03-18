
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  Workflow,
  BookOpen as BookOpenIcon,
  HelpCircle,
  Search,
  Database,
  Plus,
  PenTool,
  Eye,
  Shield,
  RefreshCw,
  Coins,
  Github,
  UserPlus,
  Layers,
  Heart,
  MessageSquare,
  ChevronDown
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

// Documentation sections
const mainSections = [
  { id: 'getting-started', title: 'Getting Started', icon: Play, description: 'Learn how to use our platform in minutes' },
  { id: 'models', title: 'Models', icon: Layers, description: 'Explore our diverse AI models for different needs' },
  { id: 'features', title: 'Features', icon: Sparkles, description: 'Discover powerful features to enhance your creations' },
  { id: 'techniques', title: 'Techniques', icon: PenTool, description: 'Advanced techniques for better results' },
  { id: 'prompts', title: 'Prompt Engineering', icon: MessageSquare, description: 'Craft effective prompts for amazing results' },
  { id: 'faq', title: 'FAQ', icon: HelpCircle, description: 'Answers to common questions' }
];

// Models data
const modelData = [
  {
    id: 'turbo',
    name: 'Turbo',
    description: 'Lightning-fast generation optimized for speed while maintaining quality. Perfect for rapid prototyping and iterations.',
    category: 'Speed',
    strengths: ['Quick results', 'Good for iterations', 'Low credit cost'],
    suitableFor: ['Prototyping ideas', 'Early concept testing', 'Simple illustrations'],
    speedRating: 5,
    qualityRating: 3,
    creditCost: 1
  },
  {
    id: 'flux',
    name: 'Flux',
    description: 'Our balanced model offering great quality and reasonable speed. The go-to choice for most creative projects.',
    category: 'Balanced',
    strengths: ['Well-balanced', 'Great for most use cases', 'Reliable results'],
    suitableFor: ['General creative work', 'Character portraits', 'Detailed scenes'],
    speedRating: 3,
    qualityRating: 4,
    creditCost: 2
  },
  {
    id: 'fluxDev',
    name: 'Flux Developer',
    description: 'Premium high-fidelity model with enhanced detail and coherence. Ideal for professional-grade creations.',
    category: 'Premium',
    strengths: ['Enhanced details', 'Better composition', 'Improved coherence'],
    suitableFor: ['Professional illustration', 'Complex scenes', 'Detailed characters'],
    speedRating: 2,
    qualityRating: 4.5,
    creditCost: 3,
    premium: true
  },
  {
    id: 'ultra',
    name: 'Ultra',
    description: 'The ultimate in image quality, pushing the boundaries of what's possible with AI generation.',
    category: 'Maximum Quality',
    strengths: ['Highest quality', 'Photorealistic results', 'Superior detail'],
    suitableFor: ['Art prints', 'Professional portfolios', 'Commercial work'],
    speedRating: 1,
    qualityRating: 5,
    creditCost: 5,
    premium: true
  }
];

// Feature cards data
const featureCards = [
  {
    title: "Smart Prompt Enhancement",
    description: "Our AI automatically enhances your natural language descriptions into optimal prompts. Just describe what you want in simple terms.",
    icon: Sparkles,
  },
  {
    title: "Instant Style Application",
    description: "Browse our collection of artistic styles and apply them with a single click. We handle all the technical aspects of style transfer.",
    icon: Palette,
  },
  {
    title: "Smart Variations",
    description: "Explore different interpretations of your vision with our intelligent variation system. Each variation maintains core elements while offering unique perspectives.",
    icon: Copy,
  },
  {
    title: "Professional Workflow",
    description: "Focus on your creative process while our platform handles technical optimization. Features like automatic upscaling, enhancement, and style preservation ensure professional results.",
    icon: Workflow,
  },
  {
    title: "Privacy Controls",
    description: "Control who sees your creations with granular privacy settings. Keep your work private or share it with the world.",
    icon: Lock,
  },
  {
    title: "Collaboration Tools",
    description: "Share and collaborate on projects with team members or clients. Add comments, suggest changes, and iterate together.",
    icon: Share2,
  },
];

// Technique examples
const techniques = [
  {
    title: "Style Mixing",
    description: "Combine multiple artistic styles to create unique aesthetics",
    example: "portrait of a woman, 50% oil painting style, 50% cyberpunk digital art",
    difficulty: "Medium"
  },
  {
    title: "Subject Focusing",
    description: "Emphasize specific elements in your image",
    example: "close-up portrait of a woman, dramatic lighting, shallow depth of field, background blurred",
    difficulty: "Easy"
  },
  {
    title: "Composition Control",
    description: "Direct the arrangement of elements in your scene",
    example: "landscape with mountains in the background, lake in the foreground, person standing on the right third, sunset lighting",
    difficulty: "Hard"
  },
  {
    title: "Lighting Specification",
    description: "Define the lighting to set mood and atmosphere",
    example: "portrait of a detective, film noir style, low-key lighting, strong shadows, dramatic contrast",
    difficulty: "Medium"
  }
];

// FAQs data
const faqs = [
  {
    question: "How many credits do I need for an image?",
    answer: "Credit costs vary by model. Turbo costs 1 credit, Flux costs 2 credits, Flux Developer costs 3 credits, and Ultra costs 5 credits per image. Premium models offer higher quality but use more credits."
  },
  {
    question: "How do I get more credits?",
    answer: "You can purchase additional credits from your account dashboard. We also offer subscription plans with monthly credit allocations, and you can earn bonus credits by sharing your creations publicly or participating in community challenges."
  },
  {
    question: "Can I use the images commercially?",
    answer: "Yes, all images you generate are yours to use, including for commercial purposes. However, please review our terms of service for specific limitations regarding illegal, harmful, or misleading content."
  },
  {
    question: "How can I improve my results?",
    answer: "Better results come from better prompts. Try being specific about subject, style, lighting, and composition. Use our prompt enhancement feature, review the techniques section in our documentation, and study successful examples in the community gallery."
  },
  {
    question: "What if I don't like the generated image?",
    answer: "You can generate variations of any image, adjust your prompt, or try different style settings. If an image fails to generate properly, those credits are automatically refunded to your account."
  },
  {
    question: "Can I upload my own images?",
    answer: "Yes, you can upload reference images or images to modify. Our system can use these for style reference, variations, or as a base for further editing."
  }
];

// Style keywords for prompt engineering
const styleKeywords = [
  "cinematic", "photorealistic", "anime", "digital art",
  "oil painting", "watercolor", "concept art", "illustration",
  "3D render", "studio lighting", "portrait", "fantasy",
  "sci-fi", "cyberpunk", "minimalist", "abstract",
  "vintage", "noir", "pastel", "comic book"
];

// Quality enhancer keywords
const qualityKeywords = [
  "detailed", "high resolution", "sharp focus", "professional",
  "award winning", "trending", "hyperrealistic", "8K",
  "masterpiece", "intricate", "stunning", "beautiful",
  "atmospheric", "artstation", "unreal engine", "octane render"
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

// Rating component for model comparison
const RatingBar = ({ value, max = 5, label }) => (
  <div className="w-full">
    <div className="flex justify-between mb-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-primary">{value}/{max}</span>
    </div>
    <div className="w-full h-2 bg-secondary/30 rounded-full">
      <div 
        className="h-2 bg-primary rounded-full" 
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  </div>
);

// Interactive prompt builder component
const InteractivePromptBuilder = () => {
  const [subject, setSubject] = useState('mountain landscape');
  const [style, setStyle] = useState('');
  const [quality, setQuality] = useState([]);
  const [prompt, setPrompt] = useState('A mountain landscape');

  // Update prompt when components change
  useEffect(() => {
    let newPrompt = `A ${subject}`;
    
    if (style) {
      newPrompt += `, ${style} style`;
    }
    
    if (quality.length > 0) {
      newPrompt += `, ${quality.join(', ')}`;
    }
    
    setPrompt(newPrompt);
  }, [subject, style, quality]);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    // In a real implementation, you would show a toast notification here
  };

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-2 rounded-md bg-background/50 border border-border"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Art Style</label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full p-2 rounded-md bg-background/50 border border-border"
          >
            <option value="">Select a style</option>
            {styleKeywords.map((keyword) => (
              <option key={keyword} value={keyword}>{keyword}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Quality Enhancers (select up to 3)</label>
          <div className="flex flex-wrap gap-2">
            {qualityKeywords.slice(0, 8).map((keyword) => (
              <Badge
                key={keyword}
                variant={quality.includes(keyword) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  if (quality.includes(keyword)) {
                    setQuality(quality.filter(k => k !== keyword));
                  } else if (quality.length < 3) {
                    setQuality([...quality, keyword]);
                  }
                }}
              >
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium">Generated Prompt</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyPrompt}
            className="h-8 gap-1"
          >
            <Copy className="h-3.5 w-3.5" />
            <span className="text-xs">Copy</span>
          </Button>
        </div>
        <div className="p-3 rounded-md bg-background/50 border border-border">
          <p className="text-sm break-words">{prompt}</p>
        </div>
      </div>
    </div>
  );
};

// Model comparison card
const ModelComparisonCard = ({ model }) => {
  return (
    <Card className={cn("overflow-hidden group", glowStyles.cardHover)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start mb-1">
          <div>
            <CardTitle className="text-xl">{model.name}</CardTitle>
            <CardDescription>{model.category}</CardDescription>
          </div>
          {model.premium && (
            <Badge className="bg-gradient-to-r from-orange-500 via-purple-500 to-pink-500 animate-gradient-x border-none">
              Premium
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        <p className="text-sm text-muted-foreground">{model.description}</p>
        
        <div className="space-y-2">
          <RatingBar value={model.speedRating} label="Speed" />
          <RatingBar value={model.qualityRating} label="Quality" />
        </div>
        
        <div className="pt-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Credit Cost:</span>
            <div className="flex items-center">
              {Array(model.creditCost).fill(0).map((_, i) => (
                <Coins key={i} className="h-4 w-4 text-yellow-500 inline" />
              ))}
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Best for:</h4>
            <div className="flex flex-wrap gap-2">
              {model.suitableFor.map((item, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Video tutorial placeholder
const VideoPlaceholder = ({ title, duration }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    whileHover={{ scale: 1.02 }}
    className={cn(
      "relative aspect-video rounded-xl overflow-hidden group cursor-pointer",
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
      {duration && (
        <p className="text-xs text-muted-foreground mt-1">{duration}</p>
      )}
    </div>
  </motion.div>
);

// FAQ item component
const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Collapsible 
      open={isOpen} 
      onOpenChange={setIsOpen}
      className="border border-border rounded-lg mb-3 overflow-hidden"
    >
      <CollapsibleTrigger className="w-full p-4 flex justify-between items-center hover:bg-muted/20 text-left">
        <h3 className="font-medium">{question}</h3>
        <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-4 pt-0">
        <p className="text-muted-foreground">{answer}</p>
      </CollapsibleContent>
    </Collapsible>
  );
};

// Main Documentation component
const Documentation = () => {
  const [activeSection, setActiveSection] = useState('');
  const [showMobileNav, setShowMobileNav] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [activeTab, setActiveTab] = useState('overview');

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

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setShowMobileNav(false);
    }
  };

  return (
    <div className="min-h-screen bg-background/95 backdrop-blur-sm">
      {/* Header/Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background/98 to-background border-b border-border/80">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(var(--primary-rgb),0.15),transparent_50%)] animate-mesh pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(var(--primary-rgb),0.15),transparent_50%)] animate-mesh pointer-events-none" />
        
        <div className="container max-w-6xl mx-auto px-4 py-8 md:py-16 relative">
          <div className="flex justify-between items-center mb-8">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors relative z-10 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:text-primary transition-colors duration-300" />
              <span className="group-hover:text-primary transition-colors duration-300">Back to App</span>
            </Link>

            {isMobile && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowMobileNav(!showMobileNav)}
              >
                {showMobileNav ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
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
                Learn how to use our powerful AI image generation platform to bring your creative vision to life with this comprehensive guide.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Button 
                  size="lg" 
                  className={cn(
                    glowStyles.buttonGradient,
                    "rounded-xl"
                  )}
                  onClick={() => scrollToSection('getting-started')}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Quick Start Guide
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="rounded-xl border-primary/20 hover:bg-primary/10"
                  onClick={() => scrollToSection('models')}
                >
                  <Layers className="w-4 h-4 mr-2" />
                  Explore Models
                </Button>
              </div>
            </motion.div>

            <div className="hidden lg:block">
              <VideoPlaceholder title="Introduction to AI Art Generation" duration="5:32" />
            </div>
          </div>

          {/* Documentation navigation */}
          {!isMobile && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="mt-16"
            >
              <nav className="flex justify-center">
                <ul className="inline-flex gap-2 p-1 rounded-xl bg-muted/30 backdrop-blur-sm">
                  {mainSections.map((section) => (
                    <li key={section.id}>
                      <button
                        onClick={() => scrollToSection(section.id)}
                        className={cn(
                          "px-4 py-2 rounded-lg flex items-center gap-2 transition-colors",
                          activeSection === section.id 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted"
                        )}
                      >
                        <section.icon className="h-4 w-4" />
                        <span>{section.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </motion.div>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        {isMobile && showMobileNav && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-background/95 backdrop-blur-sm border-b border-border/50"
          >
            <div className="container max-w-6xl mx-auto px-4 py-4">
              <ul className="space-y-2">
                {mainSections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className={cn(
                        "w-full px-4 py-3 rounded-lg flex items-center gap-2 transition-colors",
                        activeSection === section.id 
                          ? "bg-primary/10 text-primary" 
                          : "hover:bg-muted"
                      )}
                    >
                      <section.icon className="h-4 w-4" />
                      <div className="text-left">
                        <span className="font-medium">{section.title}</span>
                        <p className="text-xs text-muted-foreground">{section.description}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </div>

      {/* Main Content */}
      <div className="container max-w-6xl mx-auto px-4 py-8 md:py-16">
        {/* Getting Started Section */}
        <section id="getting-started" className="mb-24 scroll-mt-24">
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
            <VideoPlaceholder title="Quick Start Tutorial" duration="3:45" />
            <div className="space-y-6">
              {[
                {
                  step: 1,
                  title: "Enter Your Prompt",
                  description: "Describe your desired image in detail. The more specific you are, the better the results will be.",
                  icon: MessageSquare
                },
                {
                  step: 2,
                  title: "Choose Your Settings",
                  description: "Select your preferred model and adjust settings like size, quality, and style to match your vision.",
                  icon: Settings
                },
                {
                  step: 3,
                  title: "Generate & Share",
                  description: "Click generate and watch your idea come to life. Save your favorites and share them with the community.",
                  icon: Share2
                }
              ].map(({ step, title, description, icon: Icon }) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: step * 0.2 }}
                  className="flex gap-4 items-start"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{title}</h3>
                    <p className="text-muted-foreground">{description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <Card className={cn("border-primary/20", glowStyles.gradientBg)}>
            <CardHeader>
              <CardTitle>Quick Reference</CardTitle>
              <CardDescription>Key shortcuts and info for getting started</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Keyboard Shortcuts
                  </h3>
                  <Table>
                    <TableBody>
                      {[
                        { key: "Ctrl/Cmd + Enter", action: "Generate image" },
                        { key: "Ctrl/Cmd + D", action: "Duplicate image" },
                        { key: "Ctrl/Cmd + S", action: "Save image" },
                        { key: "Ctrl/Cmd + Z", action: "Cancel generation" },
                        { key: "Esc", action: "Close dialogs" }
                      ].map((item, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-mono text-sm">{item.key}</TableCell>
                          <TableCell>{item.action}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    First Steps
                  </h3>
                  <ul className="space-y-2">
                    {[
                      "Try a simple prompt first to understand the basics",
                      "Experiment with different styles and models",
                      "Browse the community gallery for inspiration",
                      "Save prompts that work well for future use",
                      "Join our Discord community for tips and feedback"
                    ].map((tip, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-2"
                      >
                        <ChevronRight className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        <span className="text-muted-foreground">{tip}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Models Section */}
        <section id="models" className="mb-24 scroll-mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <Badge variant="outline" className="mb-2">Models</Badge>
            <h2 className="text-3xl font-bold mb-4">Choose the Right AI Model</h2>
            <p className="text-xl text-muted-foreground">
              Our platform offers several specialized AI models, each with unique strengths and characteristics.
            </p>
          </motion.div>

          <Tabs
            defaultValue="compare"
            className="w-full"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="compare">Compare Models</TabsTrigger>
              <TabsTrigger value="details">Model Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="compare" className="mt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Model</TableHead>
                      <TableHead>Speed</TableHead>
                      <TableHead>Quality</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Best For</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modelData.map((model) => (
                      <TableRow key={model.id}>
                        <TableCell className="font-medium">
                          {model.name}
                          {model.premium && (
                            <Badge className="ml-2 bg-gradient-to-r from-orange-500 via-purple-500 to-pink-500 text-xs">
                              Premium
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {Array(5).fill(0).map((_, i) => (
                              <div 
                                key={i} 
                                className={`w-2 h-4 rounded-sm ${i < model.speedRating ? 'bg-primary' : 'bg-muted'}`}
                              />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {Array(5).fill(0).map((_, i) => (
                              <div 
                                key={i} 
                                className={`w-2 h-4 rounded-sm ${i < model.qualityRating ? 'bg-primary' : 'bg-muted'}`}
                              />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {Array(model.creditCost).fill(0).map((_, i) => (
                            <Coins key={i} className="h-4 w-4 text-yellow-500 inline-block" />
                          ))}
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <div className="flex flex-wrap gap-1">
                            {model.suitableFor.slice(0, 2).map((use, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {use}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="details">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {modelData.map((model) => (
                  <ModelComparisonCard key={model.id} model={model} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Features Section */}
        <section id="features" className="mb-24 scroll-mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <Badge variant="outline" className="mb-2">Features</Badge>
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground">
              Discover the tools and capabilities that make our platform stand out.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureCards.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </section>

        {/* Techniques Section */}
        <section id="techniques" className="mb-24 scroll-mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <Badge variant="outline" className="mb-2">Techniques</Badge>
            <h2 className="text-3xl font-bold mb-4">Advanced Techniques</h2>
            <p className="text-xl text-muted-foreground">
              Learn specialized approaches to get the most out of AI art generation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Techniques</CardTitle>
                <CardDescription>
                  Try these specialized approaches to enhance your results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {techniques.map((technique, index) => (
                    <div key={index} className="pb-4 border-b border-border/50 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{technique.title}</h3>
                        <Badge variant={
                          technique.difficulty === "Easy" ? "outline" :
                          technique.difficulty === "Medium" ? "secondary" : "default"
                        }>
                          {technique.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{technique.description}</p>
                      <div className="bg-muted/30 p-2 rounded-md">
                        <div className="flex items-center justify-between">
                          <code className="text-xs">{technique.example}</code>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Copy to clipboard</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Before & After</CardTitle>
                  <CardDescription>
                    See the impact of advanced techniques
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Basic Prompt</h4>
                      <div className="aspect-square rounded-lg bg-muted/50 mb-2 relative overflow-hidden">
                        {/* Placeholder for "before" image - in a real app this would be an actual image */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <p className="text-sm text-muted-foreground">Before</p>
                        </div>
                      </div>
                      <code className="text-xs block p-2 bg-muted/30 rounded-md">
                        a landscape with mountains
                      </code>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Enhanced Prompt</h4>
                      <div className="aspect-square rounded-lg bg-muted/50 mb-2 relative overflow-hidden">
                        {/* Placeholder for "after" image - in a real app this would be an actual image */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <p className="text-sm text-muted-foreground">After</p>
                        </div>
                      </div>
                      <code className="text-xs block p-2 bg-muted/30 rounded-md">
                        majestic mountain landscape at sunset, dramatic lighting, volumetric clouds, ultra detailed
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Try It Yourself</CardTitle>
                  <CardDescription>
                    Build your own advanced prompt
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <InteractivePromptBuilder />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Prompt Engineering Section */}
        <section id="prompts" className="mb-24 scroll-mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <Badge variant="outline" className="mb-2">Prompt Engineering</Badge>
            <h2 className="text-3xl font-bold mb-4">Craft Perfect Prompts</h2>
            <p className="text-xl text-muted-foreground">
              The art of writing prompts that consistently produce amazing results.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Prompt Structure</CardTitle>
                <CardDescription>
                  Follow this structure for optimal results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      title: "Subject", 
                      description: "Start with what you want to see (person, object, landscape, etc.)",
                      example: "portrait of a cyberpunk astronaut"
                    },
                    {
                      title: "Details", 
                      description: "Add key details about appearance, setting, action",
                      example: "with neon accents, standing on Mars, holographic HUD"
                    },
                    {
                      title: "Style", 
                      description: "Specify art style, medium, or aesthetic",
                      example: "digital art style, cinematic lighting"
                    },
                    {
                      title: "Quality boosters", 
                      description: "Add terms that enhance quality",
                      example: "highly detailed, 8K resolution, masterpiece"
                    }
                  ].map((section, index) => (
                    <div key={index} className="border-l-2 border-primary/70 pl-4">
                      <h3 className="font-medium text-primary mb-1">{section.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{section.description}</p>
                      <code className="text-xs block p-2 bg-muted/30 rounded-md">
                        {section.example}
                      </code>
                    </div>
                  ))}

                  <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                    <h3 className="font-medium mb-2">Complete example:</h3>
                    <code className="text-sm block">
                      portrait of a cyberpunk astronaut with neon accents, standing on Mars, holographic HUD, digital art style, cinematic lighting, highly detailed, 8K resolution, masterpiece
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Style Keywords</CardTitle>
                  <CardDescription>
                    Use these keywords to influence the style
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {styleKeywords.map((style, i) => (
                      <TooltipProvider key={i}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="secondary"
                              className="text-sm cursor-pointer"
                            >
                              {style}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Click to copy</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quality Enhancers</CardTitle>
                  <CardDescription>
                    Add these to improve image quality
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {qualityKeywords.map((keyword, i) => (
                      <TooltipProvider key={i}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="outline"
                              className="text-sm cursor-pointer"
                            >
                              {keyword}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Click to copy</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Common Mistakes</CardTitle>
                  <CardDescription>
                    Avoid these issues in your prompts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {[
                      "Being too vague or general",
                      "Using too many conflicting styles",
                      "Requesting specific text or words",
                      "Expecting perfect anatomical accuracy",
                      "Overcomplicating with too many details"
                    ].map((mistake, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <X className="h-4 w-4 text-destructive mt-0.5" />
                        <span className="text-sm text-muted-foreground">{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="scroll-mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <Badge variant="outline" className="mb-2">FAQ</Badge>
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground">
              Find answers to common questions about using our platform.
            </p>
          </motion.div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Common Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {faqs.map((faq, index) => (
                      <FaqItem key={index} question={faq.question} answer={faq.answer} />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Still Have Questions?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm">
                      Can't find the answer you're looking for? We're here to help.
                    </p>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact Support
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Github className="h-4 w-4 mr-2" />
                        Visit Our GitHub
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <BookOpenIcon className="h-4 w-4 mr-2" />
                        Read the API Docs
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Join Our Community</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4">
                      Connect with other creators and get inspired.
                    </p>
                    <Button className="w-full">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Join Discord Community
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border/30 py-12 mt-12">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-lg font-medium mb-4">AI Art Documentation</h3>
              <p className="text-muted-foreground">
                This comprehensive guide will help you make the most of our AI image generation platform.
              </p>
              <div className="flex items-center gap-4 mt-6">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Github className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {mainSections.map((section) => (
                  <li key={section.id}>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto"
                      onClick={() => scrollToSection(section.id)}
                    >
                      {section.title}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <Button variant="link" className="p-0 h-auto">
                    API Documentation
                  </Button>
                </li>
                <li>
                  <Button variant="link" className="p-0 h-auto">
                    Discord Community
                  </Button>
                </li>
                <li>
                  <Button variant="link" className="p-0 h-auto">
                    Tutorials
                  </Button>
                </li>
                <li>
                  <Button variant="link" className="p-0 h-auto">
                    Blog
                  </Button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/30 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} AI Art Platform. All rights reserved.
            </p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <Button variant="link" className="text-xs text-muted-foreground p-0 h-auto">
                Terms
              </Button>
              <Button variant="link" className="text-xs text-muted-foreground p-0 h-auto">
                Privacy
              </Button>
              <Button variant="link" className="text-xs text-muted-foreground p-0 h-auto">
                Cookies
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Feature card component
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
      "p-6 h-full relative overflow-hidden rounded-xl border-border/80",
      "hover:shadow-lg hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300",
      "bg-gradient-to-br from-background/95 via-background/98 to-primary/5"
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="flex items-start gap-4 relative">
        <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-medium mb-2 bg-gradient-to-r from-primary via-primary/80 to-foreground bg-clip-text text-transparent">{title}</h3>
          <p className="text-muted-foreground/70 group-hover:text-foreground/80 transition-colors duration-300">{description}</p>
        </div>
      </div>
    </Card>
  </motion.div>
);

export default Documentation;
