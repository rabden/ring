
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import DimensionChooser from './DimensionChooser';
import SettingSection from './settings/SettingSection';
import ModelChooser from './settings/ModelChooser';
import ImageCountChooser from './settings/ImageCountChooser';
import PromptInput from './prompt/PromptInput';
import { usePromptImprovement } from '@/hooks/usePromptImprovement';
import { toast } from 'sonner';
import CreditCounter from '@/components/ui/credit-counter';
import { useLocation } from 'react-router-dom';
import { Textarea } from "@/components/ui/textarea";
import { qualityOptions } from '@/utils/imageConfigs';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const ImageGeneratorSettings = ({
  prompt, setPrompt,
  generateImage,
  model, setModel,
  seed, setSeed,
  randomizeSeed, setRandomizeSeed,
  quality, setQuality,
  useAspectRatio, setUseAspectRatio,
  aspectRatio, setAspectRatio,
  width, setWidth,
  height, setHeight,
  session,
  credits = 0,
  bonusCredits = 0,
  nsfwEnabled, setNsfwEnabled,
  proMode,
  modelConfigs,
  imageCount = 1,
  setImageCount,
  isPrivate,
  setIsPrivate,
  hidePromptOnDesktop = false,
  updateCredits,
  negativePrompt, setNegativePrompt,
  onModelChange,
  onAspectRatioChange
}) => {
  const location = useLocation();
  const isGenerateTab = location.hash === '#imagegenerate';
  const userId = session?.user?.id;
  const { isImproving, improveCurrentPrompt } = usePromptImprovement(userId);
  const creditCost = { "HD": 1, "HD+": 2, "4K": 3 }[quality] * imageCount;
  const totalCredits = (credits || 0) + (bonusCredits || 0);
  const hasEnoughCredits = totalCredits >= creditCost;
  const hasEnoughCreditsForImprovement = totalCredits >= 1;
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleModelChange = (newModel) => {
    const modelConfig = modelConfigs?.[newModel];
    if (modelConfig?.qualityLimits) {
      if (!modelConfig.qualityLimits.includes(quality)) {
        setQuality('HD');
      }
    }
    
    if (onModelChange) {
      onModelChange(newModel);
    } else {
      setModel(newModel);
    }
  };
  
  const handleAspectRatioChange = (newRatio) => {
    if (onAspectRatioChange) {
      onAspectRatioChange(newRatio);
    } else {
      setAspectRatio(newRatio);
    }
  };

  const handleClearPrompt = () => {
    setPrompt('');
  };

  const handleImprovePrompt = async () => {
    if (!prompt?.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    if (!hasEnoughCreditsForImprovement) {
      toast.error('Not enough credits for prompt improvement');
      return;
    }

    await improveCurrentPrompt(prompt, model, modelConfigs, (improvedPrompt) => {
      setPrompt(improvedPrompt);
    });
  };

  const handleGenerate = async () => {
    if (!prompt?.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    if (!hasEnoughCredits) {
      toast.error('Not enough credits');
      return;
    }

    await generateImage();
  };

  return (
    <div className="space-y-4 pb-20 md:pb-4 px-2">
      <div className={hidePromptOnDesktop ? 'md:hidden' : ''}>
        <PromptInput
          prompt={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onSubmit={handleGenerate}
          hasEnoughCredits={hasEnoughCredits}
          onClear={handleClearPrompt}
          onImprove={handleImprovePrompt}
          isImproving={isImproving}
          userId={session?.user?.id}
          credits={credits}
          bonusCredits={bonusCredits}
          seed={seed}
          setSeed={setSeed}
          randomizeSeed={randomizeSeed}
          setRandomizeSeed={setRandomizeSeed}
        />
      </div>

      {isGenerateTab && (
        <div className="flex justify-center w-full mb-2">
          <CreditCounter credits={credits} bonusCredits={bonusCredits} />
        </div>
      )}

      <ModelChooser
        model={model}
        setModel={handleModelChange}
        nsfwEnabled={nsfwEnabled}
        proMode={proMode}
        modelConfigs={modelConfigs}
      />

      <SettingSection label="Dimensions">
        <DimensionChooser 
          aspectRatio={aspectRatio} 
          setAspectRatio={handleAspectRatioChange}
          quality={quality}
          setQuality={setQuality}
          proMode={proMode}
          qualityLimits={modelConfigs?.[model]?.qualityLimits}
        />
      </SettingSection>

      <ImageCountChooser
        count={imageCount}
        setCount={setImageCount}
      />

      {modelConfigs[model]?.use_negative_prompt && (
        <SettingSection label="Negative Prompt">
          <Textarea
            placeholder={modelConfigs[model]?.default_negative_prompt || "Enter negative prompt..."}
            className="resize-none"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
          />
        </SettingSection>
      )}

      <SettingSection label="Seed">
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            value={seed}
            onChange={(e) => setSeed(parseInt(e.target.value))}
            disabled={randomizeSeed}
          />
          <div className="flex items-center space-x-2">
            <Switch
              id="randomizeSeed"
              checked={randomizeSeed}
              onCheckedChange={setRandomizeSeed}
            />
            <Label htmlFor="randomizeSeed">Random</Label>
          </div>
        </div>
      </SettingSection>
    </div>
  );
};

export default ImageGeneratorSettings;
