import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Lock, ChevronRight, Check } from "lucide-react";
import SettingSection from './SettingSection';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MeshGradient } from "@/components/ui/mesh-gradient";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

// Current card style for selected model
const ModelCard = ({ modelKey, config, isActive, showRadio = false, onClick, disabled, proMode }) => (
  <div
    className={cn(
      "flex items-center p-2 border border-border/60 rounded-xl gap-3 transition-all duration-200 relative overflow-hidden",
      isActive ? "bg-card shadow-[0_0_0_1px_rgba(var(--primary),.15)]" : "border border-border/80 hover:bg-muted/5 hover:border-border/20 p-3 rounded-xl",
      "bg-background",
      disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-[0.98]"
    )}
    onClick={disabled ? undefined : onClick}
  >
    {isActive && (
      <MeshGradient 
        className="absolute inset-0"
        intensity="medium"
        speed="fast"
        size={500}
      />
    )}
    <div className="relative h-10 w-10 rounded-md overflow-hidden bg-background flex-shrink-0 ring-1 ring-border/5">
      <img
        src={config.image}
        alt={config.name}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </div>
    <div className="flex-1 min-w-0 relative">
      <div className="flex items-center gap-2">
        <span className="font-medium text-sm text-foreground/90">{config.name}</span>
        {config.isPremium && !proMode && <Lock className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/70" />}
      </div>
      <p className="text-xs text-muted-foreground/60 truncate mt-0.5">
        {config.tagline || (config.category === "NSFW" ? "NSFW Generation" : "Image Generation")}
      </p>
    </div>
    <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/50 relative" />
  </div>
);

// New grid card style for dropdown/drawer
const ModelGridCard = ({ modelKey, config, isActive, onClick, disabled, proMode }) => (
  <div
    className={cn(
      "group relative aspect-square rounded-xl overflow-hidden transition-all duration-200",
      "border border-border/80 bg-card",
      isActive ? "ring-2 ring-primary/20 border-primary/30" : "hover:border-border/20",
      disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
    )}
    onClick={disabled ? undefined : onClick}
  >
    <img
      src={config.image}
      alt={config.name}
      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
    />
    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
    
    {/* Content */}
    <div className="absolute bottom-0 left-0 right-0 p-2.5">
      <div className="flex items-center gap-1.5">
        <span className="font-medium text-white/95 truncate text-xs">{config.name}</span>
        {config.isPremium && !proMode && <Lock className="h-3 w-3 flex-shrink-0 text-white/80" />}
      </div>
    </div>

    {/* Active indicator */}
    {isActive && (
      <div className="absolute top-2 right-2 h-6 w-6 rounded-md bg-background text-white flex items-center justify-center">
        <Check className="h-3.5 w-3.5" />
      </div>
    )}
  </div>
);

const GroupSelector = ({ groups, activeGroup, onGroupChange }) => (
  <div className="flex gap-1 px-2 py-1 mb-1 overflow-x-auto  scrollbar-thin scrollbar-thumb-border/50 scrollbar-track-transparent">
    <Button
      size="sm"
      variant={activeGroup === "all" ? "default" : "outline"}
      className="h-7 px-2 text-xs rounded-full flex-shrink-0"
      onClick={() => onGroupChange("all")}
    >
      All
    </Button>
    {groups.map((group) => (
      <Button
        key={group}
        size="sm"
        variant={activeGroup === group ? "default" : "outline"}
        className="h-7 px-2 text-xs rounded-full flex-shrink-0"
        onClick={() => onGroupChange(group)}
      >
        {group}
      </Button>
    ))}
  </div>
);

const ModelGrid = ({ filteredModels, model, setModel, proMode, className, onClose }) => {
  const scrollAreaRef = React.useRef(null);
  const activeCardRef = React.useRef(null);
  const [activeGroup, setActiveGroup] = useState("all");

  // Get unique groups from filtered models
  const groups = useMemo(() => {
    const groupSet = new Set(filteredModels.map(([_, config]) => config.group));
    return Array.from(groupSet).sort();
  }, [filteredModels]);

  // Filter models by active group
  const groupFilteredModels = useMemo(() => {
    if (activeGroup === "all") return filteredModels;
    return filteredModels.filter(([_, config]) => config.group === activeGroup);
  }, [filteredModels, activeGroup]);

  // Scroll to active model when grid is mounted or group changes
  React.useEffect(() => {
    if (activeCardRef.current && scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      const activeCard = activeCardRef.current;
      
      // Get the scroll container's and active card's dimensions
      const scrollRect = scrollArea.getBoundingClientRect();
      const cardRect = activeCard.getBoundingClientRect();
      
      // Calculate the scroll position to center the active card
      const scrollTop = cardRect.top - scrollRect.top - (scrollRect.height - cardRect.height) / 2;
      
      // Smooth scroll to the active card
      scrollArea.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
    }
  }, [model, activeGroup]);

  const handleModelSelect = (modelKey) => {
    setModel(modelKey);
    onClose?.();
  };

  return (
    <div className="flex flex-col h-full">
      <GroupSelector 
        groups={groups}
        activeGroup={activeGroup}
        onGroupChange={setActiveGroup}
      />
      <ScrollArea 
        ref={scrollAreaRef}
        className={cn(
          "flex-1 overflow-y-auto px-1",
          "scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent hover:scrollbar-thumb-border/50",
          className
        )}
      >
        <div className="grid grid-cols-2 gap-2 rounded-3xl pb-1">
          {groupFilteredModels.map(([key, config]) => (
            <div 
              key={key}
              ref={model === key ? activeCardRef : null}
            >
              <ModelGridCard
                modelKey={key}
                config={config}
                isActive={model === key}
                proMode={proMode}
                onClick={() => handleModelSelect(key)}
                disabled={config.isPremium && !proMode}
              />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

const ModelChooser = ({ model, setModel, proMode, nsfwEnabled, modelConfigs }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  
  // Filter models based on NSFW state
  const filteredModels = useMemo(() => {
    if (!modelConfigs) return [];
    
    // Get all models as entries
    const allModels = Object.entries(modelConfigs);
    
    // Filter based on NSFW state
    return allModels.filter(([_, config]) => {
      if (nsfwEnabled) {
        return config.category === "NSFW";
      }
      return config.category === "General";
    });
  }, [nsfwEnabled, modelConfigs]);

  // Default model for each mode
  const defaultModel = useMemo(() => {
    return nsfwEnabled ? 'nsfwMaster' : 'fluxDev';
  }, [nsfwEnabled]);

  // Handle model selection
  const handleModelSelection = useCallback((newModel) => {
    const modelData = modelConfigs?.[newModel];
    if (!modelData) return;

    const isCorrectCategory = nsfwEnabled 
      ? modelData.category === "NSFW"
      : modelData.category === "General";

    if (isCorrectCategory) {
      setModel(newModel);
      setIsDrawerOpen(false);
    }
  }, [nsfwEnabled, setModel, modelConfigs]);

  // Ensure current model is valid for NSFW state
  useEffect(() => {
    const currentModel = modelConfigs?.[model];
    if (!currentModel || currentModel.category !== (nsfwEnabled ? "NSFW" : "General")) {
      setModel(defaultModel);
    }
  }, [nsfwEnabled, model, defaultModel, setModel, modelConfigs]);

  const currentModel = modelConfigs?.[model];
  if (!currentModel) return null;

  return (
    <SettingSection 
      label="Model" 
      tooltip="Choose between fast generation or higher quality output."
    >
      {/* Desktop: Popover */}
      <div className="hidden md:block">
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <div className="w-full group">
              <ModelCard
                modelKey={model}
                config={currentModel}
                isActive={true}
                proMode={proMode}
                onClick={() => {}}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent 
            side="left"
            align="center"
            sideOffset={16}
            className="w-[600px] p-1 px-0 h-[90vh] border-border/80 bg-secondary rounded-3xl overflow-hidden my-[5vh]"
          >
            <ModelGrid 
              filteredModels={filteredModels}
              model={model}
              setModel={handleModelSelection}
              proMode={proMode}
              onClose={() => setIsPopoverOpen(false)}
              className="h-full rounded-3xl"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Mobile: Drawer */}
      <div className="md:hidden">
        <div className="w-full group" onClick={() => setIsDrawerOpen(true)}>
          <ModelCard
            modelKey={model}
            config={currentModel}
            isActive={true}
            proMode={proMode}
            onClick={() => {}}
          />
        </div>
        <Drawer 
          open={isDrawerOpen} 
          onOpenChange={setIsDrawerOpen}
        >
          <DrawerContent className="focus:outline-none">
            <DrawerHeader className="border-b border-border/5 px-2 py-2">
              <DrawerTitle className="text-base font-medium text-foreground/90">Select Model</DrawerTitle>
            </DrawerHeader>
            <div className="px-3 py-2">
              <ModelGrid 
                filteredModels={filteredModels}
                model={model}
                setModel={handleModelSelection}
                proMode={proMode}
                onClose={() => setIsDrawerOpen(false)}
                className="max-h-[70vh]"
              />
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </SettingSection>
  );
};

export default ModelChooser;